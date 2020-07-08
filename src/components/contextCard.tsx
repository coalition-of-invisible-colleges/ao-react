import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore, { AoState, Task } from '../client/store'
import { Redirect } from 'react-router-dom'
import { ObservableMap } from 'mobx'
import { delay, cancelablePromise, noop } from '../utils'
import api from '../client/api'
import Markdown from 'markdown-to-jsx'
import AoPaper from './paper'
import AoGrid from './grid'
import AoStack from './stack'
import AoSourceStack from './sourceStack'
import AoCardHud from './cardHud'
import AoMission from './mission'
import AoAttachment from './attachment'
import AoCoin from './coin'
import { TaskContext } from './taskContext'

export type CardStyle =
	| 'priority'
	| 'face'
	| 'full'
	| 'compact'
	| 'mini'
	| 'context'

export type CardZone =
	| 'card'
	| 'priorities'
	| 'grid'
	| 'subTasks'
	| 'completed'
	| 'context'
	| 'discard'

export interface DragContext {
	zone: CardZone
	inId?: string
	x?: number
	y: number
}

interface CardProps {
	cardStyle?: CardStyle
}

interface State {
	showPriorities?: boolean
	redirect?: string
}

@observer
export default class AoContextCard extends React.Component<CardProps, State> {
	static contextType = TaskContext

	constructor(props) {
		super(props)
		this.state = {}
		this.togglePriorities = this.togglePriorities.bind(this)
		this.newPriority = this.newPriority.bind(this)
		this.newSubTask = this.newSubTask.bind(this)
		this.goInCard = this.goInCard.bind(this)
	}

	togglePriorities(event) {
		if (!this.state.showPriorities) {
			this.setState({ showPriorities: true })
		} else {
			this.setState({ showPriorities: false })
		}
	}

	newPriority(name: string) {
		const card = this.context
		if (!card) {
			console.log('missing card')
		}
		api.findOrCreateCardInCard(name, card.taskId, true)
	}

	newSubTask(name: string) {
		const card = this.context
		if (!card) {
			console.log('missing card')
		}
		api.findOrCreateCardInCard(name, card.taskId)
	}

	goInCard() {
		console.log('goInCard')
		const card = this.context
		if (!card) {
			console.log('missing card')
			return
		}
		if (this.props.cardStyle === 'context') {
			aoStore.clearContextTo(card.taskId)
		} else {
			aoStore.addToContext([aoStore.currentCard])
		}
		this.setState({
			redirect: '/task/' + card.taskId
		})
	}

	render() {
		if (this.state.redirect !== undefined) {
			this.setState({ redirect: undefined })
			return <Redirect to={this.state.redirect} />
		}

		const card = this.context
		if (!card) {
			console.log('missing card')
			return (
				<div className={'card'}>
					<div className={'content'}>
						<Markdown options={{ forceBlock: true }}>missing card:</Markdown>
					</div>
				</div>
			)
		}

		let content = card.name
		if (card.taskId === content) {
			const memberCard = aoStore.memberById.get(card.taskId)
			if (memberCard) {
				content = memberCard.name
			}
		}

		let priorityCards: Task[]
		if (card.priorities && card.priorities.length >= 1) {
			priorityCards = card.priorities.map(tId => aoStore.hashMap.get(tId))
		}

		let subTaskCards: Task[]
		if (card.subTasks && card.subTasks.length >= 1) {
			subTaskCards = card.subTasks.map(tId => aoStore.hashMap.get(tId))
		}

		let cardStyle = this.props.cardStyle ? this.props.cardStyle : 'face'
		switch (cardStyle) {
			case 'context':
				return (
					<div className={'card context'} onDoubleClick={this.goInCard}>
						<AoPaper taskId={card.taskId} />
						<div className={'content'}>
							<Markdown options={{ forceBlock: true }}>{content}</Markdown>
						</div>
					</div>
				)
			case 'priority':
				return (
					<div
						className={
							'card priority' + (this.state.showPriorities ? ' padbottom' : '')
						}
						id={'card-' + card.taskId}
						onDoubleClick={this.goInCard}>
						<AoPaper taskId={card.taskId} />
						<AoCardHud
							taskId={card.taskId}
							hudStyle={'collapsed'}
							prioritiesShown={this.state.showPriorities}
							onTogglePriorities={this.togglePriorities}
						/>
						<div className={'content'}>
							<AoCoin taskId={card.taskId} />
							<Markdown options={{ forceBlock: true }}>{content}</Markdown>
							<AoAttachment taskId={card.taskId} hudStyle={'collapsed'} />
						</div>
						{this.state.showPriorities ? (
							<AoSourceStack
								inId={card.taskId}
								cards={priorityCards}
								showAdd={true}
								hideAddWhenCards={true}
								addButtonText={'+priority'}
								cardStyle={'priority'}
								onNewCard={this.newPriority}
								zone={'priorities'}
							/>
						) : null}
					</div>
				)
			case 'face':
			case 'compact':
				return (
					<div
						className={'card ' + this.props.cardStyle}
						id={'card-' + card.taskId}
						onDoubleClick={this.goInCard}>
						<AoPaper taskId={card.taskId} />
						<AoCardHud taskId={card.taskId} hudStyle={'face before'} />
						<div className={'content'}>
							<AoMission taskId={card.taskId} hudStyle={'face before'} />
							<Markdown options={{ forceBlock: true }}>{content}</Markdown>
							<AoAttachment taskId={card.taskId} hudStyle={'face before'} />
							{card.priorities && card.priorities.length >= 1 ? (
								<>
									<div className="action" onClick={this.togglePriorities}>
										{card.priorities.length}{' '}
										{card.priorities.length > 1 ? 'priorities' : 'priority'}{' '}
										{this.state.showPriorities ? (
											<React.Fragment>&#8963;</React.Fragment>
										) : (
											<React.Fragment>&#8964;</React.Fragment>
										)}
									</div>
									{this.state.showPriorities ? (
										<AoSourceStack
											inId={card.taskId}
											cards={priorityCards}
											showAdd={true}
											hideAddWhenCards={true}
											addButtonText={'+priority'}
											cardStyle={'priority'}
											onNewCard={this.newPriority}
											zone={'priorities'}
										/>
									) : null}
								</>
							) : null}
						</div>
						<AoCardHud taskId={card.taskId} hudStyle={'face after'} />
					</div>
				)
			case 'full':
				return (
					<React.Fragment>
						<AoStack taskId={card.taskId} cardSource={'context'} />
						<div
							id={'card-' + card.taskId}
							className={'card full'}
							onDrop={e => {
								e.preventDefault()
								e.stopPropagation()
							}}>
							<AoPaper taskId={card.taskId} />
							<AoCardHud taskId={card.taskId} hudStyle={'full before'} />
							<div className="content">
								<AoMission taskId={card.taskId} hudStyle={'full before'} />
								<Markdown options={{ forceBlock: true }}>{content}</Markdown>
								<AoAttachment taskId={card.taskId} hudStyle={'full before'} />
							</div>
							<AoSourceStack
								inId={card.taskId}
								cards={priorityCards}
								showAdd={true}
								hideAddWhenCards={true}
								addButtonText={'+priority'}
								cardStyle={'priority'}
								onNewCard={this.newPriority}
								zone={'priorities'}
							/>
							<AoGrid taskId={card.taskId} />
							<AoSourceStack
								inId={card.taskId}
								cards={subTaskCards}
								showAdd={true}
								onNewCard={this.newSubTask}
								zone={'subTasks'}
							/>
							<AoCardHud taskId={card.taskId} hudStyle={'full after'} />
						</div>
					</React.Fragment>
				)
			case 'mini':
			default:
				let shortened = content
				if (shortened.length > 32) {
					shortened = shortened.substr(0, shortened.lastIndexOf(' ', 32))
				}

				return (
					<div
						id={'card-' + card.taskId}
						className={'card mini'}
						onDoubleClick={this.goInCard}>
						<AoPaper taskId={card.taskId} />
						<AoCardHud taskId={card.taskId} hudStyle={'mini before'} />
						<div className={'content'}>
							<Markdown options={{ forceBlock: true }}>{shortened}</Markdown>
							<AoAttachment taskId={card.taskId} hudStyle={'mini before'} />
						</div>
						<AoCardHud taskId={card.taskId} hudStyle={'mini after'} />
					</div>
				)
		}
	}
}
