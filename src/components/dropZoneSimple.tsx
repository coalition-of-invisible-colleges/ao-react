import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import { GridStyle } from '../interfaces'
import { CardPlay, CardLocation, CardZone, Coords } from '../cardTypes'
import api from '../client/api'
import { createHash } from '../crypto'
import { ReactUpload } from 'react-upload-box'

interface Props {
	onDrop: (from: CardLocation) => void
	dropHoverMessage?: string
}

export interface State {
	draggedKind?: string
}

@observer
export default class AoDropZoneSimple extends React.Component<Props, State> {
	private nestedDragCounter: number = 0

	constructor(props) {
		super(props)
		this.state = {}
		this.detectDragKind = this.detectDragKind.bind(this)
		this.allowDrop = this.allowDrop.bind(this)
		this.continueDrop = this.continueDrop.bind(this)
		this.hideDrop = this.hideDrop.bind(this)
		this.drop = this.drop.bind(this)
	}

	detectDragKind(dataTransfer) {
		let filetype = 'file'

		if (dataTransfer.items && dataTransfer.items.length > 0) {
			dataTransfer.items.forEach((dt, i) => {
				if (filetype === 'card') {
					return
				}

				if (dt.type === 'text/taskid') {
					filetype = 'card'
				}
			})
		}

		return filetype
	}

	allowDrop(event) {
		event.preventDefault()
		this.nestedDragCounter++
		this.setState({ draggedKind: this.detectDragKind(event.dataTransfer) })
	}

	continueDrop(event) {
		event.preventDefault()
		if (!this.state.draggedKind) {
			this.setState({ draggedKind: this.detectDragKind(event.dataTransfer) })
		}
	}

	hideDrop(event) {
		this.nestedDragCounter--
		if (this.nestedDragCounter > 0) {
			// Webkit fires onDragLeave whenever there is motion on a child, need to filter
			return
		}
		this.setState({ draggedKind: null })
	}

	async drop(event) {
		event.preventDefault()
		event.stopPropagation()

		if (document.getElementById('dragGhost')) {
			document.getElementById('dragGhost').remove()
		}

		if (this.detectDragKind(event.dataTransfer) === 'file') {
			console.log('file transfer, aborting card drop')
		}
		this.hideDrop(event)

		let fromId: string = event.dataTransfer.getData('text/taskId')

		let fromInId: string = event.dataTransfer.getData('text/fromInId')
		let fromZone: CardZone = event.dataTransfer.getData('text/fromZone')
		let fromLevel: number = parseInt(
			event.dataTransfer.getData('text/fromLevel'),
			10
		)
		let fromCoords: Coords = {
			x: parseInt(event.dataTransfer.getData('text/fromX'), 10),
			y: parseInt(event.dataTransfer.getData('text/fromY'), 10),
		}
		let fromLocation: CardLocation = {
			taskId: fromId,
			inId: fromInId,
			zone: fromZone,
			level: fromLevel,
			coords: fromCoords,
		}

		if (this.props.onDrop) {
			this.props.onDrop(fromLocation)
		} else {
			console.log('no drop handler available for this dropZone')
		}

		this.setState({ draggedKind: null })

		return
	}

	render() {
		if (this.props.children) {
			let message = 'drop to place'
			if (this.props.dropHoverMessage) {
				message = this.props.dropHoverMessage
			}
			return (
				<div
					className='dropZone'
					onDragEnter={this.allowDrop}
					onDragOver={this.continueDrop}
					onDragLeave={this.hideDrop}
					onDrop={this.drop}>
					{this.props.children}
					{this.state.draggedKind === 'card' ? (
						<div className="overlay">
							<div className="label">{message}</div>
						</div>
					) : (
						''
					)}
				</div>
			)
		} else {
			return (
				<div
					className="discard"
					onDragEnter={this.allowDrop}
					onDragOver={this.continueDrop}
					onDragLeave={this.hideDrop}
					onDrop={this.drop}>
					{this.props.children}
				</div>
			)
		}
	}
}
