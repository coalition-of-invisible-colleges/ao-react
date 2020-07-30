import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore, { AoState, Task } from '../client/store'
import api from '../client/api'
import { delay, cancelablePromise, noop } from '../utils'
import { CardZone, CardStyle } from './contextCard'
import { TaskContext } from './taskContext'

interface DropZoneProps {
	zoneStyle: CardZone
	// cards: Task[]
	inId?: string
	x?: number
	y?: number
	// taskId?: string
	style?: {}
	onSelect?: (selection: Sel) => void
	onGoIn?: (selection: Sel) => void
	onDrop?: (move: CardPlay) => void
}

export interface State {
	text?: string
	draggedKind?: string
}

export interface Sel {
	x?: number
	y: number
}

export interface CardLocation {
	taskId: string
	inId: string
	zone: CardZone
	coords: Sel
}

export interface CardPlay {
	from: CardLocation
	to: CardLocation
}

export type CardSource =
	| 'card'
	| 'list'
	| 'stack'
	| 'grid'
	| 'discard'
	| 'context'

@observer
export default class AoDropZone extends React.Component<DropZoneProps, State> {
	static contextType = TaskContext

	constructor(props) {
		super(props)
		this.state = {}
		// this.onDoubleClick = this.onDoubleClick.bind(this)
		this.allowDrop = this.allowDrop.bind(this)
		this.drop = this.drop.bind(this)
		// this.onHover = this.onHover.bind(this)
	}

	detectDragKind = dataTransfer => {
		let filetype = 'file'
		if (dataTransfer.items && dataTransfer.items.length > 0) {
			dataTransfer.items.forEach(dt => {
				// console.log('dt.type is', dt.type)
				if (dt.type === 'text/taskid') {
					filetype = 'card'
				}
			})
		}

		return filetype
	}

	allowDrop = event => {
		event.preventDefault()
		this.setState({ draggedKind: this.detectDragKind(event.dataTransfer) })
	}

	hideDrop = event => {
		this.setState({ draggedKind: undefined })
	}

	drop = async event => {
		event.preventDefault()
		event.stopPropagation()
		let card = this.context
		if (document.getElementById('dragGhost')) {
			document.getElementById('dragGhost').remove()
		}

		if (this.detectDragKind(event.dataTransfer) === 'file') {
			console.log('file transfer, aborting card swap')
			// api.uploadFile(event.dataTransfer)
			return
		}
		this.hideDrop(event)

		let fromId: string = event.dataTransfer.getData('text/taskId')
		let fromInId: string = event.dataTransfer.getData('text/fromInId')
		let fromZone: CardZone = event.dataTransfer.getData('text/fromZone')
		let fromCoords: Sel = {
			x: event.dataTransfer.getData('text/fromX'),
			y: event.dataTransfer.getData('text/fromY')
		}
		let fromLocation: CardLocation = {
			taskId: fromId,
			inId: fromInId,
			zone: fromZone,
			coords: fromCoords
		}

		let toCoords: Sel = { x: this.props.x, y: this.props.y }
		// need to get this from context
		let toLocation: CardLocation = {
			taskId: card ? card.taskId : undefined,
			inId: this.props.inId,
			zone: this.props.zoneStyle,
			coords: toCoords
		}

		if (toLocation === fromLocation) {
			console.log('drag origin and destination are identical, doing nothing')
			return
		}

		if (this.props.onDrop) {
			this.props.onDrop({ from: fromLocation, to: toLocation })
		} else {
			console.log('no drop handler available for this dropZone')
		}

		return
	}

	emptySquare = () => {
		let message = ''
		if (['card', 'grid'].includes(this.state.draggedKind)) {
			message = 'drop to place'
		} else if (
			['priorities', 'subTasks', 'completed'].includes(this.state.draggedKind)
		) {
			message = 'drop to place'
		} else if (this.state.draggedKind === 'file') {
			'drop file to upload'
		}
		return (
			<div
				className="zone empty"
				onClick={() =>
					this.props.onSelect({
						y: this.props.y,
						x: this.props.x ? this.props.x : undefined
					})
				}
				onDragEnter={this.allowDrop}
				onDragOver={this.allowDrop}
				onDragLeave={this.hideDrop}
				onDrop={this.drop}>
				{message}
			</div>
		)
	}

	render() {
		if (this.props.zoneStyle === 'discard') {
			return (
				<div
					className={'discard'}
					onDragEnter={this.allowDrop}
					onDragOver={this.allowDrop}
					onDragLeave={this.hideDrop}
					onDrop={this.drop}>
					{this.props.children}
				</div>
			)
		} else if (this.props.children) {
			let hardcodedStyle: CardStyle = 'face'
			let message = 'drop to place'
			switch (this.props.zoneStyle) {
				case 'priorities':
					hardcodedStyle = 'priority'
					message = 'drop to prioritize'
					break
				case 'grid':
					hardcodedStyle = 'mini'
					message = 'drop to swap'
					break
				case 'subTasks':
					hardcodedStyle = 'face'
					message = 'drop here'
					break
				case 'context':
					hardcodedStyle = 'context'
					break
			}

			let style = this.props.style
			if (this.props.zoneStyle === 'grid') {
				style = {
					gridRow: (this.props.y + 1).toString(),
					gridColumn: (this.props.x + 1).toString()
				}
			}

			return (
				<div
					id={this.props.x + '-' + this.props.y}
					className={'dropZone ' + this.props.zoneStyle}
					onDragEnter={this.allowDrop}
					onDragOver={this.allowDrop}
					onDragLeave={this.hideDrop}
					onDrop={this.drop}
					style={style}>
					{this.props.children}
					{this.state.draggedKind === 'card' ? (
						<div className={'overlay'}>
							<div className={'label'}>{message}</div>
						</div>
					) : (
						''
					)}
				</div>
			)
		} else {
			return this.emptySquare()
		}
	}
}
