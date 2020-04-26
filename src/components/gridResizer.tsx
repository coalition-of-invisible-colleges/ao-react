import * as React from 'react'
import { observer } from 'mobx-react'
import { Redirect } from 'react-router-dom'
import aoStore, { AoState } from '../client/store'
import api from '../client/api'
import { ObservableMap } from 'mobx'
import { delay, cancelablePromise, noop } from '../utils'

interface GridResizerProps {
  gridId: string
}

@observer
export default class AoGridResizer extends React.Component<GridResizerProps> {
  constructor(props) {
    super(props)
    this.state = {}
    this.resizeRows = this.resizeRows.bind(this)
    this.resizeColumns = this.resizeColumns.bind(this)
  }

  resizeRows(change: number) {
    api.resizeGrid(
      this.props.gridId,
      aoStore.gridById.get(this.props.gridId).height + change,
      aoStore.gridById.get(this.props.gridId).width
    )
  }

  resizeColumns(change: number) {
    api.resizeGrid(
      this.props.gridId,
      aoStore.gridById.get(this.props.gridId).height,
      aoStore.gridById.get(this.props.gridId).width + change
    )
  }

  render() {
    console.log('render resizer')
    return (
      <div className="resizer">
        <button
          type="button"
          onClick={event => this.resizeRows(-1)}
          disabled={aoStore.gridById.get(this.props.gridId).height <= 1}>
          -row
        </button>
        <button
          type="button"
          onClick={event => this.resizeRows(1)}
          disabled={aoStore.gridById.get(this.props.gridId).height >= 30}>
          +row
        </button>
        <button
          type="button"
          onClick={event => this.resizeColumns(-1)}
          disabled={aoStore.gridById.get(this.props.gridId).width <= 1}>
          -column
        </button>
        <button
          type="button"
          onClick={event => this.resizeColumns(1)}
          disabled={aoStore.gridById.get(this.props.gridId).width >= 30}>
          +column
        </button>
      </div>
    )
  }
}
