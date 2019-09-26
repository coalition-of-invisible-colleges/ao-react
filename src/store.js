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

export default new Vuex.Store({
  modules: {
      loader, eventstream, recent, upgrades, context,
      ao: modules.ao,
      members: modules.members,
      tasks: modules.tasks,
      resources: modules.resources,
      cash: modules.cash,
      sessions: modules.sessions,
  },
  getters: {
      warpAddress(state, getters){
          return state.ao[state.upgrades.warp].address
      },
      warpGuilds(state, getters){
          let warpState = state.ao[state.upgrades.warp].state
          return warpState.tasks.filter(t => t.guild)
      },
      warpMembers(state, getters){
          let warpState = state.ao[state.upgrades.warp].state
          return warpState.members
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
          console.log("holds is", holds)
          holds.sort((a, b) => {
              console.log("a is ", a, " and b is ", b)
              return b.contextCompletions.length - a.contextCompletions.length
          })
          console.log("post, holds is", holds)
          return holds
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
          let guilds = {}
          state.tasks.forEach( t => {
              if (Array.isArray(t.allocations)){
                  t.allocations.forEach( al => {
                      if ( bounties[al.allocatedId] ) {
                          if (t.guild){
                              bounties[al.allocatedId] += parseInt(al.amount)
                              guilds[al.allocatedId].push(t.taskId)
                          }
                      } else {
                          if (t.guild){
                              bounties[al.allocatedId] = parseInt(al.amount)
                              guilds[al.allocatedId] = [t.taskId]
                          }
                      }
                  })
              }
          })

          Object.keys(bounties).forEach(b => {
              let card = getters.hashMap[b]
              let amount =  bounties[b]
              if (amount >= 1){
                  Vue.set( card, 'currentAmount', amount )
                  Vue.set( card, 'funders', guilds[b] )
                  bountyList.push(card)
              }
          })

          bountyList.sort((a, b) => parseInt(a.currentAmount) < parseInt(b.currentAmount))

          return bountyList
      },
      totalBounties(state,getters){
          let total = 0
          getters.bounties.forEach(t => {
              total += parseFloat( t.currentAmount )
          })
          return total
      },
      taskByBoost(state, getters){
          let members = []
          let guilds = []
          let resources = []
          let cards = []

          state.tasks.forEach(t => {

              if( t.boost > 0 ){
                  if (getters.memberIds.indexOf(t.taskId) > -1){
                    members.push(t)
                  } else if (getters.resourceIds.indexOf(t.taskId) > -1) {
                    console.log("card is a resource: ", t, getters.resourceIds.length)

                    resources.push(t)
                  } else if (t.guild) {
                    guilds.push(t)
                  } else {
                    cards.push(t)
                  }
              }

          })

          members.sort((a, b) => parseInt(a.boost) < parseInt(b.boost))
          guilds.sort((a, b) => parseInt(a.boost) < parseInt(b.boost))
          resources.sort((a, b) => parseInt(a.boost) < parseInt(b.boost))
          cards.sort((a, b) => parseInt(a.boost) < parseInt(b.boost))

          console.log("calculated tasks by boost", members.length, guilds.length, resources.length, cards.length)

          return { members, guilds, cards, resources }
      },
      totalPoints(state, getters){
          let totalMembers = 0
          let totalGuilds = 0
          let totalCards = 0
          let totalResources = 0
          getters.taskByBoost.members.forEach(t => {
              totalMembers += parseFloat( t.boost )
          })
          getters.taskByBoost.guilds.forEach(t => {
              totalGuilds += parseFloat( t.boost )
          })
          getters.taskByBoost.resources.forEach(t => {
              totalResources += parseFloat( t.boost )
          })
          getters.taskByBoost.cards.forEach(t => {
              totalCards += parseFloat( t.boost )
          })
          return {
              totalMembers,
              totalGuilds,
              totalResources,
              totalCards,
          }
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
        let archive = getters.hodld
        let crawler = [getters.memberCard.taskId].concat(getters.myGuilds.map(t => t.taskId))
        let deck = []
        let history = []
        let newCards = []
        do {
          newCards = []
          crawler = _.filter(crawler, t => {
            if(deck.concat(history).indexOf(t) > -1) return false
            let task = getters.hashMap[t]
            if(task === undefined || task.subTasks === undefined || task.priorities === undefined || task.completed === undefined) return false

            if(task.deck.indexOf(getters.member.memberId) > -1) {
              deck.push(t)
            } else {
              history.push(t)
            }
            newCards = newCards.concat(task.subTasks).concat(task.priorities).concat(task.completed)
            return true
          })
          crawler = newCards
        } while(crawler.length > 0)
        archive = _.filter(archive, st => deck.indexOf(st.taskId) === -1)
        archive = _.filter(archive, st => !archive.some(t => t.subTasks.concat(t.priorities).concat(t.completed).indexOf(st.taskId) > -1))
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
      myGuilds(state, getters){
          let my = state.tasks.filter(t => {
              if(!t.guild) return false
              if(t.deck.indexOf(getters.member.memberId) === -1) {
                return false
              }
              return true
          })
          console.log("my is ", my)
          my.forEach(g => {
              g.tempLastClaimed = 0
              let completions = g.completed.map(t => getters.hashMap[t])
              completions.forEach(c => {
                  if(c.lastClaimed > g.tempLastClaimed) {
                      console.log("newer checkmark found")
                      g.tempLastClaimed = c.lastClaimed
                  }
              })
          })
          my.sort((a, b) => {
              console.log("sort is ", b.tempLastClaimed - a.tempLastClaimed)
              return b.tempLastClaimed - a.tempLastClaimed
          })
          return my
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

          if (guilds.length > 11){
              return guilds.slice(0,11)
          }

          return guilds
      },
      pubguildEvents(state, getters){
          let allTasks = []
          let fullTasks = []
          getters.pubguilds.forEach(p => {
              let guildsSubs = p.subTasks.concat(p.priorities).concat(p.completed)

              fullTasks = fullTasks.concat( guildsSubs.map(tId => {
                  let t = getters.hashMap[tId]
                  if(!t) {
                    console.log("bad tId: ", tId)
                  } else {
                    t.funderGuild = p.guild
                  }
                  return t
                  })
              )
          })

          console.log("collected ", fullTasks.length, "tasks")

          let evs = fullTasks.filter(t => {
              return (t && t.book && t.book.startTs)
          })

          console.log("returning  ", evs.length, "tasks")

          return evs
      },
      pubguildIds(state, getters){
          return getters.pubguilds.map(p => p.taskId)
      },
      pubguildsSubCards(state, getters){
          return true
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
      totalWallet(state, getters){
          return parseInt( getters.totalLocal ) +  parseInt( getters.confirmedBalance )
      },
      satPointSpot(state, getters){
          return calculations.cadToSats(1, state.cash.spot)
      },
      satPoint(state, getters){
          let sats = getters.totalWallet / (getters.totalPoints + getters.totalBounties)
          return parseInt(sats)
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
      },
      memberPriorities(state, getters) {
          let news = []
          getters.memberIds.forEach(mId => {
              let member = getters.hashMap[mId]
              member.priorities.forEach(p => {
                  let priority = getters.hashMap[p]
                  if(news.indexOf(priority) > -1) {
                      news[p].weight += 1 / member.priorities.length
                  }
                  priority.weight = 1 / member.priorities.length
                  news.push(priority)
              })
          })
          news.sort((a, b) => {
              return b.weight - a.weight
          })
          return news
      }
  },
  middlewares: [],
  strict: process.env.NODE_ENV !== 'production'
})
