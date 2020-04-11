import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore, { AoState } from '../client/store'
import api from '../client/api'
import { ObservableMap } from 'mobx'
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

interface GridProps {
  grid: GridType
  sel?: Sel
  onClick: (event: any) => void
  onKeyDown: (event: any) => void
  onSelection: (event: any) => void
  onChange: (event: any) => void
}
const RenderGrid: React.FunctionComponent<GridProps> = observer(
  ({ grid, onClick, sel, onKeyDown, onChange, onSelection }) => {
    console.log('rerender grid', grid)
    const ret = []
    for (let j = 0; j < grid.size; j++) {
      for (let i = 0; i < grid.size; i++) {
        if (sel && sel.x == i && sel.y == j) {
          ret.push(
            <textarea
              id={i + '-' + j}
              onClick={onClick}
              autoFocus
              onBlur={() => console.log('selection event', i, j)}
              className="square"
              onChange={onChange}
              onKeyDown={onKeyDown}
              style={{
                gridRow: (j + 1).toString(),
                gridColumn: (i + 1).toString()
              }}
            />
          )
        } else {
          if (grid[j] && grid[j][i] && typeof (grid[j][i] === 'string')) {
            ret.push(
              <div
                id={i + '-' + j}
                onClick={onClick}
                className="square"
                style={{
                  gridRow: (j + 1).toString(),
                  gridColumn: (i + 1).toString()
                }}>
                {aoStore.hashMap.get(grid[j][i]).name}
              </div>
            )
          } else {
            ret.push(
              <div
                id={i + '-' + j}
                onClick={onClick}
                className="square"
                style={{
                  gridRow: (j + 1).toString(),
                  gridColumn: (i + 1).toString()
                }}></div>
            )
          }
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
)

interface AoGridState {
  theme: number
  text?: string
  sel?: Sel
}

@observer
export class AoGrid extends React.Component<{}, AoGridState> {
  theme: string
  constructor(props) {
    super(props)
    this.state = {
      theme: 1
    }
    this.changeTheme = this.changeTheme.bind(this)
    this.onClick = this.onClick.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.onSelectionChange = this.onSelectionChange.bind(this)
    this.onChange = this.onChange.bind(this)
    // this.ref = React.createRef()
    console.log('grid', aoStore.state.grid)
  }
  changeTheme() {
    if (this.state.theme == 3) {
      this.setState({ theme: 1 })
      document.body.className = 'theme-1'
    } else {
      const newTheme = this.state.theme + 1
      document.body.className = 'theme-' + newTheme
      this.setState({ theme: newTheme })
    }
  }
  onClick(event) {
    const [xs, ys] = event.target.id.split('-')
    const x = parseInt(xs)
    const y = parseInt(ys)
    this.setState({ sel: { x, y } })
    console.log('clicked', x, y)
    // this.ref.current.focus()
  }
  onKeyDown(event) {
    if (event.key === 'Enter') {
      console.log('enter')
      api.createAndOrAddCardToGrid(
        this.state.sel.x,
        this.state.sel.y,
        this.state.text
      )
      this.setState({ sel: undefined, text: undefined })
    }
  }
  onSelectionChange(event) {
    console.log('selected event', event)
  }
  componentDidMount() {
    document.body.className = 'theme-' + this.state.theme
  }
  onChange(event) {
    console.log('on change', event.target.value)
    this.setState({ text: event.target.value })
  }
  render() {
    console.log('render main grid', aoStore.state.grid)
    return (
      <div id="gridContainer">
        <h2>Meme Grid</h2>
        <RenderGrid
          sel={this.state.sel}
          onClick={this.onClick}
          onKeyDown={this.onKeyDown}
          onSelection={this.onSelectionChange}
          onChange={this.onChange}
          grid={{ ...aoStore.state.grid, size: 8 }}
        />
      </div>
    )
  }
}
