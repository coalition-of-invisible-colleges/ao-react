import _ from 'lodash'
import Vue from 'vue'
import Vuex from 'vuex'

import modules from './modules'

import loader from './modules/loader'
import eventstream from './modules/eventstream'
import recent from './modules/recent'
import upgrades from './modules/upgrades'
import context from './modules/context'

import calculations from './calculations'

Vue.use(Vuex)

function subDeck(tasks, state, getters){
    let subTasks = []
    tasks.forEach(t => {
        let task = getters.hashMap[t]
        if (task){
            subTasks = subTasks.concat(task.subTasks)
        }
    })
    return subTasks
}

export default new Vuex.Store({
  modules: {
      loader, eventstream, recent, upgrades, context,
      members: modules.members,
      tasks: modules.tasks,
      resources: modules.resources,
      cash: modules.cash,
      sessions: modules.sessions,
  },
  getters: {
      memberCard(state, getters){
          let memberCard = _.merge({
              taskId: '1', name: '', completed: [], subTasks: [], priorities: [], book: {}, deck: [], passed: [], claimed: []
          }, getters.hashMap[getters.member.memberId])
          return memberCard
      },
      contextCard(state, getters){
          let contextCard = _.merge({
              taskId: '1', name: '', completed: [], subTasks: [], priorities: [], book: {}, deck: [], passed: [], claimed: []
          }, getters.hashMap[state.context.panel[state.context.top]])
          return contextCard
      },
      contextDeck(state, getters){
          return getters.contextCard.subTasks.slice().reverse().map(t => getters.hashMap[t]).filter(t => !!t && t.color )
      },
      contextCompleted(state, getters){
          return getters.contextCard.completed.map(t => getters.hashMap[t])
      },
      contextMember(state, getters){
          let contextMem = false
          state.members.some(m => {
              if (m.memberId === getters.contextCard.taskId){
                  contextMem = m
              }
          })
          return contextMem
      },
      contextResource(state, getters){
        let contextRes = false
        state.resources.some(r => {
            if (r.resourceId === getters.contextCard.taskId){
                contextRes = r
            }
        })
        return contextRes
      },
      getPriorities(state, getters){
          let p = []
          if (getters.contextCard && getters.contextCard.priorities){
              p =  getters.contextCard.priorities
          }
          return p
      },
      completed(state, getters){
          return getters.memberCard.completed.map(t => getters.hashMap[t])
      },
      red(state, getters){
          if (state.context.completed){
              return getters.contextCompleted.filter(d => d.color === 'red')
          }
          return getters.contextDeck.filter(d => d.color === 'red')
      },
      yellow(state, getters){
          if (state.context.completed){
              return getters.contextCompleted.filter(d => d.color === 'yellow')
          }
          return getters.contextDeck.filter(d => d.color === 'yellow')
      },
      green(state, getters){
          if (state.context.completed){
              return getters.contextCompleted.filter(d => d.color === 'green')
          }
          return getters.contextDeck.filter(d => d.color === 'green')
      },
      purple(state, getters){
          if (state.context.completed){
              return getters.contextCompleted.filter(d => d.color === 'purple')
          }
          return getters.contextDeck.filter(d => d.color === 'purple')
      },
      blue(state, getters){
          if (state.context.completed){
              return getters.contextCompleted.filter(d => d.color === 'blue')
          }
          return getters.contextDeck.filter(d => d.color === 'blue')
      },
      sortedMembers(state, getters){
          return getters.recentMembers.slice().sort((a, b) => {
              let cardA = getters.hashMap[a.memberId]
              let cardB = getters.hashMap[b.memberId]
              if(cardA.deck.length < cardB.deck.length) return 1
              if(cardA.deck.length === cardB.deck.length) return 0
              return -1
          })
      },
      bounties(state, getters){
          let bountyList = []
          let bounties = {}
          state.tasks.forEach( t => {
              if (Array.isArray(t.allocations)){
                  t.allocations.forEach( al => {
                      if ( bounties[al.allocatedId] ) {
                          bounties[al.allocatedId] += parseInt(al.amount)
                      } else {
                          bounties[al.allocatedId] = parseInt(al.amount)
                      }
                  })
              }
          })

          console.log("got bounties: ", bounties)

          Object.keys(bounties).forEach(b => {

              let card = getters.hashMap[b]
              let amount =  bounties[b]
              console.log("setting amount", amount, card)
              if (amount >= 1){
                  Vue.set( card, 'currentAmount', amount )
                  bountyList.push(card)
              }
          })

          bountyList.sort((a, b) => parseInt(a.currentAmount) < parseInt(b.currentAmount))

          return bountyList
      },
      hashMap(state){
          let hashMap = {}
          state.tasks.forEach(t => {
              Vue.set(hashMap, t.taskId, t)
          })
          return hashMap
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
          console.log("\n\narchive function")
          let archive = getters.hodld
          console.log("archive.length is ", archive.length, " archive is", archive)

          if (getters.memberCard){
            let starter = getters.memberCard.subTasks.concat(getters.memberCard.priorities).concat(getters.memberCard.completed)
            console.log("starter.length is ", starter.length, " starter is", starter)
            archive = _.filter(archive, t => starter.indexOf(t.taskId) === -1 )
            console.log("archive.length is", archive, " and archive is ", archive)
            let crawler = subDeck(starter, state, getters)
            console.log("crawler.length is ", crawler.length, " crawler is", crawler)

            let history = []
            let newCards = false
            do{
              newCards = crawler.some(t => history.indexOf(t) === -1)
              archive = _.filter(archive, t => !(crawler.indexOf(t.taskId) > -1))
              history = history.concat(crawler)
              crawler = subDeck(crawler, state, getters)
              console.log("newCards is ", newCards, ", archive.length is ", archive.length, " history.length is ", history.length, ", crawler.length is ", crawler.length)
            }while(crawler.length > 0 && newCards)
            archive = _.filter(archive, st => !archive.some(t => t.subTasks.concat(t.priorities).concat(t.completed).indexOf(st.taskId) > -1))
          }

          return archive
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
              let l = uniqueG.indexOf(c.guild)
              if (l === -1){
                  guilds.push(c)
                  uniqueG.push(c.guild)
              } else {
                  let o = guilds[l]
                  if (o.deck.length <= c.deck.length){
                      guilds[l] = c
                  }
              }
          })
          guilds.sort( (a, b) => {
              let aVal = a.deck.length
              let bVal = b.deck.length
              return bVal - aVal
          })

          if (guilds.length > 9){
              return guilds.slice(0,9)
          }

          return guilds
      },
      pubguildIds(state, getters){
          return getters.pubguilds.map(p => p.taskId)
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
                  console.log("found member! ", memberId)
              }
          })

          state.members.forEach( m => {
              if (m.memberId === memberId) {
                  _.assign(loggedInMember, m)
                  console.log("this member is logged-in! ", memberId)
              }
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
          if (getters.isLoggedIn){
              state.tasks.forEach(t => {
                  t.passed.forEach(p => {
                      if (p[1] ===  getters.member.memberId){
                          passedToMe.push(t)
                      }
                  })
              })
          }
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
      },
      recentMembers(state, getters){
          let recentMembers = state.members.slice()

          recentMembers.sort((a, b) => {
              return b.lastUsed - a.lastUsed
          })
          return recentMembers
      },
      membersVouches(state, getters){
          let members = state.members.slice()
          let vouches = []

          members.forEach(m => {
              let memberCard = getters.hashMap[m.memberId]
              memberCard.deck.forEach(v => {
                  let prevCount = vouches.find(c => c.memberId === v)
                  if(!prevCount) {
                      vouches.push({ memberId: v, count: 0 })
                  } else {
                      prevCount.count++
                  }
              })
          })
          return vouches
      }
  },
  middlewares: [],
  strict: process.env.NODE_ENV !== 'production'
})
