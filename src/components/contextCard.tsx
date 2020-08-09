import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore, { Task } from '../client/store'
import { TaskContext } from './taskContext'
// import { Redirect } from 'react-router-dom'
import { ObservableMap } from 'mobx'
import { delay, cancelablePromise, noop } from '../utils'
import api from '../client/api'
import Markdown from 'markdown-to-jsx'
import AoPaper from './paper'
import AoGrid from './grid'
import AoStack from './stack'
import AoCompleted from './completed'
import AoCardHud from './cardHud'
import AoMission from './mission'
import AoAttachment from './attachment'
import AoCoin from './coin'
import AoPreview from './preview'
import AoCheckmark from './checkmark'
import { prioritizeCard, subTaskCard, CardZone } from '../cards'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import { hideAll as hideAllTippys } from 'tippy.js'
import Completed from '../assets/images/completed.svg'

export type CardStyle =
	| 'priority'
	| 'face'
	| 'full'
	| 'compact'
	| 'mini'
	| 'checkmark'
	| 'context'
	| 'mission'
	| 'member'

export interface DragContext {
	zone: CardZone
	inId?: string
	x?: number
	y: number
}

interface CardProps {
	cardStyle?: CardStyle
	inlineStyle?: React.CSSProperties
	noContextOnFull?: boolean
	noPopups?: boolean
	noFindOnPage?: boolean
}

interface State {
	showPriorities?: boolean
	showProjects?: boolean
	// redirect?: string
}

@observer
export default class AoContextCard extends React.Component<CardProps, State> {
	static contextType = TaskContext
	static whyDidYouRender = true

	constructor(props) {
		super(props)
		this.state = {}
		this.togglePriorities = this.togglePriorities.bind(this)
		this.toggleProjects = this.toggleProjects.bind(this)
		this.newPriority = this.newPriority.bind(this)
		this.newSubTask = this.newSubTask.bind(this)
		this.goInCard = this.goInCard.bind(this)
		this.renderCardContent = this.renderCardContent.bind(this)
	}

	togglePriorities(event) {
		event.stopPropagation()
		event.nativeEvent.stopImmediatePropagation()
		if (!this.state.showPriorities) {
			this.setState({ showPriorities: true, showProjects: false })
		} else {
			this.setState({ showPriorities: false })
		}
	}

	toggleProjects(event) {
		event.stopPropagation()
		event.nativeEvent.stopImmediatePropagation()
		if (!this.state.showProjects) {
			this.setState({ showProjects: true, showPriorities: false })
		} else {
			this.setState({ showProjects: false })
		}
	}

	newPriority(name: string) {
		const { card, setRedirect } = this.context
		if (!card) {
			console.log('missing card')
		}
		api.findOrCreateCardInCard(name, card.taskId, true)
	}

	newSubTask(name: string) {
		const { card, setRedirect } = this.context
		if (!card) {
			console.log('missing card')
		}
		api.findOrCreateCardInCard(name, card.taskId)
	}

	goInCard(event) {
		event.stopPropagation()
		hideAllTippys()
		aoStore.closeAllCloseables()

		let { card, setRedirect } = this.context
		if (!card) {
			console.log('missing card')
			return
		}
		if (this.props.cardStyle === 'context') {
			aoStore.clearContextTo(card.taskId)
		} else {
			console.log('current card is ', aoStore.currentCard)
			aoStore.addToContext([aoStore.currentCard])
		}
		setRedirect(card.taskId)
	}

	applyClassIfCurrentSearchResult(taskId) {
		if (this.props.noFindOnPage) {
			return ''
		}
		if (
			aoStore.searchResults &&
			aoStore.searchResults.hasOwnProperty('all') &&
			aoStore.searchResults.all.some(task => {
				return task.taskId === taskId
			})
		) {
			return ' searchedOnPage'
		}
		return ''
	}

	renderCardContent(content: string, hideIframes = false) {
		// hideIframes doesn't  work. it's supposed to hide YouTube embeds in the mini card.

		return (
			<Markdown
				options={{
					forceBlock: true,
					overrides: {
						a: {
							props: {
								target: '_blank'
							}
						},
						iframe: {
							props: {
								display: hideIframes ? 'inherit' : 'none'
							}
						}
					}
				}}>
				{content}
			</Markdown>
		)
	}

	render() {
		let { card, setRedirect } = this.context

		if (!card) {
			console.log('missing card')
			return (
				<div className={'card'}>
					<div className={'content'}>missing card</div>
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
					<div
						className={
							'card context' + this.applyClassIfCurrentSearchResult(card.taskId)
						}
						id={'card-' + card.taskId}
						onDoubleClick={this.goInCard}
						style={this.props.inlineStyle ? this.props.inlineStyle : null}>
						<AoPaper />
						<AoCardHud hudStyle={'context'} />
						<div className={'content'}>{this.renderCardContent(content)}</div>
					</div>
				)
			case 'member':
			case 'priority':
				return (
					<div
						id={'card-' + card.taskId}
						className={
							'card priority' +
							this.applyClassIfCurrentSearchResult(card.taskId) +
							(this.state.showPriorities ? ' padbottom' : '')
						}
						onDoubleClick={this.goInCard}>
						<AoPaper />
						<AoCardHud
							hudStyle={'collapsed'}
							prioritiesShown={this.state.showPriorities}
							onTogglePriorities={this.togglePriorities}
						/>
						<div className={'content'}>
							<AoCoin noPopup={this.props.noPopups} />
							{this.renderCardContent(content)}
							<AoAttachment hudStyle={'collapsed'} />
						</div>
						{this.state.showPriorities ? (
							<AoStack
								inId={card.taskId}
								cards={priorityCards}
								cardStyle={'priority'}
								zone={'priorities'}
							/>
						) : null}
					</div>
				)
			case 'face':
			case 'compact':
				return (
					<div
						id={'card-' + card.taskId}
						className={
							'card ' +
							this.props.cardStyle +
							this.applyClassIfCurrentSearchResult(card.taskId)
						}
						onDoubleClick={this.goInCard}>
						<AoPaper />
						<AoCardHud hudStyle={'face before'} />
						<div className={'content'}>
							<AoMission hudStyle={'face before'} />
							{this.renderCardContent(content)}
							<AoAttachment hudStyle={'face before'} />
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
										<AoStack
											inId={card.taskId}
											cards={priorityCards}
											showAdd={true}
											hideAddWhenCards={true}
											addButtonText={'+priority'}
											cardStyle={'priority'}
											onNewCard={this.newPriority}
											onDrop={prioritizeCard}
											zone={'priorities'}
										/>
									) : null}
								</>
							) : null}
						</div>
						<AoCardHud hudStyle={'face after'} />
					</div>
				)
			case 'full':
				return (
					<React.Fragment>
						{this.props.noContextOnFull ? (
							''
						) : (
							<div id={'context'}>
								<AoStack
									cards={aoStore.contextCards}
									cardStyle={'context'}
									alwaysShowAll={true}
									zone={'context'}
								/>
							</div>
						)}
						<div
							id={'card-' + card.taskId}
							className={
								'card full' + this.applyClassIfCurrentSearchResult(card.taskId)
							}
							onDrop={e => {
								e.preventDefault()
								e.stopPropagation()
							}}>
							<AoPaper />
							<AoCardHud hudStyle={'full before'} />
							<div className="content">
								<AoMission hudStyle={'full before'} />
								{this.renderCardContent(content)}
								<AoAttachment hudStyle={'full before'} />
							</div>
							<AoStack
								inId={card.taskId}
								cards={priorityCards}
								showAdd={true}
								hideAddWhenCards={true}
								addButtonText={'+priority'}
								cardStyle={'priority'}
								onNewCard={this.newPriority}
								onDrop={prioritizeCard}
								zone={'priorities'}
							/>
							<AoGrid />
							<AoStack
								inId={card.taskId}
								cards={subTaskCards}
								showAdd={true}
								onNewCard={this.newSubTask}
								onDrop={subTaskCard}
								zone={'subTasks'}
							/>
							<AoCompleted />
							<AoCardHud hudStyle={'full after'} />
						</div>
					</React.Fragment>
				)
			case 'checkmark':
				return (
					<div
						id={'card-' + card.taskId}
						className={
							'card checkmark' +
							this.applyClassIfCurrentSearchResult(card.taskId)
						}>
						<AoCheckmark onGoIn={this.goInCard} />
					</div>
				)
			case 'mission':
				// A format that emphasizes the mission and projects (sub-missions), for the Missions Index
				let projectCards = () => {
					let projectCards: Task[] = []
					let allSubCards = card.priorities.concat(
						card.subTasks,
						card.completed
					)

					allSubCards.forEach(tId => {
						let subCard = aoStore.hashMap.get(tId)
						if (subCard) {
							if (subCard.guild && subCard.guild.length >= 1) {
								projectCards.push(subCard)
							}
						}
					})

					if (card.grid && card.grid.rows) {
						Object.entries(card.grid.rows).forEach(([y, row]) => {
							Object.entries(row).forEach(([x, cell]) => {
								let gridCard = aoStore.hashMap.get(cell)
								if (gridCard.guild && gridCard.guild.length >= 1) {
									projectCards.push(gridCard)
								}
							})
						})
					}

					return projectCards
				}

				return (
					<div
						className={
							'card mission' +
							(this.state.showPriorities ? ' padbottom' : '') +
							this.applyClassIfCurrentSearchResult(card.taskId)
						}
						id={'card-' + card.taskId}
						onDoubleClick={this.goInCard}>
						<AoPaper />
						<AoCardHud hudStyle={'collapsed-mission'} />
						<div className={'content'}>
							<AoCoin />
							<AoMission hudStyle={'collapsed'} />
							<AoPreview
								hudStyle={'collapsed'}
								prioritiesShown={this.state.showPriorities}
								onTogglePriorities={this.togglePriorities}
								projectsShown={this.state.showProjects}
								onToggleProjects={this.toggleProjects}
								hideSubcardCountOnCollapsed={true}
							/>
						</div>
						{this.state.showProjects ? (
							<AoStack
								inId={card.taskId}
								cards={projectCards()}
								cardStyle={'mission'}
								zone={'panel'}
							/>
						) : null}
						{this.state.showPriorities ? (
							<AoStack
								inId={card.taskId}
								cards={priorityCards}
								cardStyle={'priority'}
								zone={'panel'}
							/>
						) : null}
						<div style={{ clear: 'both', height: '1px' }} />
					</div>
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
						className={
							'card mini' + this.applyClassIfCurrentSearchResult(card.taskId)
						}
						onDoubleClick={this.goInCard}>
						<AoPaper />
						<AoCardHud hudStyle={'mini before'} />
						<div className={'content'}>
							{this.renderCardContent(content, true)}
							<AoAttachment hudStyle={'mini before'} />
						</div>
						<AoCardHud hudStyle={'mini after'} />
					</div>
				)
		}
	}
}
