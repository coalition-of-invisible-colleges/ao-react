import xs, { Stream } from 'xstream'
import { VNode, DOMSource } from '@cycle/dom'
import isolate from '@cycle/isolate'

import { Sources, Sinks, Reducer } from '../interfaces'

// import { GridCard as GridCardSchema, State as GridCardState } from './grid'

export interface State {
  count: number
  // gridCard: GridCardState
}

export const defaultState: State = {
  count: 8
}

interface DOMIntent {
  increment$: Stream<null>
  decrement$: Stream<null>
  link$: Stream<null>
}

export function Grid({ DOM, state }: Sources<State>): Sinks<State> {
  const { increment$, decrement$, link$ }: DOMIntent = intent(DOM)
  // const GridCard = isolate(GridCardSchema, 'gridCard')
  return {
    DOM: view(state.stream),
    state: model(increment$, decrement$),
    router: redirect(link$)
  }
}

function model(
  increment$: Stream<any>,
  decrement$: Stream<any>
): Stream<Reducer<State>> {
  const init$ = xs.of<Reducer<State>>(prevState =>
    prevState === undefined ? defaultState : prevState
  )

  const addToState: (n: number) => Reducer<State> = n => state => ({
    ...state,
    count: (state as State).count + n
  })
  const add$ = increment$.mapTo(addToState(1))
  const subtract$ = decrement$.mapTo(addToState(-1))

  return xs.merge(init$, add$, subtract$)
}

function RenderRemainder(props: { grid: GridType }): VNode {
  const { grid } = props
  const ret = []

  // for (let j = grid.size; j < grid.length; j++) {
  //   for (let i = grid.size; i < grid[j].length; i++) {
  //     if (grid[j] && grid[j][i] && typeof (grid[j][i] === 'string')) {
  //       ret.push(<li>{grid[j][i]}</li>)
  //     }
  //   }
  // }
  return <ol></ol>
}

interface GridType {
  [y: number]: { [x: number]: string }
  size: number
}

function RenderGrid(props: { grid: GridType }): VNode {
  const { grid } = props
  const ret = []
  for (let j = 0; j < grid.size; j++) {
    for (let i = 0; i < grid.size; i++) {
      if (grid[j] && grid[j][i] && typeof (grid[j][i] === 'string')) {
        ret.push(
          <div
            className='square'
            style={{
              'grid-row': (j + 1).toString(),
              'grid-column': (i + 1).toString()
            }}>
            {grid[j][i]}
          </div>
        )
      } else {
        ret.push(
          <div
            className='square'
            style={{
              'grid-row': (j + 1).toString(),
              'grid-column': (i + 1).toString()
            }}></div>
        )
      }
    }
  }
  return (
    <div
      className='grid'
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(' + grid.size.toString() + ', 5em)',
        gridTemplateRows: 'repeat(' + grid.size.toString() + ', 5em)'
      }}>
      {ret}
    </div>
  )
}

function view(state$: Stream<State>): Stream<VNode> {
  return state$.map(({ count }) => (
    <div>
      <h2>Meme Grid</h2>
      <span>{'Size: ' + count}</span>
      <button type='button' className='add'>
        Increase
      </button>
      <button type='button' className='subtract'>
        Decrease
      </button>
      <button type='button' data-action='navigate'>
        Test Link
      </button>
      <RenderGrid
        grid={{
          size: count,
          3: { 3: 'click to type' },
          4: { 4: 'state loading', 5: 'drag-and-drop', 6: 'image upload' },
          5: { 4: 'display image', 5: 'create card' }
        }}
      />
    </div>
  ))
}

function intent(DOM: DOMSource): DOMIntent {
  const increment$ = DOM.select('.add')
    .events('click')
    .mapTo(null)

  const decrement$ = DOM.select('.subtract')
    .events('click')
    .mapTo(null)

  const link$ = DOM.select('[data-action="navigate"]')
    .events('click')
    .mapTo(null)

  return { increment$, decrement$, link$ }
}

function redirect(link$: Stream<any>): Stream<string> {
  return link$.mapTo('/speaker')
}
