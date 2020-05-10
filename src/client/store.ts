import { observable, computed, observe, action } from 'mobx'
import _ from 'lodash'
import M from '../mutations'
import modules from '../modules'
import calculations from '../calculations'

function setCurrent(state: AoState, b: AoState) {
  modules.cash.mutations.setCurrent(state.cash, b)
  modules.tasks.mutations.setCurrent(state.tasks, b)
  modules.sessions.mutations.setCurrent(state.sessions, b)
  modules.ao.mutations.setCurrent(state.ao, b)
  modules.members.mutations.setCurrent(state.members, b)
  modules.resources.mutations.setCurrent(state.resources, b)

  state.user = b.user
  state.session = b.session
  state.token = b.token
  state.loggedIn = b.loggedIn
}

export interface Grid {
  rows: {}
  height: number
  width: number
}

export interface Member {
  type: 'member-created'
  name: string
  memberId: string
  address: string
  active: number
  balance: number
  badges: []
  info: {}
  timestamp: Date
  lastUsed: Date
  muted: Boolean
}

export interface Task {
  taskId: string
  color: string
  deck: string[]
  name: string
  address: string
  bolt11: string
  book: {
    memberId: string
    startTs: Date
    endTs: Date
  }
  boost: number
  priorities: string[]
  subTasks: string[]
  completed: string[]
  claimed: string[]
  passed: number[]
  guild: string
  lastClaimed: number
  completeValue: number
  payment_hash: string
  highlights: number[]
  seen: Userseen[]
  time: Usertime[]
  timestamp: number
  grid?: Grid
}

interface Usertime {
  memberId: string
  timelog: number[]
  date: Date[]
}

interface Userseen {
  memberId: string
  timestamp: Date
}

export interface Session {
  type: 'session-created'
  session: string
  ownerId: string
  timestamp: Date
}

export interface AoState {
  session: string
  token: string
  loggedIn: boolean
  user: string
  ao: number[]
  sessions: Session[]
  members: Member[]
  tasks: Task[]
  resources: []
  cash: {
    address: string
    alias: string
    currency: string
    spot: number
    rent: number
    cap: number
    pay_index: number
    usedTxIds: number[]
    outputs: number[]
    channels: number[]
    info: {}
  }
}
const defaultState: AoState = {
  session: '',
  token: '',
  user: '',
  loggedIn: false,
  ao: [],
  sessions: [],
  members: [],
  tasks: [],
  resources: [],
  cash: {
    address: '',
    alias: '',
    currency: 'CAD',
    spot: 0,
    rent: 0,
    cap: 75,
    pay_index: 0,
    usedTxIds: [],
    outputs: [],
    channels: [],
    info: {}
  }
}
class AoStore {
  @observable
  state: AoState = defaultState
  @observable
  searchResults: Task[] = []
  context: string[] = []
  @computed get member(): Member {
    let loggedInMember: Member
    this.state.sessions.forEach(session => {
      if (this.state.session === session.session) {
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
    let memberCard = _.merge(
      calculations.blankCard('', '', ''),
      this.hashMap.get(this.member.memberId)
    )
    return memberCard
  }
  @computed get hashMap(): Map<string, Task> {
    let hashMap: Map<string, Task> = new Map()
    this.state.tasks.forEach(t => {
      hashMap.set(t.taskId, t)
    })
    return hashMap
  }
  @computed get memberById(): Map<string, Member> {
    let hashMap: Map<string, Member> = new Map()
    this.state.members.forEach(m => {
      hashMap.set(m.memberId, m)
    })
    return hashMap
  }
  @computed get cardByName(): Map<string, Task> {
    let hashMap: Map<string, Task> = new Map()
    this.state.tasks.forEach(t => {
      hashMap.set(t.name, t)
    })
    return hashMap
  }
  @action.bound
  initializeState(state: AoState) {
    Object.keys(state).forEach(key =>
      Object.assign(this.state[key], state[key])
    )
    this.state.loggedIn = true
    console.log('state initialized:', this.state)
  }
  @action.bound
  applyEvent(ev) {
    M.cashMuts(this.state.cash, ev)
    M.membersMuts(this.state.members, ev)
    M.resourcesMuts(this.state.resources, ev)
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
    if (query.length < 1) return
    // for 1 letter search only first letter of guild names, 2 letters searches 1st word and also 1st initials of guild titles
    let foundCards: Task[] = []
    let foundGuilds: Task[] = []
    let foundMembers: Task[] = []
    let searchResults: Task[] = []

    try {
      let regex = new RegExp(query, 'i')
      console.log('query is ', query)
      this.state.tasks.forEach(t => {
        if (t.guild && regex.test(t.guild)) {
          foundGuilds.push(t)
        } else if (regex.test(t.name)) {
          if (
            !foundGuilds.some(g => {
              return g.guild === t.name
            })
          ) {
            foundCards.push(t)
          }
        }
      })

      this.state.members.forEach(member => {
        if (regex.test(member.name)) {
          let result = this.hashMap.get(member.memberId)
          result.name = member.name
          foundMembers.push(result)
        }
      })
      this.searchResults = foundGuilds.concat(foundMembers).concat(foundCards)
      console.log('store.searchResults is now ', this.searchResults)
    } catch (err) {
      console.log('regex search terminated in error: ', err)
    }
  }
  @action.bound
  addToContext(taskIds: string[]) {
    console.log('addToContext cards is ', taskIds)
    if (taskIds.length < 1) return
    console.log('pre: context is ', this.context)
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
    console.log('post: context is ', this.context)
  }
  @action.bound
  clearContextTo(taskId: string) {
    const index = this.context.findIndex(tId => {
      return tId === taskId
    })
    this.context = this.context.slice(0, index)
  }
}
const aoStore = new AoStore()

export default aoStore
