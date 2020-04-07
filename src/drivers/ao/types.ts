import { SessionLoadedEvent, SessionAction } from './Session'
import { StateLoadedEvent } from './GetState'
import { SocketEvent, SocketAction } from './SocketEvent'

interface Member {
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

interface Task {
  taskId: string
  color: string
  deck: number[]
  name: string
  address: string
  bolt11: string
  book: {}
  boost: number
  priorities: number[]
  subTasks: number[]
  completed: number[]
  claimed: number[]
  passed: number[]
  guild: false
  lastClaimed: number
  completeValue: number
  payment_hash: string
  highlights: number[]
}

interface Session {
  type: 'session-created'
  session: string
  ownerId: string
  timestamp: Date
}

interface State {
  session: {
    session: string
    token: string
    user: string
  }
  ao: number[]
  sessions: Session[]
  members: Member[]
  tasks: Array<Task>
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
const defaultState: State = {
  session: {
    session: '',
    token: '',
    user: ''
  },
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

type UserSession = { session: string; token: string; user: string }

export {
  SessionLoadedEvent,
  SessionAction,
  StateLoadedEvent,
  SocketEvent,
  SocketAction,
  Member,
  Task,
  Session,
  State,
  defaultState,
  UserSession
}
