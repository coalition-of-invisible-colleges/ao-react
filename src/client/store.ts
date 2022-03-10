import {
  observable,
  computed,
  observe,
  action,
  makeObservable,
  reaction,
  extendObservable,
  makeAutoObservable,
  runInAction,
} from 'mobx'
import _ from 'lodash'
import M from '../mutations'
// import modules from '../modules/index.js'
import { cadToSats } from '../calculations'
import { blankCard } from '../cards.js'
import AoStack from '../components/stack'
import cash from '../modules/cash.js'
import members from '../modules/members.js'
import tasks from '../modules/tasks.js'
import resources from '../modules/resources.js'
import memes from '../modules/memes.js'
import sessions from '../modules/sessions.js'
import ao from '../modules/ao.js'

import request from 'superagent'

import ContextCard from '../components/Card'
import api from './api'

import { DeckTab } from '../components/deck'

import {
    Task,
    Grid,
    GridStyle,
    Allocation,
    Signature,
    Userseen,
    LabourTime,
    AvatarLocation,
    Membership
} from '../interfaces'

const modules = { cash, members, tasks, resources, memes, sessions, ao }

function setCurrent(state: AoState, b: AoState) {
  modules.cash.mutations.setCurrent(state.cash, b)
  modules.tasks.mutations.setCurrent(state.tasks, b)
  modules.sessions.mutations.setCurrent(state.sessions, b)
  modules.ao.mutations.setCurrent(state.ao, b)
  modules.members.mutations.setCurrent(state.members, b)
  modules.memes.mutations.setCurrent(state.memes, b)
  modules.resources.mutations.setCurrent(state.resources, b)

  state.user = b.user
  state.session = b.session
  state.token = b.token
  state.loggedIn = b.loggedIn
}

export interface Member {
  type: 'member-created'
  name: string
  memberId: string
  address: string
  active: number
  balance: number
  badges: []
  tickers: Ticker[]
  info: {}
  timestamp: number
  lastUsed: number
  muted: boolean
  priorityMode: boolean
  fob: string
  potentials: Signature[]
  banned: boolean
  draft: string
  tutorial?: boolean
  p0wned?: boolean
  phone?: string
}

export interface Meme {
  memeId: string
  filename: string
  hash: string
  filetype: string
}

export interface Resource {
  resourceId: string
  name: string
  charged: number
  secret: string
  trackStock: boolean
  stock: number
}

export interface Ticker {
  from: string
  to: string
}

export interface ConnectedAo {
  name?: string
  address: string
  outboundSecret: false | string
  inboundSecret: string
  lastContact: number
  links: string[]
}

interface Output {
  value: number
}

// same as LightningChannel?
interface Channel {
  channel_sat: number
  channel_total_sat: number
}

export interface Session {
  type: 'session-created'
  session: string
  ownerId: string
  timestamp: Date
}

export interface LightningChannel {
  peer_id?: any
  funding_txid?: any
  state?: any
  connected?: boolean
  channel_total_sat: number
  channel_sat: number
}

export interface SatInfo {
  channels?: LightningChannel[]
  mempool?: { sampleTxns: any[]; size: any; bytes: any }
  blockheight?: number
  blockfo?: any
  id?: any
  outputs?: any[]
  address?: { address: string }[]
}

export interface AoState {
  session: string
  token: string
  loggedIn: boolean
  user: string
  ao: ConnectedAo[]
  sessions: Session[]
  members: Member[]
  tasks: Task[]
  resources: Resource[]
  memes: Meme[]
  socketState?: string
  protectedRouteRedirectPath?: string
  cash: {
    address: string
    alias: string
    currency: string
    spot: number
    rent: number
    cap: number
    quorum: number
    pay_index: number
    usedTxIds: number[]
    outputs: Output[]
    channels: Channel[]
    info: SatInfo
  }
  loader?: {
    token: string
    session: string
    connected: string
    connectionError: string
    reqStatus: string
    lastPing: number
  }
}

const defaultState: AoState = observable({
  session: '',
  token: '',
  user: '',
  loggedIn: false,
  ao: [],
  sessions: [],
  members: [],
  tasks: [],
  resources: [],
  memes: [],
  cash: {
    address: '',
    alias: '',
    currency: 'CAD',
    spot: 0,
    rent: 0,
    cap: 75,
    quorum: 3,
    pay_index: 0,
    usedTxIds: [],
    outputs: [],
    channels: [],
    info: {},
  },
})

const PAGE_LENGTH = 10

export interface SearchResults {
  query: string
  page: number
  missions: Task[]
  members: Task[]
  tasks: Task[]
  all: Task[]
  length: number
}

export const emptySearchResults = {
  missions: [],
  members: [],
  tasks: [],
  all: [],
  length: 0,
}

export type LeftSidebarTab =
  | 'hub'
  | 'gifts'
  | 'guilds'
  | 'members'
  | 'calendar'
  | 'bounties'
  | 'manual'
  | 'search'
  | 'deck'

export type RightSidebarTab =
  | 'resources'
  | 'p2p'
  | 'crypto'
  | 'membership'
  
export type CardTab = 
  | 'priorities'
  | 'timecube'
  | 'lightning'
  
class AoStore {
  @observable state: AoState = defaultState
  @observable searchResults?: SearchResults
  @observable deckSearchResults?: SearchResults
  @observable context: string[] = []
  @observable currentCard: string
  @observable discard: Task[] = []
  @observable guiCloseables: ((event?) => void)[] = []
  @observable currentChatroom: string
  @observable draft: string = ''
  @observable dabbed: boolean = false
  @observable globalRedirect?: string
  @observable memberDeckSize?: number
  @observable mediaPlayHead: { inId: string; taskId: string }
  @observable leftSidebar?: LeftSidebarTab
  @observable rightSidebar?: RightSidebarTab
  @observable cardTab?: CardTab
  @observable localPriorityMode?: boolean
  @observable deckTab: DeckTab = 'all'

  bookmarksTaskId?: string

  constructor() {
    makeObservable(this)
  }

  @computed get member(): Member {
    let currentSession = window.localStorage.getItem('session')
    console.log('current session is: ', currentSession)
    let loggedInMember: Member
    this.state.sessions.forEach(session => {
      if (currentSession === session.session) {
        console.log('found existing session')
        const memberId = session.ownerId
        this.state.members.forEach(m => {
          if (m.memberId === memberId) {
            loggedInMember = m
          }
        })
      }
    })
    return loggedInMember
  }

  @computed get memberCard(): Task {
    if (!this.member) {
      return null
    }

    // let memberCard = _.merge(
    //   blankCard('', '', ''),
    return this.hashMap.get(this.member.memberId)
    // )
    // return memberCard
  }

  // getMemberCard_async(callback) {

  // }

  @computed get hashMap(): Map<string, Task> {
    let hashMap: Map<string, Task> = new Map()
    this.state.tasks.forEach(t => {
      hashMap.set(t.taskId, t)
    })

    return hashMap
  }

  // @computed get bookmarksTaskCard() {
  //   console.log("AO: client/store.ts: bookmarksCard computing")
  //   let bookmarksTaskId = aoStore.bookmarksTaskId
  //   let card = this.hashMap.get(bookmarksTaskId)
  //   let bookmarkedCardsData = []
  //   card.grid.rows.forEach
  //       ( (row, y) =>
  //         {
  //           row.forEach
  //               ( (cell, x) =>
  //                 { bookmarkedCardsData.push({y, x, cell})
  //                 }
  //               )
  //         }
  //       )
  //   return bookmarkedCardsData
  // }

  async fetchEntireDeck_async(): Promise<void> {
    return new Promise((resolve, reject) => {
      let stateClosure = this.state
      request
        .post('/fetchDeck')
        .set('Authorization', stateClosure.token)
        .send()
        .then(result => {
          // console.log("AO: client/store.ts: getTaskById_async: merging fetched task", {taskId, "result.body": result.body});

          runInAction(() => {
            let newTasksOnly = result.body.foundThisTaskList.filter(
              existingTask =>
                !stateClosure.tasks.some(t => t.taskId === existingTask.taskId)
            )
            stateClosure.tasks.push(...newTasksOnly)
            resolve()
          })
          // setTimeout( () => this.hashMap.get(taskId).name = "Woo Hoo", 2000 )
        })
        .catch(error => {
          reject()
          // console.log("AO: client/store.ts: getTaskById_async: error fetching task", {taskId, error});
        })
    })
  }

  getTaskById_async(taskId, callbackOriginal) {
    console.log('calling getTaskById on', taskId)
    let callback = parentTaskItem => {
      this.getAllLinkedCardsForThisTaskId_async(parentTaskItem.taskId, () => {})
      callbackOriginal(parentTaskItem)
    }

    taskId = taskId.toLowerCase()
    let taskToGet = this.hashMap.get(taskId)
    if (taskToGet !== undefined) {
      console.log(
        'AO: client/store.ts: getTaskById_async: task found in client store: ',
        { taskId, taskToGet }
      )
      callback(taskToGet)
    } else {
      // console.log("AO: client/store.ts: getTaskById_async: fetching task from server", { taskId });

      let stateClosure = this.state
      request
        .post('/fetchTaskByID')
        .set('Authorization', stateClosure.token)
        .send({ taskId })
        .then(result => {
          // console.log("AO: client/store.ts: getTaskById_async: merging fetched task", {taskId, "result.body": result.body});

          runInAction(() => {
            let taskToGet = this.hashMap.get(taskId)
            if (taskToGet === undefined) {
              stateClosure.tasks.push(result.body)
            }
            setImmediate(() => callback(this.hashMap.get(taskId)))
          })
          // setTimeout( () => this.hashMap.get(taskId).name = "Woo Hoo", 2000 )
        })
        .catch(error => {
          // console.log("AO: client/store.ts: getTaskById_async: error fetching task", {taskId, error});

          callback(false)
        })
    }
  }

  getAllLinkedCardsForThisTaskId_async(
    parentTaskId,
    callback,
    prioritiesOnly = false
  ) {
    console.log('calling getLinkedCards on', parentTaskId)
    let parentTaskItem = this.hashMap.get(parentTaskId)

    console.log('AO: client/store.ts: getAllLinkedCardsForThisTaskId_async: ', {
      parentTaskId,
      parentTaskItem,
    })

    if (!parentTaskItem) {
      // console.log("AO: client/store.ts: getAllLinkedCardsForThisTaskId_async: parentTask not loaded, ignoring")

      setImmediate(() => callback(false))
      return false
    } else {
      // console.log("AO: client/store.ts: getAllLinkedCardsForThisTaskId_async: ")

      let allChildTaskIds = []

      let allSubCardsSet

      if (prioritiesOnly) {
        allSubCardsSet = new Set(parentTaskItem.priorities)
      } else {
        allSubCardsSet = new Set(
          parentTaskItem.priorities.concat(
            parentTaskItem.subTasks,
            parentTaskItem.completed
          )
        )
        if (parentTaskItem.grid && parentTaskItem.grid.rows) {
          Object.entries(parentTaskItem.grid.rows).forEach(([y, row]) => {
            Object.entries(row).forEach(([x, cell]) => {
              allSubCardsSet.add(cell)
            })
          })
        }
      }

      let allTaskItemsLoadedInClient = true
      let taskItemsOnClient = []
      let taskIdsToLoadFromServer = []
      allSubCardsSet.forEach(taskId => {
        let taskItem = this.hashMap.get(taskId)

        if (!taskItem) {
          allTaskItemsLoadedInClient = false
          taskIdsToLoadFromServer.push(taskId)
        }
        {
          taskItemsOnClient.push(taskItem)
        }
      })

      if (allTaskItemsLoadedInClient === true) {
        setImmediate(() => callback(false))
        return taskItemsOnClient
      } else {
        setImmediate(() => {
          // let counter = taskIdsToLoadFromServer.length
          // let decrementCounter =
          //     () =>
          //     { counter--;
          //       if (counter === 0)
          //       {
          //         callback(true)
          //       }
          //     }
          // taskIdsToLoadFromServer.forEach
          //     ( (taskId) =>
          //       {
          //         this.getTaskById_async(taskId, decrementCounter)
          //       }
          //     )

          let stateClosure = this.state
          request
            .post('/fetchTaskByID')
            .set('Authorization', stateClosure.token)
            .send({ taskId: taskIdsToLoadFromServer })
            .then(result => {
              // console.log("AO: client/store.ts: getAllLinkedCardsForThisTaskId_async:  merging fetched tasks", {taskIdsToLoadFromServer, "result.body": result.body});

              runInAction(() => {
                // sometimes multiple overlapping requests for subcards cause
                // duplicates to be returned from different queries.
                const newTasksOnly = result.body.foundThisTaskList.filter(
                  existingTask =>
                    !stateClosure.tasks.some(
                      t => t.taskId === existingTask.taskId
                    )
                )
                // console.log('newTasksOnly length is', newTasksOnly.length)
                newTasksOnly.forEach(newTask => {
                  if (newTask.passed === undefined) {
                    console.log('check out this shit:', newTask)
                  }
                })
                stateClosure.tasks.push(...newTasksOnly)
                // setImmdiate(() => callback(this.hashMap.get(taskId)))
                // this works to solve the missing prorities dropdown problem but it ruins performance
                // if (!prioritiesOnly) {
                // console.log(
                //   'got tasks and about to get first priorities:',
                //   result.body.foundThisTaskList
                // )
                // stateClosure.tasks.forEach(foundTask => {
                //   this.getFirstPriorityCardForThisTaskId_async(foundTask.taskId)
                //     this.getAllLinkedCardsForThisTaskId_async(
                //       foundTask.taskId,
                //       () => {},
                //       true
                //     )
                // })
                // }
                callback(true)
              })
              // setTimeout( () => this.hashMap.get(taskId).name = "Woo Hoo", 2000 )
            })
            .catch(error => {
              // console.log("AO: client/store.ts: getAllLinkedCardsForThisTaskId_async:  error fetching task list", {taskIdsToLoadFromServer, error});

              callback(false)
            })
        })
        return false
      }

      // getSearchResultsForQuery_async(query, callback) {
      // }

      // allSubCards.forEach(tId => {
      //     let subCard = aoStore.hashMap.get(tId)
      //     if (subCard) {
      //         if (
      //             subCard.guild &&
      //             subCard.guild.length >= 1 &&
      //             subCard.deck.length >= 1
      //         ) {
      //             projectCards.push(subCard)
      //         }
      //     }
      // })

      // if (card.grid && card.grid.rows) {
      //     Object.entries(card.grid.rows).forEach(([y, row]) => {
      //         Object.entries(row).forEach(([x, cell]) => {
      //             let gridCard = aoStore.hashMap.get(cell)
      //             if (
      //                 gridCard &&
      //                 gridCard.guild &&
      //                 gridCard.guild.length >= 1 &&
      //                 gridCard.deck.length >= 1
      //             ) {
      //                 projectCards.push(gridCard)
      //             }
      //         })
      //     })
      // }

      // return projectCards
    }

    // let stateClosure = this.state;
    // request
    //     .post('/fetchTaskByID')
    //     .set('Authorization', stateClosure.token)
    //     .send( {taskId} )
    //     .then
    //         ( (result) =>
    //           {
    //             console.log("AO: client/store.ts: getTaskById_async: merging fetched task", {taskId, "result.body": result.body});

    //             runInAction
    //                 ( () =>
    //                   { stateClosure.tasks.push(result.body)
    //                     setImmediate(() => callback(this.hashMap.get(taskId)));
    //                   }
    //                 );
    //             // setTimeout( () => this.hashMap.get(taskId).name = "Woo Hoo", 2000 )
    //           }
    //         )
    //     .catch
    //         ( ( error ) =>
    //           {
    //             console.log("AO: client/store.ts: getTaskById_async: error fetching task", {taskId, error});

    //             callback(false);
    //           }
    //         )
  }

  // getFirstPriorityCardForThisTaskId_async(parentTaskId) {
  //   parentTaskId = parentTaskId.toLowerCase()
  //   let parentTaskItem = this.hashMap.get(parentTaskId)
  //   if (!parentTaskItem || parentTaskItem.priorities.length < 1) {
  //     return false
  //   } else {
  //     const firstPriorityTaskId =
  //       parentTaskItem.priorities[parentTaskItem.priorities.length - 1]
  //     if (!firstPriorityTaskId) {
  //       return false
  //     }
  //     let firstPriorityCard = this.hashMap.get(firstPriorityTaskId)

  //     if (firstPriorityCard) {
  //       return true
  //     } else {
  //       setImmediate(() => {
  //         let stateClosure = this.state
  //         request
  //           .post('/fetchTaskByID')
  //           .set('Authorization', stateClosure.token)
  //           .send({ taskId: firstPriorityTaskId })
  //           .then(result => {
  //             runInAction(() => {
  //               // sometimes multiple overlapping requests for subcads cause
  //               // duplicates to be returned from different queries.
  //               stateClosure.tasks.filter(
  //                 existingTask => existingTask.taskId !== result.body
  //               )
  //               stateClosure.tasks.push(result.body)
  //             })
  //           })
  //           .catch(error => {})
  //       })
  //       return false
  //     }
  //   }
  // }

  @computed get memberById(): Map<string, Member> {
    let hashMap: Map<string, Member> = new Map()
    this.state.members.forEach(m => {
      hashMap.set(m.memberId, m)
    })
    return hashMap
  }

  @computed get confirmedBalance() {
    let confirmedBalance = 0
    this.state.cash.info.outputs.forEach(o => {
      if (o.status === 'confirmed') {
        confirmedBalance += o.value
      }
    })
    return confirmedBalance
  }

  @computed get totalLocal() {
    let totalLocal = 0
    this.state.cash.channels.forEach(c => {
      totalLocal += c.channel_sat
    })
    return totalLocal
  }

  @computed get totalRemote() {
    let totalRemote = 0
    this.state.cash.channels.forEach(c => {
      totalRemote += c.channel_total_sat - c.channel_sat
    })
    return totalRemote
  }

  @computed get totalWallet() {
    return this.totalLocal + this.confirmedBalance
  }

  @computed get satPointSpot() {
    if (this.state.cash.spot > 0) {
      return cadToSats(1, this.state.cash.spot)
    }
    return 10000
  }

  @computed get resourceById(): Map<string, Resource> {
    let hashMap: Map<string, Resource> = new Map()
    this.state.resources.forEach(m => {
      hashMap.set(m.resourceId, m)
    })
    return hashMap
  }

  // Returns a map of card names to cards.
  // Card names (keys) are in lowercase for case-insensitive comparison.
  // Guild (mission) names take precedence over card names for exact card lookup.
  @computed get cardByName(): Map<string, Task> {
    let hashMap: Map<string, Task> = new Map()
    this.state.tasks.forEach(t => {
      if (!t || !t.name) return
      hashMap.set(t.name.toLowerCase(), t)
    })
    this.allGuilds.forEach(t => {
      hashMap.set(t.guild.toLowerCase(), t)
    })
    return hashMap
  }

  getTaskByName_async(taskName, callback) {
    taskName = taskName.toLowerCase()
    let taskToGet = this.cardByName.get(taskName)
    console.log('entry getTaskByName_async task is', taskToGet)
    if (taskToGet !== undefined) {
      console.log(
        'AO: client/store.ts: getTaskByName_async: task found in client store: ',
        { taskName, taskToGet }
      )
      callback(taskToGet)
    } else {
      // console.log("AO: client/store.ts: getTaskByName_async: fetching task from server", { taskName });
      let stateClosure = this.state
      request
        .post('/fetchTaskByName')
        .set('Authorization', stateClosure.token)
        .send({ taskName })
        .then(result => {
          // console.log("AO: client/store.ts: getTaskByName_async: merging fetched task", {taskName, "result": result.body});

          runInAction(() => {
            let taskItems = result.body.foundThisTaskList
            let existingTask = this.cardByName.get(taskName)
            taskItems.filter(
              t => !stateClosure.tasks.some(t2 => t.taskId === t2.taskId)
            )
            // since cards are immutable it shouldn't matter too much
            if (existingTask === undefined) {
              stateClosure.tasks.push(...taskItems)
            }
            const taskItem = this.hashMap.get(taskItems[0].taskId)
            setImmediate(() => callback(taskItem))
            // setTimeout( () => this.hashMap.get(taskId).name = "Woo Hoo", 2000 )
          })
        })
        .catch(error => {
          // console.log("AO: client/store.ts: getTaskByName_async: error fetching task", {taskName, error});

          callback(false)
        })
    }
  }

  getCommunityHubCardId(callback): void {
    // console.log("AO: client/store.ts: getCommunityHubCardId")

    this.getTaskByName_async('community hub', communityHubCard => {
      if (!communityHubCard) {
        callback(null)
        // console.log("AO: client/store.ts: creating community hub card on server")

        // api.createCard('community hub', true).then(result => {
        //   const newTaskId = JSON.parse(result.text).event.taskId

        //   // console.log("AO: client/store.ts: community hub card created on server: ", { newTaskId });

        //   // aoStore.setCurrentCard(newTaskId)
        //   callback(newTaskId)
        //   // setHubId(newTaskId)
        //   // initialStateComplete();
        // })
      } else {
        // console.log("AO: client/store.ts: community hub card found in client state: ", { "taskId": communityHubCard.taskId });

        callback(communityHubCard.taskId)

        // aoStore.setCurrentCard(communityCard.taskId)
        // setHubId(communityCard.taskId)
        // initialStateComplete();
      }
    })
  }

  // @computed get communityHubTaskItem(): Task {
  //   return this.cardByName.get("community hub");
  // }

  @computed get memeById(): Map<string, Meme> {
    let hashMap: Map<string, Meme> = new Map()
    this.state.memes.forEach(m => {
      hashMap.set(m.memeId, m)
    })
    return hashMap
  }

  @computed get contextCards(): Task[] {
    let cards: Task[] = []
    this.context.forEach(tId => {
      cards.push(this.hashMap.get(tId))
    })
    // cards.reverse()

    // throw new Error("Insane bullshit error");

    return cards
  }

  @computed
  get myCards() {
    return aoStore.state.tasks.filter(
      t => t.deck.indexOf(aoStore.member.memberId) !== -1
    )
  }

  @computed get allUnheldCards() {
    // Will not catch cards that are still held by deleted members (need to filter task.deck for existing members for that)
    return aoStore.state.tasks
      .filter(task => {
        return task.deck.length <= 0 && task.name !== task.taskId
      })
      .reverse()
  }

  @computed get myGifts() {
    return aoStore.state.tasks.filter(task => {
      return task.passed.some(pass => pass[1] === aoStore.member.memberId)
    })
  }

  @computed get allChanges() {
    return aoStore.myCards.filter(
      card =>
        !(card.guild && card.guild.length >= 1) &&
        (!card.seen ||
          (card.seen &&
            !card.seen.some(
              userseen => userseen.memberId === aoStore.member.memberId
            )))
    )
  }

  @computed get allGuilds(): Task[] {
    return aoStore.state.tasks.filter(task => {
      return task.hasOwnProperty('guild') && task.guild.length >= 1
    })
  }

  @computed get allNonGuilds(): Task[] {
    return aoStore.state.tasks.filter(task => {
      return !(task.hasOwnProperty('guild') && task.guild.length >= 1)
    })
  }

  @computed get myGuilds(): Task[] {
    if (!this.member) {
      return []
    }
    let my = this.state.tasks.filter(t => {
      if (!t.guild) return false
      if (t.deck.indexOf(this.member.memberId) === -1) {
        return false
      }
      return true
    })
    my = my.filter(st => {
      if (!st.hasOwnProperty('taskId')) {
        console.log(
          'Invalid guild card detected while retrieving member guilds list.'
        )
        return false
      }
      return true
    })
    let tempLastClaimeds = {}
    my.forEach(g => {
      tempLastClaimeds[g.taskId] = 0
      let completions = g.completed.map(t => this.hashMap.get(t))
      completions.forEach(c => {
        if (typeof c === 'undefined') {
          console.log(
            'invalid data due to broken subTaskId links in completed list'
          )
          return
        }
        if (c.lastClaimed > tempLastClaimeds[g.taskId]) {
          tempLastClaimeds[g.taskId] = c.lastClaimed
        }
      })
    })
    my.sort((a, b) => {
      return tempLastClaimeds[b.taskId] - tempLastClaimeds[a.taskId]
    })
    return my
  }

  @computed get subGuildsByGuild(): Map<string, Task[]> {
    let subGuildsByGuild: Map<string, Task[]> = new Map()

    this.allGuilds.forEach(card => {
      let projectCards: Task[] = []
      let allSubCards = card.priorities.concat(card.subTasks, card.completed)

      allSubCards.forEach(tId => {
        let subCard = aoStore.hashMap.get(tId)
        if (subCard) {
          if (subCard.guild && subCard.guild.length >= 1) {
            projectCards.push(subCard)
          }
        }
      })

      if (card.grid && card.grid.rows) {
        Object.entries(card.grid.rows).forEach(([y, row]) => {
          Object.entries(row).forEach(([x, cell]) => {
            let gridCard = aoStore.hashMap.get(cell)
            if (gridCard && gridCard.guild && gridCard.guild.length >= 1) {
              projectCards.push(gridCard)
            }
          })
        })
      }
      subGuildsByGuild.set(card.taskId, projectCards)
    })

    return subGuildsByGuild
  }

  @computed get allEvents(): Task[] {
    return aoStore.state.tasks
      .filter(task => {
        return (
          task.book &&
          task.book.hasOwnProperty('startTs') &&
          task.book.startTs > 0
        )
      })
      .sort((a, b) => {
        return b.book.startTs - a.book.startTs
      })
  }

  @computed get myEvents(): Task[] {
    let my = aoStore.state.tasks
      .filter(t => {
        if (!t.hasOwnProperty('taskId')) {
          console.log(
            'Invalid event card detected while retrieving member events list.'
          )
          return false
        }

        if (!t.book || !t.book.startTs || t.book.startTs <= 0) return false
        if (t.deck.indexOf(aoStore.member.memberId) === -1) {
          return false
        }
        return true
      })
      .sort((a, b) => {
        return b.book.startTs - a.book.startTs
      })

    return my
  }

  @computed get eventsAsAgenda() {
    let events = this.allEvents

    const todayMs = 64800000 // 18 hours
    const tomorrowMs = 172800000 // 48 hours
    const thisWeekMs = 604800000 // 1 week
    const nextWeekMs = thisWeekMs * 2 // 2 weeks
    const thisMonthMs = thisWeekMs * 4 // 4 weeks
    const nextMonthMs = thisMonthMs * 2 // 2 months
    const thisYearMs = 31536000000 // 365 days
    const pastBufferMs = 3600000 // assuming 1 hour event length by default

    let now: Task[] = [],
      today: Task[] = [],
      tomorrow: Task[] = [],
      thisWeek: Task[] = [],
      nextWeek: Task[] = [],
      thisMonth: Task[] = [],
      nextMonth: Task[] = [],
      thisYear: Task[] = [],
      eventually: Task[] = [],
      past: Task[] = [],
      overdue: Task[] = []

    events.forEach(task => {
      const timeToNow = task.book.startTs - Date.now()
      const isChecked = task.claimed.indexOf(aoStore.member.memberId) !== -1
      const isHodld = task.deck.indexOf(aoStore.member.memberId) !== -1

      if (timeToNow < -pastBufferMs && (!isHodld || isChecked)) {
        past.push(task)
      } else if (timeToNow < -pastBufferMs) {
        overdue.push(task)
      } else if (timeToNow > -pastBufferMs && timeToNow <= 0) {
        now.push(task)
      } else if (timeToNow > 0 && timeToNow <= todayMs) {
        today.push(task)
      } else if (timeToNow > todayMs && timeToNow <= tomorrowMs) {
        tomorrow.push(task)
      } else if (timeToNow > tomorrowMs && timeToNow <= thisWeekMs) {
        thisWeek.push(task)
      } else if (timeToNow > thisWeekMs && timeToNow <= nextWeekMs) {
        nextWeek.push(task)
      } else if (timeToNow > nextWeekMs && timeToNow <= thisMonthMs) {
        thisMonth.push(task)
      } else if (timeToNow > thisMonthMs && timeToNow <= nextMonthMs) {
        nextMonth.push(task)
      } else if (timeToNow > nextMonthMs && timeToNow <= thisYearMs) {
        thisYear.push(task)
      } else {
        eventually.push(task)
      }
    })

    past.reverse()

    return {
      now,
      today,
      tomorrow,
      thisWeek,
      nextWeek,
      thisMonth,
      nextMonth,
      thisYear,
      eventually,
      past,
      overdue,
    }
  }

  @computed get topLevelMissions(): Task[] {
    let missions = aoStore.state.tasks.filter(task => {
      return task.hasOwnProperty('guild') && task.guild.length >= 1
    })
    if (missions.length < 1) {
      return []
    }

    let projectCards = []
    projectCards = projectCards.concat(
      ...missions.map(task => aoStore.subGuildsByGuild.get(task.taskId))
    )

    missions = missions.filter(task => {
      return !projectCards.includes(task)
    })

    return missions
  }

  @computed get myMissions() {
    return aoStore.topLevelMissions.filter(mission =>
      mission.deck.includes(aoStore.member.memberId)
    )
  }

  @computed get changedMissions() {
    return this.myMissions.filter(
      mission =>
        !mission.seen ||
        (mission.seen &&
          !mission.seen.some(
            userseen => userseen.memberId === aoStore.member.memberId
          ))
    )
  }

  @computed get topMissions(): Task[] {
    let topMissions = aoStore.allGuilds.sort((a, b) => {
      if (b.deck.length === a.deck.length) {
        return b.priorities.length - a.priorities.length
      }
      return b.deck.length - a.deck.length
    })

    if (topMissions.length > 5) {
      topMissions = topMissions.slice(0, 5)
    }
    topMissions.reverse()
    return topMissions
  }

  @computed get topCards(): Task[] {
    let topCards = aoStore.allNonGuilds

    topCards = topCards.sort((a, b) => {
      return b.deck.length - a.deck.length
    })

    if (topCards.length > 5) {
      topCards = topCards.slice(0, 5)
    }
    topCards.reverse()
    return topCards
  }

  // The top priority in the member's member card, if the timeclock is currently running on it (or null)
  @computed get taskDoingNow() {
    if (!this.memberCard) {
      return null
    }

    let memberPriorities = this.memberCard.priorities

    if (!memberPriorities || memberPriorities.length <= 0) {
      return null
    }

    const topMemberPriorityId = memberPriorities[memberPriorities.length - 1]
    const topMemberPriority = aoStore.hashMap.get(topMemberPriorityId)

    if (
      !topMemberPriority ||
      !topMemberPriority.timelog ||
      topMemberPriority.timelog.length <= 0
    ) {
      return null
    }

    for (let i = topMemberPriority.timelog.length - 1; i >= 0; i--) {
      if (topMemberPriority.timelog[i].memberId === aoStore.member.memberId) {
        if (
          !topMemberPriority.timelog[i].stop ||
          topMemberPriority.timelog[i].stop <=
            topMemberPriority.timelog[i].start
        ) {
          return topMemberPriority
        } else {
          return null
        }
      }
    }

    return null
  }

  // The next card after the current mediaPlayHead's location that has (any) attachment
  // If there are duplicate cards on the grid, playback behavior will weirdly snap back to the earlier copy
  @computed get nextCardWithMediaAttachment(): string {
    if (!this.mediaPlayHead.inId || !this.mediaPlayHead.taskId) {
      return null
    }

    const card = this.hashMap.get(this.mediaPlayHead.inId)
    if (!card) {
      return null
    }

    // Get the next card in a stack of cards that has a meme (todo: of video or audio type)
    const getNextMemeIdFromCards = (stack, startIndex) => {
      for (let i = startIndex - 1; i >= 0; i--) {
        const meme = this.memeById.get(stack[i])
        if (meme) {
          return meme.memeId
        }
      }
      return null
    }

    type CardZone = 'priorities' | 'subTasks' | 'grid' | 'completed'

    const findNextMemeInCard = (
      card,
      startZone: CardZone,
      startY,
      startX = 0
    ) => {
      if (startZone === 'priorities') {
        const result = getNextMemeIdFromCards(card.priorities, startY)
        if (result) {
          return result
        }
      }
      if (startZone === 'priorities' || startZone === 'grid') {
        let gridY = startY
        let gridX = startX
        if (startZone !== 'grid') {
          gridY = 0
          gridX = -1
        }
        let result
        if (
          card.grid &&
          card.grid.hasOwnProperty('rows') &&
          Object.keys('card.grid.rows').length >= 1
        ) {
          Object.entries(card.grid.rows).forEach(([y, row]) => {
            if (!result && parseInt(y, 10) >= gridY) {
              Object.entries(row).forEach(([x, cell]) => {
                if (
                  !result &&
                  ((parseInt(y, 10) === gridY && parseInt(x, 10) > gridX) ||
                    parseInt(y, 10) > gridY) &&
                  cell
                ) {
                  const meme = this.memeById.get(cell)
                  if (meme) {
                    result = meme.memeId
                  }
                }
              })
            }
          })
        }
        if (result) {
          return result
        }
      }

      if (
        startZone === 'priorities' ||
        startZone === 'grid' ||
        startZone === 'subTasks'
      ) {
        let stY = startY
        if (startZone !== 'subTasks') {
          stY = card.subTasks.length
        }
        const result = getNextMemeIdFromCards(card.subTasks, stY)
        if (result) {
          return result
        }
      }

      // Only look in completed if the previous card was in completed (don't usually play completed)
      if (startZone === 'completed') {
        const result = getNextMemeIdFromCards(card.completed, startY)
        if (result) {
          return result
        }
      }

      return null
    }

    // First locate the current track, then call findNextMemeInCard to get the following track
    const prioritiesIndex = card.priorities.indexOf(this.mediaPlayHead.taskId)
    if (prioritiesIndex >= 0) {
      return findNextMemeInCard(card, 'priorities', prioritiesIndex)
    }
    let result
    if (
      card.grid &&
      card.grid.hasOwnProperty('rows') &&
      Object.keys('card.grid.rows').length >= 1
    ) {
      Object.entries(card.grid.rows).forEach(([y, row]) => {
        if (result) {
          return
        }
        Object.entries(row).forEach(([x, cell]) => {
          if (result) {
            return
          }
          if (cell === this.mediaPlayHead.taskId) {
            result = findNextMemeInCard(
              card,
              'grid',
              parseInt(y, 10),
              parseInt(x, 10)
            )
          }
        })
      })
    }
    if (result) {
      return result
    }

    const subTasksIndex = card.subTasks.indexOf(this.mediaPlayHead.taskId)
    if (subTasksIndex >= 0) {
      return findNextMemeInCard(card, 'subTasks', subTasksIndex)
    }

    const completedIndex = card.completed.indexOf(this.mediaPlayHead.taskId)
    if (completedIndex >= 0) {
      return findNextMemeInCard(card, 'completed', completedIndex)
    }

    return null
  }

  @action.bound
  initializeState(state: AoState) {
    Object.keys(state).forEach(key =>
      Object.assign(this.state[key], state[key])
    )
    this.state.loggedIn = true
  }

  @action.bound
  applyEvent(ev) {
    M.cashMuts(this.state.cash, ev)
    M.membersMuts(this.state.members, ev)
    M.resourcesMuts(this.state.resources, ev)
    M.memesMuts(this.state.memes, ev)
    M.sessionsMuts(this.state.sessions, ev)
    M.tasksMuts(this.state.tasks, ev)
    M.aoMuts(this.state.ao, ev)
  }

  @action.bound
  resetState() {
    setCurrent(this.state, defaultState)
  }

  @action.bound
  updateSearchResults(query: string) {
    if (query.length < 1) {
      this.deckSearchResults = undefined
      return
    }

    api.search(query).then(res => {
      if (res.ok) {
        this.deckSearchResults = observable(res.body)
      }
    })
  }

  // Ideally, this should replace the updateSearchResults. When we make a search, we want the server to give the results to the client
  returnSearchResults = async (query: string) => {
    if (query.length < 1) {
      this.searchResults = undefined
      return null
    } else {
        if (this.searchResults?.query === query) {
            this.searchResults.page += 1
        } else {
            this.searchResults = { query, page: 0, ...emptySearchResults }
        }
        const res = await api.search(query, PAGE_LENGTH, this.searchResults.page*PAGE_LENGTH)
        this.searchResults = { query, page: this.searchResults.page, ...res.body }
        return this.searchResults
    }
  }

  @action.bound
  addToContext(taskIds: string[], alwaysAddMember = true) {
    if (!this.member) {
      return
    }

    if (taskIds.length < 1) return

    this.context = this.context.filter(tId => {
      return !taskIds.includes(tId)
    })
    this.context.push(...taskIds)
    if (this.context[0] !== this.member.memberId) {
      this.context = this.context.filter(tId => {
        return tId !== this.member.memberId
      })
      this.context.unshift(this.member.memberId)
    }
  }

  @action.bound
  removeFromContext(taskId: string) {
    // console.log('AO: client/store.ts: removeFromContext: ', { taskId })
    this.context = this.context.slice().filter(tId => {
      return tId !== taskId
    })
    // console.log('AO: client/store.ts: removeFromContext: result', {
    // context: this.context,
    // })
  }

  @action.bound
  clearContextTo(taskId: string) {
    const index = this.context.findIndex(tId => {
      return tId === taskId
    })
    this.context = this.context.slice(0, index + 1)
  }

  @action.bound
  clearContext() {
    this.context = []
  }

  @action.bound
  setCurrentCard(taskId: string) {
    console.log("setCurrentCard", taskId)
    this.removeFromContext(taskId)
    this.currentCard = taskId
  }

  @computed
  get isDabbed(): boolean {
    if (!this.member) {
      return false
    }

    return this.currentCard === this.member.memberId
  }

  @action.bound
  setCurrentChatroom(taskId: string) {
    this.currentChatroom = taskId
  }

  @action.bound
  addToDiscardHistory(tasks: Task[]) {
    if (tasks.length < 1) return
    this.discard.push(...tasks)
  }

  @action.bound
  popDiscardHistory() {
    return this.discard.pop()
  }

  @action.bound
  setGlobalRedirect(taskId: string) {
    this.globalRedirect = taskId
  }

  @action.bound
  saveDraft(newDraft: string) {
    this.draft = newDraft
  }

  @action.bound
  clearDraft() {
    this.draft = ''
  }

  @action.bound
  registerCloseable(onHide: (event) => void) {
    this.guiCloseables.push(onHide)
  }

  @action.bound
  unregisterCloseable(onHide: (event) => void) {
    this.guiCloseables = this.guiCloseables.filter(
      callback => callback !== onHide
    )
  }

  @action.bound
  closeAllCloseables() {
    this.guiCloseables.forEach(callback => callback())
    this.closeLeftSidebar()
    this.closeRightSidebar()
  }

  @action.bound dab() {
    this.dabbed = !this.dabbed
  }

  @action.bound setSocketState(newState) {
    this.state.socketState = newState
  }

  @action.bound
  startedPlaying(inId, taskId) {
    this.mediaPlayHead = { inId, taskId }
  }

  @action.bound
  setLeftSidebar(tab) {
    this.leftSidebar = tab
  }

  @action.bound
  closeLeftSidebar() {
    this.leftSidebar = null
  }
  
  @action.bound
  setRightSidebar(tab) {
    this.rightSidebar = tab
  }

  @action.bound
  closeRightSidebar() {
    this.rightSidebar = null
  }

  @action.bound
  setCardTab(tab) {
    this.cardTab = tab
  }

  @action.bound
  closeCardDrawer() {
    this.cardTab = null
  }
  
  @action.bound
  showPriors() {
    this.localPriorityMode = true
  }

  @action.bound
  hidePriors() {
    this.localPriorityMode = false
  }

  @action.bound setDeckTab(newDeckTab: DeckTab) {
    this.deckTab = newDeckTab
  }
}
const aoStore = new AoStore()

export default aoStore
