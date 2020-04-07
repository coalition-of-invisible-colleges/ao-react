import xs, { Stream } from 'xstream'
// import { VNode, DOMSource } from '@cycle/dom';
import { extractSinks } from 'cyclejs-utils'
import isolate from '@cycle/isolate'

import { driverNames } from '../drivers'
import {
  Sources,
  Sinks
  // Reducer,
  // Component
} from '../interfaces'
import { now, periodic, map, scan, delay } from '@most/core'

// import { Counter, State as CounterState } from './counter'
// import { Speaker, State as SpeakerState } from './speaker';

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
  const writeAo = sources.DOM.select('.card-create').events('click')
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
