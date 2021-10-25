import React from 'react'
import { observer } from 'mobx-react'
import aoStore, { GridStyle } from '../client/store'
import api from '../client/api'

interface GridResizerProps {
  taskId: string
  gridStyle: GridStyle
}

@observer
export default class AoGridResizer extends React.Component<GridResizerProps> {
  constructor(props) {
    super(props)
    this.increaseRows = this.increaseRows.bind(this)
    this.decreaseRows = this.decreaseRows.bind(this)
    this.increaseColumns = this.increaseColumns.bind(this)
    this.decreaseColumns = this.decreaseColumns.bind(this)
    this.removeGrid = this.removeGrid.bind(this)
  }

  increaseRows() {
    const card = aoStore.hashMap.get(this.props.taskId)
    api.resizeGrid(this.props.taskId, card.grid.height + 1, card.grid.width)
  }

  decreaseRows() {
    const card = aoStore.hashMap.get(this.props.taskId)
    api.resizeGrid(this.props.taskId, card.grid.height - 1, card.grid.width)
  }

  increaseColumns() {
    const card = aoStore.hashMap.get(this.props.taskId)
    api.resizeGrid(this.props.taskId, card.grid.height, card.grid.width + 1)
  }

  decreaseColumns() {
    const card = aoStore.hashMap.get(this.props.taskId)
    api.resizeGrid(this.props.taskId, card.grid.height, card.grid.width - 1)
  }

  removeGrid() {
    api.removeGridFromCard(this.props.taskId)
  }

  render() {
    const card = aoStore.hashMap.get(this.props.taskId)

    if (!card || !card.grid) {
      return null
    }

    const isPyramid = card.gridStyle === 'pyramid'

    return (
      <div className="resizer">
        <div className={'columns' + (isPyramid ? ' hide' : '')}>
          <button
            type="button"
            onClick={this.decreaseColumns}
            disabled={card.grid.width <= 1}
            className="action minus">
            -
          </button>
          <button
            type="button"
            onClick={this.increaseColumns}
            disabled={card.grid.width >= 100}
            className="action plus">
            +
          </button>
        </div>
        <div className="rows">
          <button
            type="button"
            onClick={this.decreaseRows}
            disabled={card.grid.height <= 1}
            className="action minus">
            -
          </button>
          <button
            type="button"
            onClick={this.increaseRows}
            disabled={card.grid.height >= 100}
            className="action plus">
            +
          </button>
          {(card.grid.width <= 1 || card.grid.height <= 1) && (
            <button
              type="button"
              onClick={this.removeGrid}
              className="action remove">
              -grid
            </button>
          )}
        </div>
      </div>
    )
  }
}
