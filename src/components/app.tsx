// import { VNode, DOMSource } from '@cycle/dom';
import { extractSinks } from 'cyclejs-utils'
import isolate from '@cycle/isolate'
import * as R from 'ramda'
import {
  now,
  periodic,
  map,
  scan,
  delay,
  runEffects,
  take,
  switchLatest,
  tap,
  multicast,
  sample,
  combineArray
} from '@most/core'
import { Stream } from '@most/types'
import { driverNames } from '../drivers'
import {
  Sources,
  Sinks
  // Reducer,
  // Component
} from '../interfaces'
import { newDefaultScheduler } from '@most/scheduler'
import { AoActionAction as AoAction } from '../drivers/aoStore'
import { taskCreate } from '../lib/actions'
import { Member, Task } from '../drivers/ao/types'

// import { Counter, State as CounterState } from './counter'
// import { Speaker, State as SpeakerState } from './speaker';

interface Foo<T> {
  bar: T
}

export interface State {
  // counter?: CounterState
  // speaker?: SpeakerState
}

export function App(sources: Sources<State>): Sinks<State> {
  const writeDom = map(
    state => (
      <div>
        <input type="text" className="card-text" />
        <button type="button" className="card-create">
          Create card
        </button>
        <div>
          {state.tasks.map(task => (
            <div>{task.name}</div>
          ))}
        </div>
      </div>
    ),
    sources.ao.state$
  )
  const click$ = tap(
    val => console.log('clicked', val),
    sources.DOM.select('.card-create').events('click')
  )
  const text$ = R.compose(
    map((e: any): string => e.target.value),
    multicast
  )(sources.DOM.select('.card-text').events('change'))
  const res$ = tap(
    val => console.log('got response', val),
    sources.ao.response.select()
  )
  const createCard$ = R.compose(
    map(
      ({
        text,
        member,
        card
      }: {
        text: string
        member: Member
        card: Task
      }) => ({
        type: 'ao-action',
        payload: taskCreate(text, 'blue', [member.memberId], card.taskId)
      })
    ),
    combined$ => sample(combined$, click$)
  )(
    combineArray(
      (text: string, member: Member, card: Task) => ({ text, member, card }),
      [text$, sources.ao.member$, sources.ao.memberCard$]
    )
  )

  runEffects(res$, newDefaultScheduler())
  // runEffects(
  //   tap(val => console.log('member', val), createCard$),
  //   newDefaultScheduler()
  // )
  // const writeAo = map((text: string): AoAction => ({
  //   type: 'ao-action',
  //   payload:

  //   }
  // }),textClick$)
  // const match$ = sources.router.define({
  //   '/counter': isolate(Counter, 'counter')
  //   // '/speaker': isolate(Speaker, 'speaker')
  // })
  // const componentSinks$: Stream<Sinks<State>> = match$
  //   .filter(({ path, value }: any) => path && typeof value === 'function')
  //   .map(({ path, value }: { path: string; value: Component<any> }) => {
  //     return value({
  //       ...sources,
  //       router: sources.router.path(path)
  //     })
  //   })

  // const redirect$: Stream<string> = sources.router.history$
  //   .filter((l: Location) => l.pathname === '/')
  //   .mapTo('/counter')

  // const sinks = extractSinks(componentSinks$, driverNames)
  return {
    DOM: writeDom,
    ao: createCard$
    // ...sinks,
    // router: xs.merge(redirect$, sinks.router)
  }
}
