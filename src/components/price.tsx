import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'
import { HudStyle } from './cardHud'
import Price from './price'
import Chest from '../assets/images/chest.svg'

interface Props {
	taskId: string
}

interface State {
	hoursText: string
	hours?: number
	hoursError?: boolean
	skill?: number
	hazard?: number
}

export const defaultState: State = {
	hoursText: '',
}

@observer
export default class AoPrice extends React.Component<Props, State> {
	constructor(props) {
		super(props)
		this.state = defaultState
		this.onKeyDown = this.onKeyDown.bind(this)
		this.onChangeHours = this.onChangeHours.bind(this)
		this.saveHours = this.saveHours.bind(this)
		this.onClickSkill = this.onClickSkill.bind(this)
		this.onClickHazard = this.onClickHazard.bind(this)
		this.renderButtons = this.renderButtons.bind(this)
	}

	componentWillMount() {
		const card = aoStore.hashMap.get(this.props.taskId)
		if (card) {
			if (card.unionHours && card.unionHours > 0) {
				this.setState({ hours: card.unionHours })
			}
			if (card.unionSkill && card.unionSkill > 0) {
				this.setState({ skill: card.unionSkill })
			}
			if (card.unionHazard && card.unionHazard > 0) {
				this.setState({ hazard: card.unionHazard })
			}
		}
	}

	onKeyDown(event) {
		if (event.key === 'Enter') {
			event.stopPropagation()
			this.saveHours(event)
		} else if (event.key === 'Escape') {
			event.stopPropagation()
			const card = aoStore.hashMap.get(this.props.taskId)
			if (card && card.hasOwnProperty('unionHours') && card.unionHours > 0) {
				this.setState({
					hoursText: card.unionHours.toString(),
					hours: card.unionHours,
				})
			} else {
				this.setState({ hoursText: '0.25', hours: 0.25 })
			}
		}
	}

	onChangeHours(event) {
		const text = event.target.value
		this.setState({ hoursText: text })
		if (text.length <= 0) {
			this.setState({ hoursError: true })
			return
		}
		const newHours = parseFloat(text)
		if (isNaN(newHours) || newHours === 0) {
			this.setState({ hoursError: true })
			return
		}
		if (newHours === this.state.hours) {
			return
		}

		this.setState({ hours: newHours, hoursError: false })
	}

	saveHours(event) {
		if (this.state.hoursError) {
			return
		}
		api.setCardProperty(this.props.taskId, 'unionHours', this.state.hours)
	}

	onClickSkill(event) {
		const skillRequired = event.currentTarget.getAttribute('data-number')
		api.setCardProperty(this.props.taskId, 'unionSkill', skillRequired)
	}

	onClickHazard(event) {
		const skillRequired = event.currentTarget.getAttribute('data-number')
		api.setCardProperty(this.props.taskId, 'unionHazard', skillRequired)
	}

	renderButtons(callback, labels = null, selectedIndex = null) {
		let buttons = []
		labels.forEach((label, i) => {
			const j = i + 1
			buttons.push(
				<button
					onClick={callback}
					data-number={j}
					className={'action inline' + (selectedIndex == j ? ' selected' : '')}>
					{labels && labels[i] ? labels[i] : j}
				</button>
			)
		})
		return <div className="buttonGroup">{buttons}</div>
	}

	render() {
		const card = aoStore.hashMap.get(this.props.taskId)
		if (!card) return null
		const currentHours =
			card.unionHours && card.unionHours > 0 ? card.unionHours : undefined
		const currentSkill =
			card.unionSkill && card.unionSkill > 0 ? card.unionSkill : undefined
		const currentHazard =
			card.unionHazard && card.unionHazard > 0 ? card.unionHazard : undefined
		const hourlyPointsBySkill = [0, 20, 25, 40, 65, 100]
		const hazardMultipliers = [0, 1.1, 1.25, 1.6, 2, 3]
		const basePointsPerHour =
			hourlyPointsBySkill[currentSkill || 0] * currentHours
		const modifiedPointsPerHour =
			basePointsPerHour * hazardMultipliers[currentHazard || 0]
		return (
			<div className="price">
				<label>
					Estimated time:{' '}
					<input
						type="text"
						onChange={this.onChangeHours}
						onKeyDown={this.onKeyDown}
						value={this.state.hoursText}
						size={3}
						className={this.state.hoursError ? 'error' : undefined}
						placeholder="0.25"
						autoFocus
					/>{' '}
					{this.state.hours !== currentHours && (
						<div onClick={this.saveHours} className="action inline">
							Set
						</div>
					)}
					hours
				</label>
				<label>
					{this.renderButtons(
						this.onClickSkill,
						['No skill', 'Some', 'Intermediate', 'Advanced', 'Genius'],
						currentSkill
					)}
				</label>
				<label>
					{this.renderButtons(
						this.onClickHazard,
						['No hazard', 'Boring', 'Hard', 'Dirty', 'Dangerous!'],
						currentHazard
					)}
				</label>
				{modifiedPointsPerHour && <div>AutoPrice: {modifiedPointsPerHour}</div>}
			</div>
		)
	}
}
