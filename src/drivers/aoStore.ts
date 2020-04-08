import {
  filter,
  mergeArray,
  tap,
  combine,
  map,
  now,
  scan,
  merge,
  combineArray,
  startWith,
  switchLatest,
  skipRepeats,
  multicast
} from '@most/core'
import fromObservable from 'most-observable'
import { Stream, Sink, Scheduler, Disposable, Time } from '@most/types'
import * as request from 'superagent'
import * as R from 'ramda'
import { SocketStream, SocketEvent } from './ao/SocketEvent'
import { SessionStream } from './ao/Session'
import { GetStateStream, StateLoadedEvent } from './ao/GetState'
import * as calculations from '../calculations'
import { Client } from 'socket.io'
import { Subject, create } from 'most-subject'

import modules from '../modules'
import * as _ from 'lodash'
import { AoAction as AoActionRaw } from '../lib/actions'
import { currentTime } from '@most/scheduler'
import { applyEvent } from '../mutations'
import { State, SessionAction, UserSession, Member, Task } from './ao/types'
import { AoResponseSource, ApiSelector } from './ao/ApiSource'
import { AoResponseStream } from './ao/ApiStream'

export let mode = 'browser'
// let provideXMLHttpRequest
export function setMode(m: string) {
  if (m == 'nodejs') {
    mode = m
  }
}

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

export default abstract class Pipe<A, B> implements Sink<A> {
  protected readonly sink: Sink<B>

  constructor(sink: Sink<B>) {
    this.sink = sink
  }

  abstract event(t: Time, x: A): void

  end(t: Time): void {
    return this.sink.end(t)
  }

  error(t: Time, e: Error): void {
    return this.sink.error(t, e)
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

type hasReadSelector<T> = { _namespace?: Array<string>; _category?: string } & T
type hasWriteSelector<T> = {
  _namespace?: Array<string>
  _category?: string
} & T

type AoResponseRaw = { type: 'ao-response'; payload: any }
export type AoAction = hasWriteSelector<AoActionRaw>
export type AoResponse = hasReadSelector<AoResponseRaw>

export type FluxAction = { type: string; payload?: any }

export function createStateDriver(name: string = 'http') {
  return function(action$: Stream<FluxAction>) {
    const driver = new StateDriver(action$, name)
    const { state$, hashMap$, member$, memberCard$, response } = driver
    return { state$, hashMap$, member$, memberCard$, response }
  }
}

export interface AoSource {
  state$: Stream<State>
  hashMap$: Stream<Map<string, Task>>
  member$: Stream<Member>
  memberCard$: Stream<Task>
  response: ApiSelector
}

export type AoActionAction = { type: 'ao-action'; payload: AoAction }

export class StateDriver {
  public state$: Stream<State>
  public hashMap$: Stream<Map<string, Task>>
  public member$: Stream<Member>
  public memberCard$: Stream<Task>
  public response: AoResponseSource
  constructor(private act$: Stream<FluxAction>, public _name: string) {
    // const sessionActs$ = filter(
    //   (val: SessionAction) =>
    //     val.type == 'try-load-session' || val.type == 'try-login',
    //   startWith({ type: 'try-load-session' }, act$)
    // )
    const sessionActs$ = R.compose(
      filter(
        (val: SessionAction) =>
          val.type == 'try-load-session' || val.type == 'try-login'
      ),
      tap(val => console.log('got val', val)),
      startWith({ type: 'try-load-session' })
    )(act$)
    const sessionLoaded$ = new SessionStream(sessionActs$)
    const session$ = multicast(map(val => val.payload, sessionLoaded$))
    const aoActions$: Stream<AoAction> = R.compose(
      multicast,
      tap((val: AoAction) => console.log('got action', val)),
      map((val: AoActionAction): AoAction => val.payload),
      filter((val: FluxAction) => val.type == 'ao-action')
    )(this.act$)
    const response$ = new AoResponseStream(aoActions$, session$)
    this.response = new ApiSelector(response$, _name)
    this.state$ = R.compose(
      switchLatest,
      map((session: UserSession) => {
        console.log('load session', session)
        const getState = new GetStateStream(
          now({ type: 'load-state' }),
          session
        )
        const socketEvents = new SocketStream(
          now({ type: 'start-socket' }),
          session
        )
        const aoEvents: Stream<AoActionRaw> = R.compose(
          map((val: any) => {
            console.log('got event', val)
            return val.payload
          }),
          filter((val: SocketEvent) => val.type == 'ao-action')
        )(socketEvents) as Stream<AoActionRaw>
        const state$: Stream<State> = R.compose(
          // multicast,
          (state$$: Stream<Stream<State>>) => switchLatest(state$$),
          map(
            (stateLoaded: StateLoadedEvent): Stream<State> => {
              return scan(
                (state: State, event: AoActionRaw): State => {
                  applyEvent(state, event)
                  console.log('has state', state)
                  return state
                },
                stateLoaded.payload,
                aoEvents
              )
            }
          )
        )(tap(val => console.log('got state', val), getState))
        return state$
      })
    )(session$)
    // this.state$ = map(val => val.state$, stateAndResponse)
    this.member$ = this.getMember(this.state$)
    this.hashMap$ = this.getHashMap(this.state$)
    this.memberCard$ = this.getMemberCard(this.member$, this.hashMap$)
  }

  private getMember(state$: Stream<State>) {
    const defaultMember: Member = {
      type: 'member-created',
      name: '',
      memberId: '',
      address: '',
      active: 0,
      balance: 0,
      badges: [],
      info: {},
      timestamp: new Date(),
      lastUsed: new Date(),
      muted: false
    }
    const member$: Stream<Member> = R.compose(
      multicast,
      (member$: Stream<Member>) => skipRepeats(member$),
      map((state: State) => {
        for (let i = 0; i < state.sessions.length; i++) {
          if (state.session.session == state.sessions[i].session) {
            const id = state.sessions[i].ownerId
            for (let j = 0; j < state.members.length; j++) {
              if (state.members[j].memberId == id) {
                return state.members[j]
              }
            }
          }
        }
        return defaultMember
      })
    )(state$)
    return member$
  }

  private getHashMap(state$: Stream<State>): Stream<Map<string, Task>> {
    const hashMap$: Stream<Map<string, Task>> = R.compose(
      multicast,
      (hashMap$: Stream<Map<string, Task>>) => skipRepeats(hashMap$),
      map((state: State) => {
        let hashMap: Map<string, Task> = new Map()
        state.tasks.forEach(t => {
          hashMap.set(t.taskId, t)
        })
        return hashMap
      })
    )(state$)
    return hashMap$
  }
  private getMemberCard(
    member$: Stream<Member>,
    hashMap$: Stream<Map<string, Task>>
  ): Stream<Task> {
    return multicast(
      combine(
        (member: Member, hashMap: Map<string, Task>): Task => {
          let memberCard = _.merge(
            calculations.blankCard('', '', ''),
            hashMap.get(member.memberId)
          )
          return memberCard
        },
        member$,
        hashMap$
      )
    )
  }
}
