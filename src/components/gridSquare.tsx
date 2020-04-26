import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore, { AoState } from '../client/store'
import api from '../client/api'
import { ObservableMap } from 'mobx'
import { delay, cancelablePromise, noop } from '../utils'
import AoPaper from './paper'
import AoMiniCard from './miniCard'
import Markdown from 'markdown-to-jsx'

export interface State {
	text?: string
	draggedKind?: string
}

interface Sel {
	x: number
	y: number
}

interface GridSquareProps {
	gridId: string
	selected: boolean
	taskId?: string
	x: number
	y: number
	onSelect: (selection: { x: number; y: number }) => void
	onGoIn: (selection: { x: number; y: number }) => void
}

@observer
export default class AoGridSquare extends React.Component<
	GridSquareProps,
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
		// cancel all pending promises to avoid
		// side effects when the component is unmounted
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
				this.props.onSelect({ x: this.props.x, y: this.props.y })

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
		const [xs, ys] = event.target.id.split('-')
		const x = parseInt(xs)
		const y = parseInt(ys)
		this.props.onGoIn({ x: this.props.x, y: this.props.y })
	}

	onBlur = event => {
		this.props.onSelect(undefined)
	}

	onKeyDown = event => {
		if (event.key === 'Enter') {
			if (!this.state.text) {
				api.delCardFromGrid(this.props.x, this.props.y)
			} else {
				api.createAndOrAddCardToGrid(
					this.props.x,
					this.props.y,
					this.state.text
				)
			}
			this.onBlur(event)
		}
	}

	onChange = event => {
		this.setState({ text: event.target.value })
	}

	onHover = async event => {
		event.preventDefault()
		const el = document.getElementById(event.target.id)
		if (el && !el.classList.contains('seen')) {
			let square = event.target.id.split('-')
			let name = aoStore.hashMap.get(this.props.taskId).name
			let timer = setTimeout(() => api.markSeen(name), 2000)
			document.getElementById(event.target.id).onmouseout = () =>
				clearTimeout(timer)
		}
	}

	drag = event => {
		event.dataTransfer.setData('fromX', this.props.x)
		event.dataTransfer.setData('fromY', this.props.y)
	}

	detectDragKind = dataTransfer => {
		let filetype = 'file'

		if (dataTransfer.items && dataTransfer.items.length > 0) {
			dataTransfer.items.forEach(dt => {
				if (dt.type === 'fromx' || dt.type === 'fromy') {
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
		this.hideDrop(event)
		event.preventDefault()
		if (this.detectDragKind(event.dataTransfer) === 'file') {
			console.log('file transfer, aborting card swap')
			// api.uploadFile(event.dataTransfer)
			return
		}

		let toCoords: Sel = { x: this.props.x, y: this.props.y }
		let fromCoords: Sel = {
			x: event.dataTransfer.getData('fromX'),
			y: event.dataTransfer.getData('fromY')
		}

		let nameFrom = undefined
		let nameTo = undefined

		if (fromCoords.x && fromCoords.y) {
			if (
				aoStore.hashMap.get(
					aoStore.state.grids[this.props.gridId][fromCoords.y][fromCoords.x]
				)
			) {
				nameFrom = aoStore.hashMap.get(
					aoStore.state.grids[this.props.gridId][fromCoords.y][fromCoords.x]
				).name
			}
		}

		if (aoStore.hashMap.get(this.props.taskId)) {
			nameTo = aoStore.hashMap.get(this.props.taskId).name
		}
		if (nameFrom && nameTo) {
			api.createAndOrAddCardToGrid(toCoords.x, toCoords.y, nameFrom)
			api.createAndOrAddCardToGrid(fromCoords.x, fromCoords.y, nameTo)
		} else if (nameFrom) {
			api.createAndOrAddCardToGrid(toCoords.x, toCoords.y, nameFrom)
			api.delCardFromGrid(fromCoords.x, fromCoords.y)
		}
		console.log(
			'nonsensical drag data. this should be impossible or detected earlier.'
		)
	}

	emptySquare = () => {
		return (
			<div
				className="square empty"
				onClick={this.onClick}
				onDoubleClick={this.onDoubleClick}
				onDragOver={this.allowDrop}
				onDragLeave={this.hideDrop}
				onDrop={this.drop}>
				{this.state.draggedKind === 'card' ? 'drop to move' : ''}
				{this.state.draggedKind === 'file' ? 'drop file to upload' : ''}
			</div>
		)
	}

	render() {
		if (this.props.selected) {
			return (
				<textarea
					autoFocus
					onBlur={this.onBlur}
					className={'square'}
					onChange={this.onChange}
					onKeyDown={this.onKeyDown}
					style={{
						gridRow: (this.props.y + 1).toString(),
						gridColumn: (this.props.x + 1).toString()
					}}
				/>
			)
		} else if (this.props.taskId) {
			return (
				<div
					id={this.props.x + '-' + this.props.y}
					className={'square'}
					onClick={this.onClick}
					onDoubleClick={this.onDoubleClick}
					draggable="true"
					onDragStart={this.drag}
					onDragOver={this.allowDrop}
					onDragLeave={this.hideDrop}
					onDrop={this.drop}
					onMouseOver={this.onHover}
					style={{
						gridRow: (this.props.y + 1).toString(),
						gridColumn: (this.props.x + 1).toString()
					}}>
					{this.state.draggedKind === 'card' ? (
						<div className={'overlay'}>
							<div className={'label'}>drop to swap</div>
						</div>
					) : (
						''
					)}
					<AoMiniCard taskId={this.props.taskId} />
				</div>
			)
		} else {
			return this.emptySquare()
		}
	}
}
