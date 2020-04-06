import { filter, mergeArray, tap, combine, map } from '@most/core'
import fromObservable from 'most-observable'
import { Stream, Sink, Scheduler, Disposable, Time } from '@most/types'
import * as io from 'socket.io-client'
import R from 'ramda'
import { Client } from 'socket.io'
import { Subject, create } from 'most-subject'
import modules from '../modules'
import request from 'superagent'
import _ from 'lodash'
import { AoAction as AoActionRaw } from '../lib/actions'
import { currentTime } from '@most/scheduler'
let mode = 'browser'
// let provideXMLHttpRequest
// export async function setMode(m: string) {
//   if (m == 'nodejs') {
//     mode = m
//     return import('xmlhttprequest').then(mod => {
//       provideXMLHttpRequest = mod.XMLHttpRequest
//       return true
//     })
//   } else return Promise.resolve(false)
// }

// window.localStorage.getItem('session')
// "895e17a0-6c2b-11ea-8d86-45f581e4b250"
// window.localStorage.getItem('token')
// "f3ccdd81c2ece391891cba4f7d4eb8466d3d44675dd70f11e21190ae13dfdf69"

export interface Message {
  messageType: any
  message?: any
}
// export abstract class AoSource {
//   state$: Stream<State>
//   events$: Stream<AoEvent>
//   socket: any
//   dispose: () => void
// }

export { Socket } from 'socket.io'

function setCurrent(state, b) {
  modules.cash.mutations.setCurrent(state.cash, b)
  modules.tasks.mutations.setCurrent(state.tasks, b)
  modules.sessions.mutations.setCurrent(state.sessions, b)
  modules.ao.mutations.setCurrent(state.ao, b)
  modules.members.mutations.setCurrent(state.members, b)
  modules.resources.mutations.setCurrent(state.resources, b)
  modules.grid.mutations.setCurrent(state.grid, b)
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

export interface Session {
  type: 'session-created'
  session: string
  ownerId: string
  timestamp: Date
}

export interface State {
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
export const defaultState: State = {
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

// type LoginEvent =
//   | { type: 'login-failed' }
//   | { type: 'create-session'; payload: UserSession }
//   | { type: 'try-load-session' }
//   | { type: 'state-loaded'; payload: State }
//   | { type: 'socket-connected' }
//   | { type: 'socket-authenticated' }
//   | { type: 'http-response'; payload: any }
//   | { type: 'dispose-observable' }
//   | { type: 'error'; payload: any }

// export type AoEvent =
//   | { type: 'ao-action'; payload: AoAction }
//   | LoginEvent
//   | { type: 'do-nothing' }
// type StateEvent = { type: 'state-loaded'; payload: State }
// export type ActionEvent = { type: 'ao-action'; payload: AoActionRaw }
// type SessionLoadedEvent = {
//   type: 'session-loaded'
//   payload: UserSession
// }
// type UserSession = { session: string; token: string; user: string }

type hasSelector<T> = { _namespace?: Array<string>; _category?: string } & T
type AoResponseRaw = { type: 'ao-response'; payload: any }
export type AoAction = hasSelector<AoActionRaw>
type AoResponse = hasSelector<AoResponseRaw>

export interface AoSource {
  filter(predicate: (request: AoResponse) => boolean, scope?: string): AoSource
  select(category?: string): Stream<AoResponse>
  isolateSource(source: AoSource, scope: string): AoSource
  isolateSink(sink: Stream<AoAction>, scope: string): Stream<AoAction>
}

export class ApiSelector implements AoSource {
  constructor(
    private __action$: Stream<AoResponse>,
    private _name: string,
    private _namespace: Array<string> = []
  ) {}

  public filter(
    predicate: (request: AoResponse) => boolean,
    scope?: string
  ): AoSource {
    const filteredResponse$$ = filter(r$ => predicate(r$), this.__action$)
    return new ApiSelector(
      filteredResponse$$,
      this._name,
      scope === undefined ? this._namespace : this._namespace.concat(scope)
    )
  }

  public select(category?: string): any {
    const res$$ = category
      ? filter(
          res$ => _.has(res$, '_category') && res$._category === category,
          this.__action$
        )
      : this.__action$
    // const out: DevToolEnabledSource = adapt(res$$)
    // ._isCycleSource = this._name
    return res$$
  }

  public isolateSource = isolateSource
  public isolateSink = isolateSink
}
function arrayEqual(
  requestNamespace: Array<any>,
  sourceNamespace: Array<any>
): boolean {
  for (let i = 0; i < sourceNamespace.length; i++) {
    if (requestNamespace[i] !== sourceNamespace[i]) {
      return false
    }
  }
  return true
}

export function isolateSource(
  aoSource: AoSource,
  scope: string | null
): AoSource {
  if (scope === null) {
    return aoSource
  }
  return aoSource.filter(
    (request: AoResponse) =>
      Array.isArray(request._namespace) &&
      arrayEqual(
        request._namespace,
        (aoSource as any)._namespace.concat(scope)
      ),
    scope
  )
}

export function isolateSink(
  request$: Stream<AoAction>,
  scope: string | null
): Stream<AoAction> {
  if (scope === null) {
    return request$
  }

  return map(req => {
    return {
      ...req,
      _namespace: [scope, ...(req._namespace || [])]
    }
  }, request$)
}

type SessionAction =
  | { type: 'try-load-session' }
  | { type: 'try-login'; payload: { user: string; pass: string } }

type SessionLoadedEvent = {
  type: 'session-loaded'
  payload: { user: string; token: string; session: string }
}

type FluxAction = { type: string; payload?: any }

export function createActionStream(action$: Stream<FluxAction>) {
  const sessionActs = filter(
    val => val.type == 'try-load-session' || val.type == 'try-login',
    action$
  )
  const session = createSession(sessionActs)
}

export class SessionStream implements Stream<SessionLoadedEvent> {
  constructor(private act$: Stream<SessionAction>) {}
  run(sink: Sink<SessionLoadedEvent>, scheduler: Scheduler): Disposable {
    const dispose = () => sink.end(currentTime(scheduler))
    return { dispose }
  }
}

class SessionSink implements Sink<SessionAction> {
  constructor(private sink: Sink<SessionLoadedEvent>) {}
  event(t: Time)
}

function createSession(act$: Stream<SessionAction>) {
  if (mode == 'nodejs') {
    const session = '895e17a0-6c2b-11ea-8d86-45f581e4b250'
    // window.localStorage.getItem('token')
    const token =
      'f3ccdd81c2ece391891cba4f7d4eb8466d3d44675dd70f11e21190ae13dfdf69'
    const user = 'dctrl'
    outerSubject.next({
      type: 'session-loaded',
      payload: { session, token, user }
    })
  } else {
    const token = window.localStorage.getItem('token')
    const session = window.localStorage.getItem('session')
    const user = window.localStorage.getItem('user')
    console.log('session', token, session, user)
    if (token && session) {
      outerSubject.next({
        type: 'session-loaded',
        payload: { session, token, user }
      })
    } else {
      innerSubject.next({
        type: 'create-session'
      } as LoginEvent)
    }
    step++
  }
}

// function getSessionControllr(): Subject<LoginEvent> {
//   const innerSubject = new Subject<LoginEvent>()
//   const outerSubject = new Subject<LoginEvent>()
//   let step = 0
//   const innerSub = innerSubject.subscribe({
//     next(event) {
//       Promise.resolve().then(() => {
//         switch (event.type) {
//           case 'try-load-session':
//             if (step == 0) {
//               if (mode == 'nodejs') {
//                 const session = '895e17a0-6c2b-11ea-8d86-45f581e4b250'
//                 // window.localStorage.getItem('token')
//                 const token =
//                   'f3ccdd81c2ece391891cba4f7d4eb8466d3d44675dd70f11e21190ae13dfdf69'
//                 const user = 'dctrl'
//                 outerSubject.next({
//                   type: 'session-loaded',
//                   payload: { session, token, user }
//                 })
//               } else {
//                 const token = window.localStorage.getItem('token')
//                 const session = window.localStorage.getItem('session')
//                 const user = window.localStorage.getItem('user')
//                 console.log('session', token, session, user)
//                 if (token && session) {
//                   outerSubject.next({
//                     type: 'session-loaded',
//                     payload: { session, token, user }
//                   })
//                 } else {
//                   innerSubject.next({
//                     type: 'create-session'
//                   } as LoginEvent)
//                 }
//                 step++
//               }
//             } else {
//               console.log('try-load-session: unexpected step ' + step)
//               // ret.next({
//               //   type: 'error',
//               //   payload:
//               //     'getSession: unexpected event ' + event.type + ' zat step 0'
//               // })
//             }
//             break
//           case 'create-session':
//             if (step == 1) {
//               outerSubject.next({
//                 type: 'session-loaded',
//                 payload: event.payload
//               })
//             } else {
//               console.log('create-session: unexpected step ' + step)
//             }
//             break
//           case 'dispose-observable':
//             innerSubject.complete()
//             innerSub.unsubscribe()
//             break
//           default:
//             break
//         }
//       })
//     }
//   })
//   const outerSub = outerSubject.subscribe(val => {
//     Promise.resolve().then(() => {
//       switch (val.type) {
//         case 'dispose-observable':
//           outerSubject.complete()
//           outerSub.unsubscribe()
//           innerSubject.next(val)
//         case 'try-load-session':
//           innerSubject.next(val)
//       }
//     })
//   })
//   return outerSubject
// }

// export function makeApiDriver(
//   sessionR: Subject<UserSession>,
//   name: string = 'AO'
// ): Driver<Stream<AoAction>, ApiSelector> {
//   function driver(req$: Stream<AoAction>, name: string = 'AO'): ApiSelector {
//     const readR: Subject<AoResponseRead> = new Subject()
//     const session$: Stream<UserSession> = fromObservable(sessionR)
//     combine(
//       (req, session) => {
//         const { _namespace, ...act } = req
//         request
//           .post('http://localhost:8003/events')
//           .set('Authorization', session.token)
//           .send(act)
//           .then(res => {
//             readR.next({
//               _namespace,
//               type: 'ao-response',
//               payload: { ...res }
//             })
//           })
//       },
//       [req$, session$]
//     )
//     const sel = new ApiSelector(fromObservable(readR), name, [])
//     return sel
//   }
//   return driver
// }

// export function isolateSource(
//   aoSource: AoSource,
//   scope: string | null
// ): AoSource {
//   if (scope === null) {
//     return aoSource
//   }
//   return aoSource.filter(
//     (request: AoResponseRead) =>
//       Array.isArray(request._namespace) &&
//       arrayEqual(
//         request._namespace,
//         (aoSource as any)._namespace.concat(scope)
//       ),
//     scope
//   )
// }

// export function isolateSink(
//   request$: Stream<AoAction>,
//   scope: string | null
// ): Stream<AoAction> {
//   if (scope === null) {
//     return request$
//   }
//   return adapt(
//     fromObservable<AoAction>(request$).map(req => {
//       return {
//         ...req,
//         _namespace: [scope, ...(req._namespace || [])]
//       }
//     })
//   )
// }

// export function makeAoDriver(
//   session: Subject<LoginEvent>,
//   name: string = 'AO'
// ): Driver<void, AoController> {
//   function driver(name: string = 'AO'): AoController {
//     const sel = new AoController(session)
//     return sel
//   }
//   return driver
// }

// function loginEventToSession(event: Subject<LoginEvent>): Subject<UserSession> {
//   const _session = new BehaviorSubject({ user: '', session: '', token: '' })
//   event
//     .pipe(
//       filter(val => val.type == 'session-loaded'),
//       map((val: { type: 'session-loaded'; payload: UserSession }) => {
//         return val.payload
//       })
//     )
//     .subscribe(_session)
//   return _session
// }

// export class AoController {
//   private socket: any
//   public events$: Stream<AoEvent>
//   public state$: Stream<State>
//   public member$: Stream<Member>
//   public hashMap$: Stream<Map<string, Task>>
//   public session$: Stream<UserSession>

//   private _eventStream: Subject<AoEvent>
//   private _stateStream: Subject<State>
//   private _member: Subject<Member>
//   private _hashMap: Subject<Map<string, Task>>
//   private _session: Subject<UserSession>
//   constructor(private _sessionController: Subject<LoginEvent>) {
//     this.socket = io.connect('http://localhost:8003', { autoConnect: false })
//     this._sessionController = getSessionController()
//     this._session = loginEventToSession(_sessionController)
//     this._sessionController
//       .pipe(
//         filter(val => val.type == 'session-loaded'),
//         map((val: { type: 'session-loaded'; payload: UserSession }) => {
//           return val.payload
//         })
//       )
//       .subscribe(this._session)
//     const gts = this.getState(this._session)
//     this._eventStream = this.startEventStream(this.socket, gts)
//     this._stateStream = this.createStateStream(gts, this._eventStream)
//     this._member = this.getMember(this._stateStream)
//     this._hashMap = this.getHashMap(this._stateStream)
//     this._sessionController.next({
//       type: 'try-load-session'
//     })
//     this.session$ = fromObservable(this._session).remember() as Stream<
//       UserSession
//     >
//     this.events$ = fromObservable(this._eventStream).remember() as Stream<
//       AoEvent
//     >
//     this.state$ = fromObservable(this._stateStream).remember() as Stream<State>
//     this.member$ = fromObservable(this._member).remember() as Stream<Member>
//     this.hashMap$ = fromObservable(this._hashMap).remember() as Stream<
//       Map<string, Task>
//     >

//     function cleanup() {
//       this.socket.close()
//       this._eventStream.next({ type: 'dispose-observable' })
//     }
//   }

//   private getState(session$: Subject<UserSession>): Subject<LoginEvent> {
//     const ret: Subject<LoginEvent> = new Subject()
//     // const reqOptions =
//     //   mode == 'nodejs'
//     //     ? {
//     //         createXHR: function() {
//     //           return new XMLHttpRequest()
//     //         }
//     //       }
//     //     : {}
//     const stateReq = session$.pipe(
//       concatMap(val => {
//         const state: Observable<LoginEvent> = ajax({
//           url: 'http://localhost:8003/state',
//           method: 'POST',
//           headers: {
//             Authorization: val.token
//           }
//         }).pipe(
//           map(
//             (response): LoginEvent => {
//               console.log('hey', response)
//               // const res: State = (response.res.session = val)
//               // const ret = JSON.parse(response.responseText)
//               console.log('response: ', response.response)
//               return {
//                 type: 'state-loaded',
//                 payload: response.response
//               }
//             }
//           ),
//           catchError(error => {
//             console.log('error: ', error)
//             return of({ type: 'error', payload: error } as LoginEvent)
//           })
//         )
//         return state
//       })
//     )
//     const stateSub = stateReq.subscribe(val => {
//       Promise.resolve().then(() => {
//         switch (val.type) {
//           case 'state-loaded':
//             ret.next(val)
//             break
//           case 'login-failed':
//             ret.next(val)
//             break
//           default:
//             break
//         }
//       })
//     })
//     const retSub = ret.subscribe(val => {
//       Promise.resolve().then(() => {
//         if (val.type == 'dispose-observable') {
//           ret.complete()
//           stateSub.unsubscribe()
//           retSub.unsubscribe()
//         }
//       })
//     })
//     return ret
//   }

//   private startEventStream(
//     socket,
//     stateLoaded$: Subject<LoginEvent>
//   ): Subject<AoEvent> {
//     const socketStream = new Subject<AoEvent>()
//     let step = 0
//     const merged = merge(stateLoaded$, socketStream)
//     const session = '895e17a0-6c2b-11ea-8d86-45f581e4b250'
//     const token =
//       'f3ccdd81c2ece391891cba4f7d4eb8466d3d44675dd70f11e21190ae13dfdf69'
//     const mergedSub = merged.subscribe({
//       next(val) {
//         Promise.resolve().then(() => {
//           // console.log('eventstrem ret', val)
//           if (val.type == 'state-loaded') {
//             socket.open()
//             socket.on('connect', function() {
//               console.log('wooo connected')
//               step = 1
//               socketStream.next({ type: 'socket-connected' })
//               socket.emit('authentication', {
//                 session,
//                 token
//               })
//             })
//           }
//           if (val.type == 'socket-connected') {
//             socket.on('authenticated', () => {
//               console.log('wo  authenticated')
//               socketStream.next({ type: 'socket-authenticated' })
//               socket.on('eventstream', ev => {
//                 console.log('got event!!!!')
//                 socketStream.next({ type: 'ao-action', payload: ev })
//               })
//             })
//           }
//           if (val.type == 'dispose-observable') {
//             mergedSub.unsubscribe()
//             socketStream.complete()
//             socketStream.unsubscribe()
//             stateLoaded$.next({ type: 'dispose-observable' })
//           }
//         })
//       }
//     })
//     return socketStream
//   }

//   private createStateStream(
//     stateEvent$: Subject<LoginEvent>,
//     event$: Subject<AoEvent>
//   ) {
//     const state$: Observable<State> = stateEvent$.pipe(
//       filter(val => val.type == 'state-loaded'),
//       first(),
//       mergeMap((val: StateEvent) => {
//         return event$.pipe(
//           startWith({ type: 'do-nothing' }),
//           scan((state, action: AoEvent): State => {
//             // console.log('oh my golly', action)
//             if (action.type == 'ao-action') applyEvent(state, action.payload)
//             return state
//           }, val.payload)
//         )
//       })
//     )
//     const ret = new BehaviorSubject(defaultState)
//     state$.subscribe(ret)
//     return ret
//   }

//   private getMember(state$: Observable<State>) {
//     const defaultMember: Member = {
//       type: 'member-created',
//       name: '',
//       memberId: '',
//       address: '',
//       active: 0,
//       balance: 0,
//       badges: [],
//       info: {},
//       timestamp: new Date(),
//       lastUsed: new Date(),
//       muted: false
//     }
//     const member$: Observable<Member> = state$.pipe(
//       map(state => {
//         for (let i = 0; i < state.sessions.length; i++) {
//           if (state.session.session == state.sessions[i].session) {
//             const id = state.sessions[i].ownerId
//             for (let j = 0; j < state.members.length; j++) {
//               if (state.members[j].memberId == id) {
//                 return state.members[j]
//               }
//             }
//           }
//         }
//         return defaultMember
//       }),
//       distinctUntilChanged()
//     )
//     const ret = new BehaviorSubject({
//       ...defaultMember
//     } as Member)
//     member$.subscribe(ret)
//     return ret
//   }

//   private getHashMap(state$: Observable<State>) {
//     const ret: Subject<Map<string, Task>> = new BehaviorSubject(new Map())
//     const hashMap$: Observable<Map<string, Task>> = state$.pipe(
//       map(state => {
//         let hashMap: Map<string, Task> = new Map()
//         state.tasks.forEach(t => {
//           // console.log('hashmap', hashMap)
//           hashMap.set(t.taskId, t)
//         })
//         return hashMap
//       }),
//       distinctUntilChanged()
//     )
//     hashMap$.subscribe(ret)
//     return ret
//   }
// }

// export function makeAoDrivers() {
//   const session: Subject<LoginEvent> = getSessionController()
//   const ao = makeAoDriver(session)
//   const aoApi = makeApiDriver(loginEventToSession(session))
//   return { ao, aoApi }
// }
