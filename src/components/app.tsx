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
  tap
} from '@most/core'

import { driverNames } from '../drivers'
import {
  Sources,
  Sinks
  // Reducer,
  // Component
} from '../interfaces'
import { newDefaultScheduler } from '@most/scheduler'

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
  const click$ = sources.DOM.select('.card-create').events('click')
  const text$ = sources.DOM.select('.card-text').events('change')
  const textClick$ = R.compose(
    tap(val => console.log('textclick', val)),
    switchLatest,
    map(val => {
      console.log('click!')
      return take(1, text$)
    })
  )(click$)

  runEffects(textClick$, newDefaultScheduler())
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
    DOM: writeDom
    // ...sinks,
    // router: xs.merge(redirect$, sinks.router)
  }
}
