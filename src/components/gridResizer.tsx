import React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import { GridStyle } from '../interfaces'
import AoHiddenFieldset from './hiddenFieldset'
import api from '../client/api'
import GridImg from '../assets/images/grid.svg'
import PyramidImg from '../assets/images/pyramid.svg'
import RowImg from '../assets/images/row.svg'
import ColumnImg from '../assets/images/column.svg'
import SquareSize from '../assets/images/square.svg'

interface Props {
  taskId: string
  gridStyle: GridStyle
  hasGrid?: boolean
  gridHeight?: number
  gridWidth?: number
}

export default function AoGridResizer(props: Props) {
  const taskId = props.taskId
  const card = aoStore.hashMap.get(taskId)
  if (!card) {
    return null
  }

  const grid = card.grid
  
  const switchToPyramid = event => {
    event.stopPropagation()
    return api.setCardProperty(props.taskId, 'gridStyle', 'pyramid')
  }

  const switchToGrid = event => {
    event.stopPropagation()
    return api.setCardProperty(props.taskId, 'gridStyle', 'grid')
  }
  
  const addPyramid = (event) => {
		switchToPyramid(event).then(() => api.addGridToCard(taskId, 3, 3))
	}
	
	const addGrid = (event) => {
		switchToGrid(event).then(() => api.addGridToCard(taskId, 3, 3))
	}
	
  if(!grid) {
    return <AoHiddenFieldset heading='Grid' startOpen={false} className='gridMenu'>
      <div className='centerFlex'>
        <img src={PyramidImg} className="gridMenu action" onClick={addPyramid} />
        <img src={GridImg} className="gridMenu action" onClick={addGrid} />
      </div>
		</AoHiddenFieldset>
  }

  const increaseRows = () => {
    const card = aoStore.hashMap.get(taskId)
    api.resizeGrid(taskId, grid.height + 1, grid.width, grid.size)
  }

  const decreaseRows = () => {
    const card = aoStore.hashMap.get(taskId)
    api.resizeGrid(taskId, grid.height - 1, grid.width, grid.size)
  }

  const increaseColumns = () => {
    const card = aoStore.hashMap.get(taskId)
    api.resizeGrid(taskId, grid.height, grid.width + 1, grid.size)
  }

  const decreaseColumns = () => {
    const card = aoStore.hashMap.get(taskId)
    api.resizeGrid(taskId, grid.height, grid.width - 1, grid.size)
  }

  const removeGrid = () => {
    api.removeGridFromCard(taskId)
  }
  
  const noGrid =
			!grid ||
			(grid.hasOwnProperty('height') && grid.height < 1) ||
			(grid.hasOwnProperty('width') && grid.width < 1) ||
			!grid.hasOwnProperty('height') ||
			!grid.hasOwnProperty('width')
			
  const isPyramid = props.gridStyle === 'pyramid'

  const increaseSquareSize = () => {
    api.resizeGrid(
      props.taskId,
      grid.height,
      grid.width,
      grid.size && grid.size >= 1 ? grid.size + 1 : 10
    )
  }

  const decreaseSquareSize = () => {
    api.resizeGrid(
      props.taskId,
      grid.height,
      grid.width,
      grid.size && grid.size >= 1 ? grid.size - 1 : 8
    )
  }
  
  const epithet = isPyramid ? grid.height + '-row Pyramid' : grid.width + '×' + grid.height + ' ' + 'Grid' 

  return (
      <AoHiddenFieldset heading={epithet} startOpen={true} className='gridMenu'>
        <div className="centerFlex">
          <button
            className={'action' + (isPyramid ? ' selected' : '')}
            onClick={switchToPyramid}
            disabled={isPyramid}>
            <img src={PyramidImg} />
          </button>
          <button
            className={'action' + (!isPyramid ? ' selected' : '')}
            onClick={switchToGrid}
            disabled={!isPyramid}>
            <img src={GridImg} />
          </button>
        </div>
         {!isPyramid &&
          <div className="oneLineSetting">
            <img src={ColumnImg} />
            <button
              type="button"
              onClick={decreaseColumns}
              disabled={card.grid.width <= 1}
              className="action minus">
              -
            </button>
            <button
              type="button"
              onClick={increaseColumns}
              disabled={card.grid.width >= 100}
              className="action plus">
              +
            </button>
          </div>
        }
        <div className="oneLineSetting">
          <img src={RowImg} />
          <button
            type="button"
            onClick={decreaseRows}
            disabled={card.grid.height <= 1}
            className="action minus">
            -
          </button>
          <button
            type="button"
            onClick={increaseRows}
            disabled={card.grid.height >= 100}
            className="action plus">
            +
          </button>
        </div>
        <div className='oneLineSetting'>
          <img src={SquareSize} />
          <button
            type="button"
            onClick={decreaseSquareSize}
            disabled={grid.size <= 1}
            className="action minus">
            -
          </button>
          <button
            type="button"
            onClick={increaseSquareSize}
            disabled={grid.size >= 40}
            className="action plus">
            +
          </button>
        </div>
        {(grid.width <= 1 || grid.height <= 1) && (
            <button
              type="button"
              onClick={removeGrid}
              className="action remove">
              Remove {isPyramid ? 'Pyramid' : 'Grid'}
            </button>
          )}
      </AoHiddenFieldset>
    )
}
