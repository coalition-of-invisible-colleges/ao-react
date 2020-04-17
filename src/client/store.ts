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
  modules.grid.mutations.setCurrent(state.grid, b)
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
  priorities: number[]
  subTasks: number[]
  completed: number[]
  claimed: string[]
  passed: number[]
  guild: false
  lastClaimed: number
  completeValue: number
  payment_hash: string
  highlights: number[]
  seen: Userseen[]
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
  grid: {}
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
  grid: {},
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
  @computed get member(): Member {
    let loggedInMember: Member
    this.state.sessions.forEach(session => {
      console.log('compare session', session)
      if (this.state.session === session.session) {
        console.log('success')
        console.log('members', this.state.members)
        const memberId = session.ownerId
        this.state.members.forEach(m => {
          if (m.memberId === memberId) {
            console.log('SUCCESS')
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
  @computed get memberByName(): Map<string, Task> {
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
    console.log('initialized state', this.state)
  }
  @action.bound
  applyEvent(ev) {
    M.cashMuts(this.state.cash, ev)
    M.membersMuts(this.state.members, ev)
    M.resourcesMuts(this.state.resources, ev)
    M.sessionsMuts(this.state.sessions, ev)
    M.tasksMuts(this.state.tasks, ev)
    M.aoMuts(this.state.ao, ev)
    M.gridMuts(this.state.grid, ev)
  }
  @action.bound
  resetState() {
    setCurrent(this.state, defaultState)
  }
}
const aoStore = new AoStore()

export default aoStore
