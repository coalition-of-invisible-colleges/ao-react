import * as React from 'react'
import { observer } from 'mobx-react'
import { Redirect } from 'react-router-dom'
import aoStore, { AoState } from '../client/store'
import api from '../client/api'
import { ObservableMap } from 'mobx'
import { delay, cancelablePromise, noop } from '../utils'

interface GridResizerProps {
  taskId: string
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
      this.props.taskId,
      aoStore.hashMap.get(this.props.taskId).grid.height + change,
      aoStore.hashMap.get(this.props.taskId).grid.width
    )
  }

  resizeColumns(change: number) {
    api.resizeGrid(
      this.props.taskId,
      aoStore.hashMap.get(this.props.taskId).grid.height,
      aoStore.hashMap.get(this.props.taskId).grid.width + change
    )
  }

  render() {
    console.log('render resizer')
    return (
      <div className="resizer">
        <button
          type="button"
          onClick={event => this.resizeColumns(-1)}
          disabled={aoStore.hashMap.get(this.props.taskId).grid.width <= 1}
          className={'action minusColumn'}>
          -
        </button>
        <button
          type="button"
          onClick={event => this.resizeColumns(1)}
          disabled={aoStore.hashMap.get(this.props.taskId).grid.width >= 30}
          className={'action plusColumn'}>
          +
        </button>
        <button
          type="button"
          onClick={event => this.resizeRows(-1)}
          disabled={aoStore.hashMap.get(this.props.taskId).grid.height <= 1}
          className={'action minusRow'}>
          -
        </button>
        <button
          type="button"
          onClick={event => this.resizeRows(1)}
          disabled={aoStore.hashMap.get(this.props.taskId).grid.height >= 30}
          className={'action plusRow'}>
          +
        </button>
      </div>
    )
  }
}
