import _ from 'lodash'
import Vue from 'vue'
import Vuex from 'vuex'

import modules from './modules'

import loader from './modules/loader'
import eventstream from './modules/eventstream'
import recent from './modules/recent'

import calculations from './calculations'

Vue.use(Vuex)

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
          let allGuilds = []
          state.tasks.forEach( t => {
              if (t.guild) {
                  allGuilds.push(t)
              }
          })

          let sortedByHolders = allGuilds.sort((a, b) => {
              let aVal = a.deck.length
              let bVal = b.deck.length
              return aVal < bVal
          })

          let guilds = []
          let uniqueG = []
          sortedByHolders.forEach((c, i) => {
              if (i > 5 && c.deck.length < 5){
                  return
              }
              if (uniqueG.indexOf(c.guild) === -1){
                  guilds.push(c)
                  uniqueG.push(c.guild)
              }
          })

          console.log("got from total: ", guilds.length, "  from  ",  allGuilds.length)
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
