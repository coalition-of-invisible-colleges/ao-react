import _ from 'lodash'
import Vue from 'vue'
import Vuex from 'vuex'

import modules from './modules'

import loader from './modules/loader'
import eventstream from './modules/eventstream'
import recent from './modules/recent'

import calculations from './calculations'

Vue.use(Vuex)

function fullDeck(subTasks, allTasks = [], state, getters){
      subTasks.forEach(tId => {
          let task = state.tasks.filter( t => tId === t.taskId)[0]
          if(task) {
              if(allTasks.indexOf(task) === -1) {
                  allTasks.push(task)
              } else {
                  return allTasks
              }

              let allSubTasks = []
              if(task.subTasks && task.subTasks.length > 0) {
                  allSubTasks = fullDeck(task.subTasks, allTasks, state, getters)
              }
              let newSubTasks = []
              allSubTasks.forEach(st => {
                if(allTasks.filter(t => t.taskId === st.taskId).length === 0) {
                    newSubTasks.push(st)
                }
              })
              if(newSubTasks.length === 0 && allSubTasks.length > 0) {
                  return allTasks
              }
              allTasks = allTasks.concat(newSubTasks)
          }
      })
      return allTasks
}

export default new Vuex.Store({
  modules: {
      loader, eventstream, recent,
      members: modules.members,
      tasks: modules.tasks,
      resources: modules.resources,
      cash: modules.cash,
      sessions: modules.sessions,
  },
  getters: {
      bounties(state, getters){
          return state.tasks.filter( t => {
              return calculations.calculateTaskPayout(t) > 1
          })
      },
      hashMap(state){
          let hashMap = {}
          state.tasks.forEach(t => {
              Vue.set(hashMap, t.taskId, t)
          })
          return hashMap
      },
      memberCard(state, getters){
          return getters.hashMap[getters.member.memberId]
      },
      channels(state, getters){
          return state.cash.channels
      },
      memberIds(state, getters){
          return state.members.map(c => c.memberId)
      },
      resourceIds(state, getters){
          return state.resources.map(c => c.resourceId)
      },
      recurasaurus(state, getters){
          console.log("recursasaurus")
          let tasks = getters.hodld
          let subTaskIds = getters.memberCard.subTasks

          let fd = fullDeck(subTaskIds, [], state, getters)

          let notInDeck = []
          tasks.forEach(t => {
            if(fd.filter(t2 => t2.taskId === t.taskId).length === 0) {
              notInDeck.push(t)
            }
          })
          let fullNotInDeck = []
          notInDeck.forEach( t => {
              fullNotInDeck = fullNotInDeck.concat(fullDeck(t.subTasks,[], state, getters))
          })

          let condensedNotInDeck = []
          notInDeck.forEach(t => {
            if(fullNotInDeck.filter(t2 => t2.taskId === t.taskId).length === 0) {
              condensedNotInDeck.push(t)
            }
          })
          return condensedNotInDeck.slice()
      },
      withinHeld(state, getters){
          let w = []
          getters.held.forEach( t => {
              t.subTasks.forEach( st => {
                  w.push(st)
              })
          })
          return w
      },
      archive(state, getters){
          return []
      },
      withinHodld(state, getters){
          let w = []
          getters.hodld.forEach(t => {
              w = w.concat(t.subTasks)
          })
          return w
      },
      hodld(state, getters){
          let hodld = []
          state.tasks.forEach( t => {
              if(t.deck.indexOf(getters.member.memberId) > -1){
                hodld.push(t)
              }
          })
          return hodld
      },
      eternalVoid(state, getters){
          let void_orphans = getters.unheld.filter( t => {
              let notHeld = getters.withinHeld.indexOf(t.taskId) === -1
              let notMember = !state.members.some(m => m.memberId === t.taskId)
              let notResource = !state.resources.some(r => r.resourceId === t.taskId)
              return notHeld && notMember && notResource
          })
          return void_orphans
      },
      unheld(state, getters){
          return state.tasks.filter(t => t.deck.length === 0)
      },
      held(state, getters){
          return state.tasks.filter(t => t.deck.length > 0 || t.guild)
      },
      guilds(state, getters){
          return state.tasks.filter(t => t.guild)
      },
      pubguilds(state, getters){
          let guilds = []
          let uniqueG = []
          getters.guilds.forEach((c, i) => {
              if (c.deck.length < 5 && guilds.length >= 5){
                  return
              }

              if (uniqueG.indexOf(c.guild) === -1){
                  guilds.push(c)
                  uniqueG.push(c.guild)
              }
          })
          guilds.sort( (a, b) => {
              let aVal = a.deck.length
              let bVal = b.deck.length
              return bVal - aVal
          })
          return guilds
      },
      isLoggedIn(state, getters){
          let isLoggedIn = !!getters.member.memberId
          return isLoggedIn
      },
      member(state, getters){
          let loggedInMember = {}
          let memberId = false
          state.sessions.forEach(session => {
              if (state.loader.session === session.session){
                  memberId = session.ownerId
              }
          })

          state.members.forEach( m => {
              if (m.memberId === memberId) _.assign(loggedInMember, m)
          })
          return loggedInMember
      },
      activeMembers(state, getters){
          return state.members.filter(m => m.active > 0 )
      },
      perMonth(state, getters){
          let fixed = parseFloat(state.cash.rent)
          let numActiveMembers = getters.activeMembers.length
          let perMonth = fixed / numActiveMembers
          return  perMonth.toFixed(2)
      },
      inbox(state, getters){
          let passedToMe = []
          let tasks = state.tasks.forEach(t => {
              t.passed.forEach(p => {
                  if (p[1] ===  getters.member.memberId){
                      passedToMe.push(t)
                  }
              })
          })
          return passedToMe
      },
      confirmedBalance(state, getters){
          let confirmedBalance = 0
          state.cash.outputs.forEach(o => {
              confirmedBalance += o.value
          })
          return confirmedBalance
      },
      totalLocal(state, getters){
          let totalLocal = 0
          state.cash.channels.forEach(c => {
              totalLocal += c.channel_sat
          })
          return totalLocal
      },
      totalRemote(state, getters){
          let totalRemote = 0
          state.cash.channels.forEach(c => {
              totalRemote += (c.channel_total_sat - c.channel_sat)
          })
          return totalRemote
      }

  },
  middlewares: [],
  strict: process.env.NODE_ENV !== 'production'
})
