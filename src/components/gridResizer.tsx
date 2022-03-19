import React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import { GridStyle } from '../interfaces'
import AoHiddenFieldset from './hiddenFieldset'
import api from '../client/api'
import GridImg from '../assets/images/grid.svg'
import Pyramid from '../assets/images/pyramid.svg'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'

interface GridMenuProps {
  taskId: string
  gridStyle: GridStyle
}

function AoGridMenu(props: GridMenuProps) {
  const card = aoStore.hashMap.get(props.taskId)
  if (
    !card ||
    !card.grid ||
    card.grid.height <= 1 ||
    (card.gridStyle !== 'pyramid' && card.grid.width <= 1)
  ) {
    return null
  }

  const switchToPyramid = event => {
    event.stopPropagation()
    api.setCardProperty(props.taskId, 'gridStyle', 'pyramid')
  }

  const switchToGrid = event => {
    event.stopPropagation()
    api.setCardProperty(props.taskId, 'gridStyle', 'grid')
  }

  const isPyramid = props.gridStyle === 'pyramid'
  console.log('AoGridMenu render()')

  function increaseSquareSize() {
    api.resizeGrid(
      props.taskId,
      card.grid.height,
      card.grid.width,
      card.grid.size && card.grid.size >= 1 ? card.grid.size + 1 : 10
    )
  }

  function decreaseSquareSize() {
    api.resizeGrid(
      props.taskId,
      card.grid.height,
      card.grid.width,
      card.grid.size && card.grid.size >= 1 ? card.grid.size - 1 : 8
    )
  }

  const renderedGridMenu = (
    <div className="gridMenu">
      <div>
        <button
          className={'action' + (isPyramid ? ' selected' : '')}
          onClick={switchToPyramid}
          disabled={isPyramid}>
          <img src={Pyramid} />
          Pyramid
        </button>
        <button
          className={'action' + (!isPyramid ? ' selected' : '')}
          onClick={switchToGrid}
          disabled={!isPyramid}>
          <img src={GridImg} />
          Grid
        </button>
      </div>
      <div className='oneLineSetting'>
        <span>squares:</span>
        <button
          type="button"
          onClick={decreaseSquareSize}
          disabled={card.grid.size <= 1}
          className="action minus">
          -
        </button>
        <button
          type="button"
          onClick={increaseSquareSize}
          disabled={card.grid.size >= 40}
          className="action plus">
          +
        </button>
      </div>
    </div>
  )

  return renderedGridMenu
}

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
    this.addGrid = this.addGrid.bind(this)
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
  
  addGrid() {
		api.addGridToCard(this.props.taskId, 3, 3)
	}

  removeGrid() {
    api.removeGridFromCard(this.props.taskId)
  }

  render() {
    const card = aoStore.hashMap.get(this.props.taskId)

    if (!card || !card.grid) {
      return null
    }
    
    const grid = card.grid

		const noGrid =
			!grid ||
			(grid.hasOwnProperty('height') && grid.height < 1) ||
			(grid.hasOwnProperty('width') && grid.width < 1) ||
			!grid.hasOwnProperty('height') ||
			!grid.hasOwnProperty('width')
			
    const isPyramid = card.gridStyle === 'pyramid'

    return (
      <AoHiddenFieldset heading='Grid'>
				{noGrid && (
					<div className="gridMenu action" onClick={this.addGrid}>
						add pyramid
					</div>
				)}
  		  <AoGridMenu taskId={this.props.taskId} gridStyle={this.props.gridStyle} />
        {!isPyramid &&
          <React.Fragment>
          <span>columns:</span>
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
          </React.Fragment>
        }
        <div className="oneLineSetting">
          <span>rows:</span>
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
      </AoHiddenFieldset>
    )
  }
}
