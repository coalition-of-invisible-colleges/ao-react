import React from 'react'
import { observer } from 'mobx-react'
import aoStore, { Task } from '../client/store'
import { TaskContext } from './taskContext'
import api from '../client/api'
import { ObservableMap } from 'mobx'
import { delay, cancelablePromise, noop } from '../utils'

@observer
export default class AoGridResizer extends React.PureComponent {
  static contextType = TaskContext

  constructor(props) {
    super(props)
    this.increaseRows = this.increaseRows.bind(this)
    this.decreaseRows = this.decreaseRows.bind(this)
    this.increaseColumns = this.increaseColumns.bind(this)
    this.decreaseColumns = this.decreaseColumns.bind(this)
  }

  increaseRows() {
    const { card, setRedirect } = this.context
    api.resizeGrid(card.taskId, card.grid.height + 1, card.grid.width)
  }

  decreaseRows() {
    const { card, setRedirect } = this.context
    api.resizeGrid(card.taskId, card.grid.height - 1, card.grid.width)
  }

  increaseColumns() {
    const { card, setRedirect } = this.context
    api.resizeGrid(card.taskId, card.grid.height, card.grid.width + 1)
  }

  decreaseColumns() {
    const { card, setRedirect } = this.context
    api.resizeGrid(card.taskId, card.grid.height, card.grid.width - 1)
  }

  render() {
    const { card, setRedirect } = this.context

    if (!card.grid) {
      return null
    }

    return (
      <div className={'resizer'}>
        <div className={'columns'}>
          <button
            type="button"
            onClick={this.decreaseColumns}
            disabled={card.grid.width <= 1}
            className={'action minus'}>
            -
          </button>
          <button
            type="button"
            onClick={this.increaseColumns}
            disabled={card.grid.width >= 30}
            className={'action plus'}>
            +
          </button>
        </div>
        <div className={'rows'}>
          <button
            type="button"
            onClick={this.decreaseRows}
            disabled={card.grid.height <= 1}
            className={'action minus'}>
            -
          </button>
          <button
            type="button"
            onClick={this.increaseRows}
            disabled={card.grid.height >= 30}
            className={'action plus'}>
            +
          </button>
        </div>
      </div>
    )
  }
}
