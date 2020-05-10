import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore, { AoState } from '../client/store'
import api from '../client/api'
import { delay, cancelablePromise, noop } from '../utils'
import AoSmartCard, { CardStyle } from './smartCard'

export interface State {
	text?: string
	draggedKind?: string
}

export interface Sel {
	x?: number
	y: number
}

export type CardSource =
	| 'priorities'
	| 'subTasks'
	| 'completed'
	| 'grid'
	| 'discard'
	| 'search'
	| 'context'

interface SmartZoneProps {
	inId?: string
	taskId?: string
	selected?: boolean
	cardSource: CardSource
	x?: number
	y?: number
	style?: {}
	onSelect?: (selection: Sel) => void
	onGoIn?: (selection: Sel) => void
}

@observer
export default class AoSmartZone extends React.Component<
	SmartZoneProps,
	State
> {
	constructor(props) {
		super(props)
		this.state = {}
		this.onClick = this.onClick.bind(this)
		this.onBlur = this.onBlur.bind(this)
		this.onKeyDown = this.onKeyDown.bind(this)
		this.onChange = this.onChange.bind(this)
		this.onDoubleClick = this.onDoubleClick.bind(this)
		this.drag = this.drag.bind(this)
		this.allowDrop = this.allowDrop.bind(this)
		this.drop = this.drop.bind(this)
		this.onHover = this.onHover.bind(this)
	}

	componentWillUnmount() {
		this.clearPendingPromises()
	}

	pendingPromises = []

	appendPendingPromise = promise =>
		(this.pendingPromises = [...this.pendingPromises, promise])

	removePendingPromise = promise =>
		(this.pendingPromises = this.pendingPromises.filter(p => p !== promise))

	clearPendingPromises = () => this.pendingPromises.map(p => p.cancel())

	onClick = event => {
		const waitForClick = cancelablePromise(delay(200))
		this.appendPendingPromise(waitForClick)
		return waitForClick.promise
			.then(() => {
				if (this.props.cardSource === 'grid') {
					this.props.onSelect({ x: this.props.x, y: this.props.y })
				}
				this.removePendingPromise(waitForClick)
			})
			.catch(errorInfo => {
				// rethrow the error if the promise wasn't
				// rejected because of a cancelation
				this.removePendingPromise(waitForClick)
				if (!errorInfo.isCanceled) {
					throw errorInfo.error
				}
			})
	}

	onDoubleClick = event => {
		this.clearPendingPromises()
		this.props.onGoIn({ x: this.props.x, y: this.props.y })
	}

	onBlur = event => {
		this.props.onSelect(undefined)
	}

	onKeyDown = event => {
		if (event.key === 'Enter' && !event.shiftKey) {
			switch (this.props.cardSource) {
				case 'grid':
					const currentGrid = aoStore.hashMap.get(aoStore.currentCard).grid
					if (
						!this.state.text ||
						(currentGrid &&
							currentGrid[this.props.y] &&
							currentGrid[this.props.y][this.props.x])
					) {
						api.unpinCardFromGrid(this.props.x, this.props.y, this.props.inId)
					} else if (this.state.text.trim().length >= 1) {
						api.pinCardToGrid(
							this.props.x,
							this.props.y,
							this.state.text.trim(),
							this.props.inId
						)
					}
					break
				case 'priorities':
				case 'subTasks':
					let newText = this.state.text.trim()
					if (newText) {
						api.findOrCreateCardInCard(
							newText,
							this.props.inId,
							this.props.cardSource === 'priorities'
						)
					}
					break
			}
			this.setState({ text: undefined })
			this.onBlur(event)
		} else if (event.key === 'Escape') {
			this.onBlur(event)
		}
	}

	onChange = event => {
		this.setState({ text: event.target.value })
	}

	onHover = async event => {
		event.preventDefault()
		let seen
		if (this.props.cardSource === 'grid') {
			const taskId = aoStore.hashMap.get(this.props.inId).grid.rows[
				this.props.y
			][this.props.x]
			seen = aoStore.hashMap.get(taskId).seen
		} else if (this.props.cardSource === 'priorities') {
			const taskId = aoStore.hashMap.get(this.props.inId).priorities[
				this.props.y
			]
		} else if (this.props.cardSource === 'subTasks') {
			const taskId = aoStore.hashMap.get(this.props.inId).subTasks[this.props.y]
		} else if (this.props.cardSource === 'completed') {
			const taskId = aoStore.hashMap.get(this.props.inId).completed[
				this.props.y
			]
		}
		const el = document.getElementById(event.target.id)
		if (
			(el && !seen) ||
			(seen &&
				!seen.find(s => {
					return s.memberId === aoStore.member.memberId
				}))
		) {
			let timer = setTimeout(() => api.markSeen(this.props.taskId), 2000)
			el.onmouseout = () => clearTimeout(timer)
		}
	}

	drag = event => {
		console.log('drag. this.props.cardSource is ', this.props.cardSource)
		event.dataTransfer.setData('fromZone', this.props.cardSource)
		if (this.props.cardSource === 'grid') {
			event.dataTransfer.setData('fromX', this.props.x)
		}
		event.dataTransfer.setData('fromY', this.props.y)
		console.log(
			'event.dataTransfer is ',
			event.dataTransfer.getData('fromZone')
		)
	}

	detectDragKind = dataTransfer => {
		let filetype = 'file'
		console.log('fromezone lowercase is ', dataTransfer.getData('fromzone'))
		console.log('fromezone uppercase is ', dataTransfer.getData('fromZone'))
		if (dataTransfer.items && dataTransfer.items.length > 0) {
			dataTransfer.items.forEach(dt => {
				console.log('dt is ', dt)
				if (dt.type === 'fromx' || dt.type === 'fromy') {
					filetype = 'card'
				}
			})
		}

		// console.log("fromZone loaded. it's ", fromZone)
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
		if (this.detectDragKind(event.dataTransfer) === 'file') {
			console.log('file transfer, aborting card swap')
			// api.uploadFile(event.dataTransfer)
			return
		}
		this.hideDrop(event)

		let toCoords: Sel = { x: this.props.x, y: this.props.y }
		let fromZone: CardSource = event.dataTransfer.getData('fromZone')
		let fromCoords: Sel = {
			x: event.dataTransfer.getData('fromX'),
			y: event.dataTransfer.getData('fromY')
		}
		console.log('fromCoords is ', fromCoords)

		let nameFrom = undefined

		console.log('this.props.inId is ', this.props.inId)
		console.log('name lookup')
		let fromTaskId
		if (fromZone === 'grid' && fromCoords.x && fromCoords.y) {
			console.log('detected drag from grid')
			fromTaskId = aoStore.hashMap.get(this.props.inId).grid.rows[fromCoords.y][
				fromCoords.x
			]
			console.log('fromId is ', fromTaskId)

			const name = aoStore.hashMap.get(fromTaskId).name
			console.log('name is ', name)

			if (name) {
				nameFrom = name
			}
		} else if (
			(fromZone === 'priorities' || fromZone === 'subTasks') &&
			fromCoords.y
		) {
			console.log('detected drag from list')
			const trueY =
				aoStore.hashMap.get(this.props.inId)[fromZone].length - 1 - fromCoords.y
			fromTaskId = aoStore.hashMap.get(this.props.inId)[fromZone][trueY]
			console.log('list fromId is', fromTaskId)
			const name = aoStore.hashMap.get(fromTaskId).name
			if (name) {
				nameFrom = name
			}
		} else if (fromZone === 'search' && fromCoords.y) {
			const trueY = aoStore.searchResults.length - 1 - fromCoords.y
			fromTaskId = aoStore.searchResults[trueY].taskId
			const name = aoStore.hashMap.get(fromTaskId).name
			if (name) {
				nameFrom = name
			}
		} else if (fromZone === 'context' && fromCoords.y) {
			console.log('detected drag from context y is ', fromCoords.y)
			const trueY = fromCoords.y
			fromTaskId = aoStore.context[trueY]
			console.log('trueY is ', trueY)
			const name = aoStore.hashMap.get(fromTaskId).name
			if (name) {
				nameFrom = name
			}
		}

		let nameTo = undefined

		if (aoStore.hashMap.get(this.props.taskId)) {
			nameTo = aoStore.hashMap.get(this.props.taskId).name
		}

		if (this.props.cardSource === 'grid' && fromZone === 'grid') {
			if (nameFrom && nameTo) {
				api.pinCardToGrid(toCoords.x, toCoords.y, nameFrom, this.props.inId)
				api.pinCardToGrid(fromCoords.x, fromCoords.y, nameTo, this.props.inId)
			} else if (nameFrom) {
				api.unpinCardFromGrid(fromCoords.x, fromCoords.y, this.props.inId)
				api.pinCardToGrid(toCoords.x, toCoords.y, nameFrom, this.props.inId)
			}
		} else if (fromZone === 'priorities' && this.props.cardSource === 'grid') {
			console.log('drag detected from priorities to grid')
			console.log('nameFrom: ', nameFrom)
			console.log('nameTo: ', nameTo)
			console.log('fromCoords: ', fromCoords)
			console.log('toCoords: ', toCoords)
			console.log('fromTaskId: ', fromTaskId)
			console.log('inId: ', this.props.inId)
			if (nameTo) {
				api.unpinCardFromGrid(toCoords.x, toCoords.y, this.props.inId)
			}
			api.refocusCard(fromTaskId, this.props.inId)
			api.pinCardToGrid(toCoords.x, toCoords.y, nameFrom, this.props.inId)
		} else if (
			fromZone === 'priorities' &&
			this.props.cardSource === 'priorities'
		) {
			console.log(
				'drag detected from priorities to priorities. behavior currently undefined'
			)
			if (nameTo) {
				api.refocusCard(nameTo, this.props.inId)
			}
			api.prioritizeCard(fromTaskId, this.props.inId)
		} else if (
			fromZone === 'priorities' &&
			this.props.cardSource === 'subTasks'
		) {
			api.refocusCard(fromTaskId, this.props.inId)
		} else if (
			fromZone === 'subTasks' &&
			this.props.cardSource === 'priorities'
		) {
			api.prioritizeCard(fromTaskId, this.props.inId)
		} else if (fromZone === 'subTasks' && this.props.cardSource === 'grid') {
			if (nameTo) {
				api.unpinCardFromGrid(toCoords.x, toCoords.y, this.props.inId)
			}
			api.pinCardToGrid(toCoords.x, toCoords.y, nameFrom, this.props.inId)
		} else if (fromZone === 'completed' && this.props.cardSource === 'grid') {
			api.pinCardToGrid(toCoords.x, toCoords.y, nameFrom, this.props.inId)
		} else if (fromZone === 'grid' && this.props.cardSource === 'priorities') {
			console.log('drag detected from grid to priorities')
			console.log('nameFrom: ', nameFrom)
			console.log('nameTo: ', nameTo)
			console.log('fromCoords: ', fromCoords)
			console.log('toCoords: ', toCoords)
			api.unpinCardFromGrid(fromCoords.x, fromCoords.y, this.props.inId)
			api.prioritizeCard(fromTaskId, this.props.inId, toCoords.y)
		} else if (fromZone === 'grid' && this.props.cardSource === 'subTasks') {
			console.log('drag detected from grid to subTasks')
			console.log('nameFrom: ', nameFrom)
			console.log('nameTo: ', nameTo)
			console.log('fromCoords: ', fromCoords)
			console.log('toCoords: ', toCoords)
			api.unpinCardFromGrid(fromCoords.x, fromCoords.y, this.props.inId)
		} else if (fromZone === 'grid' && this.props.cardSource === 'completed') {
			console.log('drag detected from grid to completed')
			console.log('nameFrom: ', nameFrom)
			console.log('nameTo: ', nameTo)
			console.log('fromCoords: ', fromCoords)
			console.log('toCoords: ', toCoords)
		} else if (
			fromZone === 'subTasks' &&
			this.props.cardSource === 'subTasks'
		) {
			console.log('drag detected from subTasks to subTasks')
			console.log('nameFrom: ', nameFrom)
			console.log('nameTo: ', nameTo)
			console.log('fromCoords: ', fromCoords)
			console.log('toCoords: ', toCoords)
			api.findOrCreateCardInCard(nameFrom, this.props.inId)
		} else if (this.props.cardSource === 'discard') {
			console.log('discard drop detected')
			if (fromZone === 'grid') {
				api.unpinCardFromGrid(fromCoords.x, fromCoords.y, this.props.inId)
				api.discardCardFromCard(fromTaskId, this.props.inId)
			} else if (fromZone === 'priorities') {
				api.refocusCard(fromTaskId, this.props.inId)
				api.discardCardFromCard(fromTaskId, this.props.inId)
			} else if (fromZone === 'context') {
				console.log('drop from context detected')
				aoStore.removeFromContext(fromTaskId)
			}
		} else if (fromZone === 'search' || fromZone === 'context') {
			switch (this.props.cardSource) {
				case 'priorities':
					api.prioritizeCard(fromTaskId, this.props.inId)
					break
				case 'grid':
					if (nameTo) {
						api.unpinCardFromGrid(toCoords.x, toCoords.y, this.props.inId)
					}
					api.pinCardToGrid(toCoords.x, toCoords.y, nameFrom, this.props.inId)
					break
				case 'subTasks':
					api.findOrCreateCardInCard(nameFrom, this.props.inId)
					break
			}
		}
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
				onClick={this.onClick}
				onDragEnter={this.allowDrop}
				onDragOver={this.allowDrop}
				onDragLeave={this.hideDrop}
				onDrop={this.drop}>
				{message}
			</div>
		)
	}

	render() {
		if (this.props.cardSource === 'discard') {
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
		} else if (this.props.selected) {
			return (
				<textarea
					autoFocus
					onBlur={this.onBlur}
					className={'zone'}
					onChange={this.onChange}
					onKeyDown={this.onKeyDown}
					style={{
						gridRow: (this.props.y + 1).toString(),
						gridColumn: (this.props.x + 1).toString()
					}}
				/>
			)
		} else if (this.props.y === -1) {
			if (
				this.props.cardSource === 'priorities' &&
				aoStore.hashMap.get(this.props.inId).priorities.length >= 1
			) {
				return ''
			}
			let message =
				'+' + (this.props.cardSource === 'priorities' ? 'priority' : 'card')
			console.log('emptySquare draggedKind is ', this.state.draggedKind)
			switch (this.state.draggedKind) {
				case 'priorities':
					message = 'drop to deprioritize'
					break
				case 'grid':
					message = 'drop to discard'
					break
				case 'subTasks':
					message = 'drop to move to top'
					break
				case 'card':
				case 'default':
					// for some reason i can't get fromZone data in allowData to make the other cases work
					message = 'drop to move'
					if (this.props.cardSource === 'priorities') {
						message = 'drop to prioritize'
					}
					break
			}
			return (
				<p
					className={'action'}
					onClick={() => this.props.onSelect({ y: this.props.y })}
					onDragEnter={this.allowDrop}
					onDragOver={this.allowDrop}
					onDragLeave={this.hideDrop}
					onDrop={this.drop}>
					{message}
				</p>
			)
		} else if (this.props.taskId) {
			let hardcodedStyle: CardStyle = 'card'
			let message = 'drop to place'
			switch (this.props.cardSource) {
				case 'priorities':
					hardcodedStyle = 'priority'
					message = 'drop to prioritize'
					break
				case 'grid':
					hardcodedStyle = 'mini'
					message = 'drop to swap'
					break
				case 'subTasks':
					hardcodedStyle = 'card'
					message = 'drop here'
					break
				case 'completed':
					hardcodedStyle = 'card'
					break
				case 'search':
					hardcodedStyle = 'priority'
					break
				case 'context':
					console.log('context row rendering')
					hardcodedStyle = 'priority'
					break
			}
			// console.log(
			// 	'var log: this.props.x = ',
			// 	this.props.x,
			// 	' and this.props.y is ',
			// 	this.props.y,
			// 	' and this.props.taskId is ',
			// 	this.props.taskId,
			// 	' and hardcodedStyle is ',
			// 	hardcodedStyle
			// )

			let style = this.props.style
			if (this.props.cardSource === 'grid') {
				style = {
					gridRow: (this.props.y + 1).toString(),
					gridColumn: (this.props.x + 1).toString()
				}
			}

			return (
				<div
					id={this.props.x + '-' + this.props.y}
					className={'zone'}
					onClick={this.onClick}
					onDoubleClick={this.onDoubleClick}
					draggable="true"
					onDragStart={this.drag}
					onDragEnter={this.allowDrop}
					onDragOver={this.allowDrop}
					onDragLeave={this.hideDrop}
					onDrop={this.drop}
					onMouseOver={this.onHover}
					style={style}>
					{this.state.draggedKind === 'card' ? (
						<div className={'overlay'}>
							<div className={'label'}>{message}</div>
						</div>
					) : (
						''
					)}
					<AoSmartCard taskId={this.props.taskId} cardStyle={hardcodedStyle} />
				</div>
			)
		} else {
			return this.emptySquare()
		}
	}
}
