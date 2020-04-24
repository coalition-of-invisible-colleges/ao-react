import * as React from 'react'
import { observer } from 'mobx-react'
import { Redirect } from 'react-router-dom'
import aoStore, { AoState } from '../client/store'
import api from '../client/api'
import { ObservableMap } from 'mobx'
import { delay, cancelablePromise, noop } from '../utils'
import AoPaper from './paper'
import AoMiniCard from './miniCard'
import Markdown from 'markdown-to-jsx'
import { useDropzone } from 'react-dropzone'

export interface State {
	text?: string
}

interface Sel {
	x: number
	y: number
}

interface GridSquareProps {
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
		this.onSelectionChange = this.onSelectionChange.bind(this)
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
		console.log('clicked!')
		const waitForClick = cancelablePromise(delay(200))
		this.appendPendingPromise(waitForClick)
		return waitForClick.promise
			.then(() => {
				console.log('promise x is ', this.props.x, ' and y is ', this.props.y)
				this.props.onSelect({ x: this.props.x, y: this.props.y })

				console.log('clicked', this.props.x, this.props.y)
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
		console.log('double click')
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
			console.log('enter')
			console.log('selx: ' + this.props.x)
			console.log('sely: ' + this.props.y)
			if (!this.state.text) {
				api.delCardFromGrid(this.props.x, this.props.y), console.log('delFired')
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

	onSelectionChange = event => {
		console.log('selected event', event)
	}

	onChange = event => {
		console.log('on change', event.target.value)
		this.setState({ text: event.target.value })
	}

	onHover = async event => {
		event.preventDefault()
		console.log(event)
		console.log('id' + event.target.id)
		console.log('hovering')
		const el = document.getElementById(event.target.id)
		if (el && el.classList.contains('seen')) {
			let square = event.target.id.split('-')
			let name = aoStore.hashMap.get(this.props.taskId).name
			let timer = setTimeout(() => api.markSeen(name), 2000)
			document.getElementById(event.target.id).onmouseout = () =>
				clearTimeout(timer)
			console.log(
				'seen?: ' +
					aoStore.hashMap.get(this.props.taskId).seen.hasOwnProperty('memberId')
			)
			console.log(
				'seen2? : ' +
					aoStore.hashMap.get(this.props.taskId).seen.some(s => {
						return s.memberId === aoStore.member.memberId
					})
			)
		}
	}

	drag = event => {
		event.dataTransfer.setData('fromX', this.props.x)
		event.dataTransfer.setData('fromY', this.props.y)
	}

	allowDrop = event => {
		event.preventDefault()
	}

	drop = async event => {
		event.preventDefault()
		console.log('drag over fire')
		console.log(event.target.id)
		console.log('parent: ' + event.target.parentNode.id)
		let toCoords: Sel = { x: this.props.x, y: this.props.y }
		let fromCoords: Sel = {
			x: event.dataTransfer.getData('fromX'),
			y: event.dataTransfer.getData('fromY')
		}
		console.log('from is', fromCoords)
		let nameFrom = undefined
		let nameTo = undefined
		if (fromCoords.x && fromCoords.y) {
			console.log('aoStore.state is', aoStore.state)
			if (aoStore.hashMap.get(aoStore.state.grid[fromCoords.y][fromCoords.x])) {
				nameFrom = aoStore.hashMap.get(
					aoStore.state.grid[fromCoords.y][fromCoords.x]
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
		} else if (nameTo) {
			api.createAndOrAddCardToGrid(fromCoords.x, fromCoords.y, nameTo)
			api.delCardFromGrid(toCoords.x, toCoords.y)
		} else if (!nameFrom && !nameTo) {
		}
	}

	render() {
		console.log('render grid square', aoStore.state.grid)
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
					className={'square'}
					onClick={this.onClick}
					onDoubleClick={this.onDoubleClick}
					draggable="true"
					onDragStart={this.drag}
					onDragOver={this.allowDrop}
					onDrop={this.drop}
					onMouseOver={this.onHover}
					style={{
						gridRow: (this.props.y + 1).toString(),
						gridColumn: (this.props.x + 1).toString()
					}}>
					<AoMiniCard taskId={this.props.taskId} />
				</div>
			)
		} else {
			return (
				<div
					className="square empty"
					onClick={this.onClick}
					onDoubleClick={this.onDoubleClick}
					onDragOver={this.allowDrop}
					onDrop={this.drop}
					onMouseOver={this.onHover}
					style={{
						gridRow: (this.props.y + 1).toString(),
						gridColumn: (this.props.x + 1).toString()
					}}></div>
			)
		}
	}
}
