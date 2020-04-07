// import { Stream } from 'xstream'
import { Stream } from '@most/types'
import { VNode } from '@cycle/dom'

import { StateSource, Reducer } from '@cycle/state'
import { RouterSource, HistoryInput } from 'cyclic-router'
import { AoSource, FluxAction } from './drivers/aoStore'
import { MainDOMSource } from './drivers/ao/types'

export { Reducer } from '@cycle/state'

export type Component<State> = (s: Sources<State>) => Sinks<State>

export interface Sources<State> {
  DOM: MainDOMSource
  router: RouterSource
  ao: AoSource
  // state: StateSource<State>
}

export interface Sinks<State> {
  DOM?: Stream<VNode>
  router?: Stream<HistoryInput>
  ao?: Stream<FluxAction>
  abyss?: Stream<any>
  // state?: Stream<Reducer<State>>
}
