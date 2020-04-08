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
import aoStore from '../client/store'
import { VNode } from '@cycle/dom'
import { Grid } from './grid'

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
  const sinks = Grid(sources)
  // const writeDom = map(
  //   state => (
  //     <div>
  //       <input type="text" className="card-text" />
  //       <button type="button" className="card-create">
  //         Create card
  //       </button>
  //       <div>
  //         {state.tasks.map(task => (
  //           <div>{task.name}</div>
  //         ))}
  //       </div>
  //     </div>
  //   ),
  //   sources.ao.state$
  // )
  // const click$ = tap((val: any) => {
  //   // val.stopPropagation()
  //   // val.stopImmediatePropagation()
  //   console.log('clicked', val.target.id)
  // }, sources.DOM.select('.square').events('click'))
  // const text$ = R.compose(
  //   map((e: any): string => e.target.value),
  //   multicast
  // )(sources.DOM.select('.card-text').events('change'))
  // // const res$ = tap(
  // //   val => console.log('got response', val),
  // const res$ = tap(
  //   x => console.log('response val', x),
  //   sources.ao.response.select('create-task')
  // )
  // // )
  // const createCard$ = R.compose(
  //   multicast,
  //   tap((val: any) => console.log('created card', val)),
  //   map(
  //     ({
  //       text,
  //       member,
  //       card
  //     }: {
  //       text: string
  //       member: Member
  //       card: Task
  //     }) => {
  //       console.log('making action')
  //       return {
  //         type: 'ao-action',
  //         payload: {
  //           ...taskCreate(text, 'blue', [member.memberId], card.taskId),
  //           category: 'create-task'
  //         }
  //       }
  //     }
  //   ),
  //   combined$ => sample(combined$, click$)
  // )(
  //   combineArray(
  //     (text: string, member: Member, card: Task) => ({ text, member, card }),
  //     [text$, sources.ao.member$, sources.ao.memberCard$]
  //   )
  // )

  // runEffects(createCard$, newDefaultScheduler())
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
  return { ...sinks }
}

// function RenderGrid(props: { grid: GridType }): VNode {
//   const { grid } = props
//   const ret = []
//   for (let j = 0; j < grid.size; j++) {
//     for (let i = 0; i < grid.size; i++) {
//       if (grid[j] && grid[j][i] && typeof (grid[j][i] === 'string')) {
//         ret.push(
//           <div
//             id={i + '-' + j}
//             className="square"
//             style={{
//               'grid-row': (j + 1).toString(),
//               'grid-column': (i + 1).toString()
//             }}>
//             {grid[j][i]}
//           </div>
//         )
//       } else {
//         ret.push(
//           <div
//             id={i + '-' + j}
//             className="square"
//             style={{
//               'grid-row': (j + 1).toString(),
//               'grid-column': (i + 1).toString()
//             }}></div>
//         )
//       }
//     }
//   }
//   return (
//     <div
//       className="grid"
//       style={{
//         display: 'grid',
//         gridTemplateColumns: 'repeat(' + grid.size.toString() + ', 5em)',
//         gridTemplateRows: 'repeat(' + grid.size.toString() + ', 5em)'
//       }}>
//       {ret}
//     </div>
//   )
// }

// function view(state$: Stream<State>): Stream<VNode> {
//   return map(
//     (state: State): VNode => (
//       <div>
//         <h2>Meme Grid</h2>
//         <span>{'Size: '}</span>
//         <button type="button" className="add">
//           Increase
//         </button>
//         <button type="button" className="subtract">
//           Decrease
//         </button>
//         <button type="button" data-action="navigate">
//           Test Link
//         </button>
//         <RenderGrid
//           grid={{
//             size: 8,
//             3: { 3: 'click to type' },
//             4: { 4: 'state loading', 5: 'drag-and-drop', 6: 'image upload' },
//             5: { 4: 'display image', 5: 'create card' }
//           }}
//         />
//       </div>
//     ),
//     state$
//   )
// }
