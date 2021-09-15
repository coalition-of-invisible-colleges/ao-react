import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import { CardPlay, CardLocation, CardZone, Coords } from '../cardTypes'
import api from '../client/api'
import { createHash } from '../crypto'
import { ReactUpload } from 'react-upload-box'

interface DropZoneProps {
	taskId?: string
	zoneStyle: CardZone
	inId?: string
	x?: number
	y?: number
	style?: {}
	onSelect?: (selection: Coords) => void
	onDrop?: (move: CardPlay) => void
	dropActsLikeFolder?: boolean
}

export interface State {
	text?: string
	draggedKind?: string
	percent: number
	pause?: boolean
	filename?: string
}

// export type CardSource =
// 	| 'card'
// 	| 'list'
// 	| 'stack'
// 	| 'grid'
// 	| 'discard'
// 	| 'context'

@observer
export default class AoDropZone extends React.Component<DropZoneProps, State> {
	private nestedDragCounter: number = 0

	constructor(props) {
		super(props)
		this.state = { percent: 0 }
		this.onClick = this.onClick.bind(this)
		this.detectDragKind = this.detectDragKind.bind(this)
		this.allowDrop = this.allowDrop.bind(this)
		this.continueDrop = this.continueDrop.bind(this)
		this.hideDrop = this.hideDrop.bind(this)
		this.drop = this.drop.bind(this)
		this.renderUploadProgress = this.renderUploadProgress.bind(this)
	}

	onClick() {
		this.props.onSelect({
			y: this.props.y,
			x: this.props.x,
		})
	}

	detectDragKind(dataTransfer) {
		const taskId = this.props.taskId

		let filetype = 'file'
		let sameAsOrigin = false

		if (dataTransfer.items && dataTransfer.items.length > 0) {
			dataTransfer.items.forEach((dt, i) => {
				if (sameAsOrigin || filetype === 'card') {
					return
				}

				if (dt.type === taskId) {
					sameAsOrigin = true
				} else if (dt.type === 'text/taskid') {
					filetype = 'card'
				}
			})
		}

		if (sameAsOrigin) {
			return undefined
		}

		return filetype
	}

	allowDrop(event) {
		event.preventDefault()
		event.stopPropagation()
		this.nestedDragCounter++
		this.setState({ draggedKind: this.detectDragKind(event.dataTransfer) })
	}

	continueDrop(event) {
		event.preventDefault()
		event.stopPropagation()
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

		const taskId = this.props.taskId

		if (document.getElementById('dragGhost')) {
			document.getElementById('dragGhost').remove()
		}

		if (this.detectDragKind(event.dataTransfer) === 'file') {
			console.log('file transfer, aborting card swap')
			const data = new FormData()
			let lastUploadedName = ''
			event.dataTransfer.items.forEach((dt, i) => {
				var file = event.dataTransfer.items[i].getAsFile()
				data.append('file', file)
				lastUploadedName = file.name
				console.log('... file[' + i + '].name = ' + file.name)
			})
			const hash = createHash(data)
			this.setState({ filename: lastUploadedName })
			// todo: api.createCard() first but you have to include the hash so it links retroactively

			api
				.uploadMemes(data, percent => this.setState({ percent }))
				.then(res => {
					console.log('uploaded. res is', res)
					if (res && res.text) {
						const newTaskId = res.text
						aoStore.getTaskById_async(newTaskId, res => {
							console.log('uploaded file. res is ', res, '. About to pin card')
							// todo: allow uploads on stacks as well
							// todo: if there are multiple uploads, make one card and put all the files inside on more cards
							api.pinCardToGrid(
								this.props.x,
								this.props.y,
								lastUploadedName,
								this.props.inId
							)
						})
					}
				})
			return
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

		let toCoords: Coords = { x: this.props.x, y: this.props.y }

		let toLocation: CardLocation = {
			taskId: taskId,
			inId: this.props.inId,
			zone: this.props.zoneStyle,
			coords: toCoords,
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

	emptySquare() {
		let message = ''
		if (this.props.zoneStyle === 'stash') {
			message = 'drop to stash'
		} else if (['card', 'grid'].includes(this.state.draggedKind)) {
			message = 'drop to place'
		} else if (
			['priorities', 'subTasks', 'completed'].includes(this.state.draggedKind)
		) {
			message = 'drop to place'
		} else if (this.state.draggedKind === 'file') {
			message = 'drop file to upload'
		}
		return (
			<div
				className="zone empty"
				onClick={this.onClick}
				onDragEnter={this.allowDrop}
				onDragOver={this.continueDrop}
				onDragLeave={this.hideDrop}
				onDrop={this.drop}>
				{message}
			</div>
		)
	}

	renderUploadProgress() {
		const handlePause = async () => {
			this.setState({ pause: true })
		}
		const handleStart = async () => {
			this.setState({ pause: false })
		}
		return (
			<ReactUpload
				mode="dark"
				fileName={this.state.filename}
				percentage={parseFloat(this.state.percent.toFixed(2))}
				paused={this.state.pause}
				disabled={this.state.percent === 100}
				completed={this.state.percent === 100}
				onPause={handlePause}
				onStart={handleStart}
			/>
		)
	}

	render() {
		if (this.props.zoneStyle === 'discard') {
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
		} else if (this.props.children) {
			let message = 'drop to place'
			switch (this.props.zoneStyle) {
				case 'priorities':
					message = 'drop to prioritize'
					break
				case 'grid':
					if (this.props.dropActsLikeFolder) {
						message = 'drop within'
					} else {
						message = 'drop to swap'
					}
					break
				case 'subTasks':
					message = 'drop here'
					break
			}

			let style = this.props.style
			if (this.props.zoneStyle === 'grid') {
				style = {
					gridRow: (this.props.y + 1).toString(),
					gridColumn: (this.props.x + 1).toString(),
				}
			}

			return (
				<div
					id={this.props.x + '-' + this.props.y}
					className={'dropZone ' + this.props.zoneStyle}
					onDragEnter={this.allowDrop}
					onDragOver={this.continueDrop}
					onDragLeave={this.hideDrop}
					onDrop={this.drop}
					style={style}>
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
		} else if (this.state.percent) {
			let style = this.props.style
			if (this.props.zoneStyle === 'grid') {
				style = {
					gridRow: (this.props.y + 1).toString(),
					gridColumn: (this.props.x + 1).toString(),
				}
			}

			return (
				<div
					id={this.props.x + '-' + this.props.y}
					className={
						'dropZone ' +
						this.props.zoneStyle +
						(this.state.percent > 0 ? ' uploadProgress' : '')
					}
					style={style}>
					{this.renderUploadProgress()}
				</div>
			)
		} else {
			return this.emptySquare()
		}
	}
}
