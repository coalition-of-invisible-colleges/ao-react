import { MainDOMSource } from '../drivers/ao/types'
import isolate from '@cycle/isolate'
import { State as AoState } from '../drivers/ao/types'
import { Sources, Sinks, Reducer } from '../interfaces'
import { map, tap } from '@most/core'
import { Stream } from '@most/types'
import { VNode } from '@cycle/dom'

// import { GridCard as GridCardSchema, State as GridCardState } from './grid'
interface Sel {
  x: number
  y: number
}

interface GridType {
  [y: number]: { [x: number]: string }
  size: number
}

export interface State {
  selected?: Sel
  // gridCard: GridCardState
}

export const defaultState: State = {
  selected: undefined
}

interface DOMIntent {
  // increment$: Stream<null>
  // decrement$: Stream<null>
  click$: Stream<any>
}

export function Grid({ DOM, ao }: Sources<State>): Sinks<State> {
  const { click$ }: DOMIntent = intent(DOM)
  const out = tap(val => console.log('model click', val), model(click$))
  // const GridCard = isolate(GridCardSchema, 'gridCard')
  return {
    DOM: view(ao.state$),
    abyss: out
    // router: redirect(link$)
  }
}

function model(click$: Stream<any>): Stream<any> {
  return map((val: any) => {
    const id: string = val.target.id
    const arr = id.split('-')
    return { x: parseInt(arr[0]), y: parseInt(arr[1]) }
  }, click$)
  // const init$ = xs.of<Reducer<State>>(prevState =>
  //   prevState === undefined ? defaultState : prevState
  // )
  // const addToState: (n: number) => Reducer<State> = n => state => ({
  //   ...state,
  //   count: (state as State).count + n
  // })
  // const add$ = increment$.mapTo(addToState(1))
  // const subtract$ = decrement$.mapTo(addToState(-1))
  // return xs.merge(init$, add$, subtract$)
}

function RenderGrid(props: { grid: GridType }): VNode {
  const { grid } = props
  const ret = []
  for (let j = 0; j < grid.size; j++) {
    for (let i = 0; i < grid.size; i++) {
      if (grid[j] && grid[j][i] && typeof (grid[j][i] === 'string')) {
        ret.push(
          <div
            id={i + '-' + j}
            className="square"
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
            id={i + '-' + j}
            className="square"
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
      className="grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(' + grid.size.toString() + ', 5em)',
        gridTemplateRows: 'repeat(' + grid.size.toString() + ', 5em)'
      }}>
      {ret}
    </div>
  )
}

function view(state$: Stream<AoState>): Stream<VNode> {
  return map(
    (state: AoState): VNode => (
      <div>
        <h2>Meme Grid</h2>
        <span>{'Size: '}</span>
        <button type="button" className="add">
          Increase
        </button>
        <button type="button" className="subtract">
          Decrease
        </button>
        <button type="button" data-action="navigate">
          Test Link
        </button>
        <RenderGrid
          grid={{
            size: 8,
            3: { 3: 'click to type' },
            4: { 4: 'state loading', 5: 'drag-and-drop', 6: 'image upload' },
            5: { 4: 'display image', 5: 'create card' }
          }}
        />
      </div>
    ),
    state$
  )
}

function intent(DOM: MainDOMSource): DOMIntent {
  const click$ = DOM.select('.square').events('click')

  // const decrement$ = DOM.select('.subtract')
  //   .events('click')
  //   .mapTo(null)

  // const link$ = DOM.select('[data-action="navigate"]')
  //   .events('click')
  //   .mapTo(null)

  return { click$ }
}

// function redirect(link$: Stream<any>): Stream<string> {
//   return link$.mapTo('/speaker')
// }
