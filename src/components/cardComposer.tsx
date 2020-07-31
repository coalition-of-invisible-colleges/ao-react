import * as React from 'react'
import { observer } from 'mobx-react'
import { Redirect } from 'react-router-dom'
import aoStore, { AoState, Grid } from '../client/store'
import api from '../client/api'
import { ObservableMap } from 'mobx'
import { delay, cancelablePromise, noop } from '../utils'
import AoDragZone from './dragZone'
import AoDropZone from './dropZone'
import { CardPlay } from '../cards'
import AoGridResizer from './gridResizer'
import AoContextCard from './contextCard'
import { TaskContext } from './taskContext'
import { Task } from '../client/store'

interface CardComposerProps {
	onNewCard: (string) => void
	onBlur: (event) => void
}

interface State {
	text?: string
}

@observer
export default class AoCardComposer extends React.Component<
	CardComposerProps,
	State
> {
	constructor(props) {
		super(props)
		this.state = {}
		this.onBlur = this.onBlur.bind(this)
		this.onKeyDown = this.onKeyDown.bind(this)
		this.onChange = this.onChange.bind(this)
	}

	onBlur(event) {
		this.props.onBlur(event)
	}

	onKeyDown(event) {
		if (event.key === 'Enter' && !event.shiftKey) {
			const trimmed = this.state.text.trim()
			if (!trimmed || trimmed.length < 1) {
				console.log('Empty card—nothing created.')
				return
			}
			this.props.onNewCard(trimmed)
			// switch (this.props.cardSource) {
			// 	case 'grid':
			// 		const currentGrid = aoStore.hashMap.get(aoStore.currentCard).grid
			// 		if (
			// 			!this.state.text ||
			// 			(currentGrid &&
			// 				currentGrid[this.props.y] &&
			// 				currentGrid[this.props.y][this.props.x])
			// 		) {
			// 			api.unpinCardFromGrid(this.props.x, this.props.y, this.props.inId)
			// 		} else if (this.state.text.trim().length >= 1) {
			// 			api.pinCardToGrid(
			// 				this.props.x,
			// 				this.props.y,
			// 				this.state.text.trim(),
			// 				this.props.inId
			// 			)
			// 		}
			// 		break
			// 	case 'priorities':
			// 	case 'subTasks':
			// 		let newText = this.state.text.trim()
			// 		if (newText) {
			// 			api.findOrCreateCardInCard(
			// 				newText,
			// 				this.props.inId,
			// 				this.props.cardSource === 'priorities'
			// 			)
			// 		}
			// 		break
			// }
			this.setState({ text: undefined })
			this.onBlur(event)
		} else if (event.key === 'Escape') {
			this.onBlur(event)
		}
	}

	onChange = event => {
		this.setState({ text: event.target.value })
	}

	render() {
		return (
			<textarea
				autoFocus
				onBlur={this.onBlur}
				className={'zone'}
				onChange={this.onChange}
				onKeyDown={this.onKeyDown}
			/>
		)
	}
}
