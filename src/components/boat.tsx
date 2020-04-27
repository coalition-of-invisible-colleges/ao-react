// import * as React from 'react'
// import { observer } from 'mobx-react'
// import { Redirect } from 'react-router-dom'
// import aoStore, { AoState } from '../client/store'
// import api from '../client/api'
// import { ObservableMap } from 'mobx'
// import { delay, cancelablePromise, noop } from '../utils'
// // import { GridCard as GridCardSchema, State as GridCardState } from './grid'

// interface Sel {
//   x: number
//   y: number
// }

// interface GridType {
//   [y: number]: { [x: number]: string }
//   size: number
// }

// export interface State {
//   selected?: Sel
//   // gridCard: GridCardState
// }

// export const defaultState: State = {
//   selected: undefined
// }

// interface GridProps {
//   grid: GridType
//   sel?: Sel
//   onClick: (event: any) => void
//   onKeyDown: (event: any) => void
//   onDoubleClick: (event: any) => void
//   onChange: (event: any) => void
// }
// const RenderGrid: React.FunctionComponent<GridProps> = observer(
//   ({ grid, onClick, sel, onKeyDown, onChange, onDoubleClick }) => {
//     console.log('rerender grid', grid)
//     const ret = []
//     for (let j = 0; j < grid.size; j++) {
//       for (let i = 0; i < grid.size; i++) {
//         if (sel && sel.x == i && sel.y == j) {
//           ret.push(
//             <textarea
//               id={i + '-' + j}
//               onClick={onClick}
//               autoFocus
//               onBlur={() => console.log('selection event', i, j)}
//               className="square"
//               onChange={onChange}
//               onKeyDown={onKeyDown}
//               onDoubleClick={onDoubleClick}
//               style={{
//                 gridRow: (j + 1).toString(),
//                 gridColumn: (i + 1).toString()
//               }}
//             />
//           )
//         } else {
//           if (grid[j] && grid[j][i] && typeof (grid[j][i] === 'string')) {
//             ret.push(
//               <div
//                 id={i + '-' + j}
//                 onClick={onClick}
//                 onDoubleClick={onDoubleClick}
//                 className="square"
//                 style={{
//                   gridRow: (j + 1).toString(),
//                   gridColumn: (i + 1).toString()
//                 }}>
//                 {aoStore.hashMap.get(grid[j][i]).name}
//               </div>
//             )
//           } else {
//             ret.push(
//               <div
//                 id={i + '-' + j}
//                 onClick={onClick}
//                 onDoubleClick={onDoubleClick}
//                 className="square empty"
//                 style={{
//                   gridRow: (j + 1).toString(),
//                   gridColumn: (i + 1).toString()
//                 }}></div>
//             )
//           }
//         }
//       }
//     }
//     return (
//       <div
//         className="grid"
//         style={{
//           display: 'grid',
//           gridTemplateColumns: 'repeat(' + grid.size.toString() + ', 5em)',
//           gridTemplateRows: 'repeat(' + grid.size.toString() + ', 5em)'
//         }}>
//         {ret}
//       </div>
//     )
//   }
// )

// interface AoGridState {
//   redirect?: string
//   text?: string
//   sel?: Sel
// }

// @observer
// export class AoGrid extends React.Component<{}, AoGridState> {
//   constructor(props) {
//     super(props)
//     this.state = {}
//     this.onClick = this.onClick.bind(this)
//     this.onKeyDown = this.onKeyDown.bind(this)
//     this.onSelectionChange = this.onSelectionChange.bind(this)
//     this.onChange = this.onChange.bind(this)
//     // this.ref = React.createRef()
//     console.log('grid', aoStore.state.grid)
//     this.onDoubleClick = this.onDoubleClick.bind(this)
//   }
//   componentWillUnmount() {
//     // cancel all pending promises to avoid
//     // side effects when the component is unmounted
//     this.clearPendingPromises()
//   }

//   pendingPromises = []

//   appendPendingPromise = promise =>
//     (this.pendingPromises = [...this.pendingPromises, promise])

//   removePendingPromise = promise =>
//     (this.pendingPromises = this.pendingPromises.filter(p => p !== promise))

//   clearPendingPromises = () => this.pendingPromises.map(p => p.cancel())
//   onDoubleClick(e) {
//     console.log('double click')
//     this.clearPendingPromises()
//     const [xs, ys] = e.target.id.split('-')
//     const x = parseInt(xs)
//     const y = parseInt(ys)
//     this.setState({ redirect: '/task/' + aoStore.state.grid[y][x] })
//   }
//   onClick(event) {
//     console.log('clicked!')
//     const [xs, ys] = event.target.id.split('-')
//     const x = parseInt(xs)
//     const y = parseInt(ys)
//     const waitForClick = cancelablePromise(delay(200))
//     this.appendPendingPromise(waitForClick)

//     return waitForClick.promise
//       .then(() => {
//         this.setState({ sel: { x, y } })
//         console.log('clicked', x, y)
//         // this.ref.current.focus()
//         // if the promise wasn't cancelled, we execute
//         // the callback and remove it from the queue
//         this.removePendingPromise(waitForClick)
//       })
//       .catch(errorInfo => {
//         // rethrow the error if the promise wasn't
//         // rejected because of a cancelation
//         this.removePendingPromise(waitForClick)
//         if (!errorInfo.isCanceled) {
//           throw errorInfo.error
//         }
//       })
//   }
//   onKeyDown(event) {
//     if (event.key === 'Enter') {
//       console.log('enter')
//       api.pinCardToGrid(
//         this.state.sel.x,
//         this.state.sel.y,
//         this.state.text
//       )
//       this.setState({ sel: undefined, text: undefined })
//     }
//   }
//   onSelectionChange(event) {
//     console.log('selected event', event)
//   }
//   componentDidMount() {}
//   onChange(event) {
//     console.log('on change', event.target.value)
//     this.setState({ text: event.target.value })
//   }
//   render() {
//     console.log('render main grid', aoStore.state.grid)
//     return (
//       <div>
//         {!this.state.redirect && (
//           <div id="gridContainer">
//             <h2>Meme Grid</h2>
//             <RenderGrid
//               sel={this.state.sel}
//               onClick={this.onClick}
//               onKeyDown={this.onKeyDown}
//               onDoubleClick={this.onDoubleClick}
//               onChange={this.onChange}
//               grid={{ ...aoStore.state.grid, size: 8 }}
//             />
//           </div>
//         )}
//         {this.state.redirect && <Redirect to={this.state.redirect} />}
//       </div>
//     )
//   }
// }
