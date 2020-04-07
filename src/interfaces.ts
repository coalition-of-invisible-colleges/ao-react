// import { Stream } from 'xstream'
import { Stream } from '@most/types'
import { DOMSource, VNode } from '@cycle/dom'
import { StateSource, Reducer } from '@cycle/state'
import { RouterSource, HistoryInput } from 'cyclic-router'
import { AoSource, FluxAction } from './drivers/aoStore'

export { Reducer } from '@cycle/state'

export type Component<State> = (s: Sources<State>) => Sinks<State>

export interface Sources<State> {
  DOM: DOMSource
  router: RouterSource
  ao: AoSource
  // state: StateSource<State>
}

export interface Sinks<State> {
  DOM?: Stream<VNode>
  router?: Stream<HistoryInput>
  ao?: Stream<FluxAction>
  // state?: Stream<Reducer<State>>
}
