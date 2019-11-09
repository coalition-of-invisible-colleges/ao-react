import _ from 'lodash'
import Vue from 'vue'
import Vuex from 'vuex'

import modules from './modules'

import loader from './modules/loader'
import eventstream from './modules/eventstream'
import upgrades from './modules/upgrades'
import context from './modules/context'

import calculations from './calculations'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
      loader, eventstream, upgrades, context,
      ao: modules.ao,
      members: modules.members,
      tasks: modules.tasks,
      resources: modules.resources,
      cash: modules.cash,
      sessions: modules.sessions,
  },
  getters: {
      warpDrive(state, getters){
          return state.ao[state.upgrades.warp]
      },
      memberCard(state, getters){
          let memberCard = _.merge({
              taskId: '', name: '', completed: [], subTasks: [], priorities: [], book: {}, deck: [], passed: [], claimed: []
          }, getters.hashMap[getters.member.memberId])
          return memberCard
      },
      contextCard(state, getters){
          let contextCard = _.merge({
              taskId: '', name: '', completed: [], subTasks: [], priorities: [], book: {}, deck: [], passed: [], claimed: []
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
      hodlersByCompletions(state, getters){
          let checkmarks = getters.contextCompleted
          let hodlers = {}
          let holds = []
          checkmarks.forEach(c => {
              c.claimed.forEach(mId => {
                  if(!hodlers[mId]){
                      hodlers[mId] = []
                  }
                  hodlers[mId].push(c)
              })
          })
          Object.keys(hodlers).forEach(mId => {
              let member = getters.hashMap[mId]
              member.contextCompletions = hodlers[mId]
              holds.push(member)
          })
          return holds
      },
      all(state, getters){
          if (state.context.completed){
              return getters.contextCompleted
          }
          return getters.contextDeck
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
      totalBounties(state,getters){
          let total = 0
          getters.bounties.forEach(t => {
              total += parseFloat( t.currentAmount )
          })
          return total
      },
      hashMap(state){
          let hashMap = {}
          state.tasks.forEach(t => {
              Vue.set(hashMap, t.taskId, t)
          })
          return hashMap
      },
      connectionUris(state, getters){
          return state.cash.info.address.map(a => {
              return state.cash.info.id + "@" + a.address + ":" + a.port
          })
      },
      memberIds(state, getters){
          return state.members.map(c => c.memberId)
      },
      resourceIds(state, getters){
          return state.resources.map(c => c.resourceId)
      },
      myGuilds(state, getters){
          let my = state.tasks.filter(t => {
              if(!t.guild) return false
              if(t.deck.indexOf(getters.member.memberId) === -1) {
                return false
              }
              return true
          })
          my = _.filter(my, st => !my.some(t => t.subTasks.concat(t.priorities, t.completed).indexOf(st.taskId) > -1))
          my.forEach(g => {
              g.tempLastClaimed = 0
              let completions = g.completed.map(t => getters.hashMap[t])
              completions.forEach(c => {
                  if(c.lastClaimed > g.tempLastClaimed) {
                      g.tempLastClaimed = c.lastClaimed
                  }
              })
          })
          my.sort((a, b) => {
              return b.tempLastClaimed - a.tempLastClaimed
          })
          return my
      },
      pubguilds(state, getters){
          let guilds = []
          let uniqueG = []
          state.tasks.forEach((c, i) => {
              if (c.guild){
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
              }
          })
          guilds = _.filter(guilds, st => !guilds.some(t => t.subTasks.concat(t.priorities, t.completed).indexOf(st.taskId) > -1))
          guilds.sort( (a, b) => {
              let aVal = a.deck.length
              let bVal = b.deck.length
              return bVal - aVal
          })

          if (guilds.length > 11){
              return guilds.slice(0,11)
          }

          return guilds
      },
      sendableGuilds(state, getters) {
          let guilds = _.filter(getters.myGuilds, st => !getters.pubguilds.some(t => { return t.taskId === st.taskId } ))
          guilds = getters.pubguilds.concat(guilds)
          guilds.forEach(g => {
              g.subTasks.concat(g.priorities, g.completed).forEach(p => {
                  let task = getters.hashMap[p]
                  if(!task) {
                      console.log("null taskId found, this means cleanup is not happening elsewhere and is very bad")
                  } else if(task.guild) {
                      task.subTasks.concat(task.priorities, task.completed).forEach(sp => {
                          let subtask = getters.hashMap[sp]
                          if(!subtask) {
                              console.log("null subtaskId found, this means cleanup is not happening elsewhere and is very bad")
                          } else if(subtask.guild) {
                              if(!task.guilds) {
                                  task.guilds = []
                              }
                              if(task.guilds.indexOf(subtask) === -1) {
                                  task.guilds.push(subtask)
                              }
                          }
                      })
                      if(!g.guilds) {
                          g.guilds = []
                      }
                      if(g.guilds.indexOf(task) === -1) {
                          g.guilds.push(task)
                      }
                  }
              })
          })
          return guilds
      },
      pubguildEvents(state, getters){
          let allTasks = []
          let fullTasks = []
          getters.pubguilds.forEach(p => {
              let guildsSubs = p.subTasks.concat(p.priorities).concat(p.completed)

              fullTasks.push(p)
              fullTasks = fullTasks.concat( guildsSubs.map(tId => {
                  let t = getters.hashMap[tId]
                  if(!t) {
                  } else {
                    t.funderGuild = p.guild
                  }
                  return t
                  })
              )
          })
          let evs = fullTasks.filter(t => {
              return (t && t.book && t.book.startTs)
          })
          return evs
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
              if (m.memberId === memberId) {
                  _.assign(loggedInMember, m)
              }
          })
          return loggedInMember
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
      totalWallet(state, getters){
          return parseInt( getters.totalLocal ) +  parseInt( getters.confirmedBalance )
      },
      satPointSpot(state, getters){
          return calculations.cadToSats(1, state.cash.spot)
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
      },
  },
  middlewares: [],
  strict: process.env.NODE_ENV !== 'production'
})
