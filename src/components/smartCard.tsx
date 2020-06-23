import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore, { AoState, Task } from '../client/store'
import { ObservableMap } from 'mobx'
import { delay, cancelablePromise, noop } from '../utils'
import Markdown from 'markdown-to-jsx'
import AoPaper from './paper'
import AoGrid from './grid'
import AoStack from './stack'
import AoCardHud from './cardHud'
import AoMission from './mission'
import AoAttachment from './attachment'
import AoCoin from './coin'

export type CardStyle = 'priority' | 'face' | 'full' | 'mini' | 'context'

interface CardProps {
	taskId: string
	cardStyle: CardStyle
}

interface State {
	showPriorities?: boolean
}

@observer
export default class AoSmartCard extends React.Component<CardProps, State> {
	constructor(props) {
		super(props)
		this.state = {}
		this.togglePriorities = this.togglePriorities.bind(this)
	}

	togglePriorities(event) {
		if (!this.state.showPriorities) {
			this.setState({ showPriorities: true })
		} else {
			this.setState({ showPriorities: false })
		}
	}

	render() {
		const card: Task = aoStore.hashMap.get(this.props.taskId)
		let content = card.name
		if (this.props.taskId === card.name) {
			content = aoStore.memberById.get(this.props.taskId).name
		}
		switch (this.props.cardStyle) {
			case 'context':
				return (
					<div className={'card context'}>
						<AoPaper taskId={this.props.taskId} />
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
						id={'card-' + this.props.taskId}>
						<AoPaper taskId={this.props.taskId} />
						<AoCardHud
							taskId={this.props.taskId}
							hudStyle={'collapsed'}
							prioritiesShown={this.state.showPriorities}
							onTogglePriorities={this.togglePriorities}
						/>
						<div className={'content'}>
							<AoCoin taskId={this.props.taskId} />
							<Markdown options={{ forceBlock: true }}>{content}</Markdown>
							<AoAttachment taskId={this.props.taskId} hudStyle={'collapsed'} />
						</div>
						{this.state.showPriorities ? (
							<AoStack
								taskId={this.props.taskId}
								cardSource="priorities"
								showAdd={false}
							/>
						) : null}
					</div>
				)
			case 'face':
				return (
					<div className={'card face'} id={'card-' + this.props.taskId}>
						<AoPaper taskId={this.props.taskId} />
						<AoCardHud taskId={this.props.taskId} hudStyle={'face before'} />
						<div className={'content'}>
							<AoMission taskId={this.props.taskId} hudStyle={'face before'} />
							<Markdown options={{ forceBlock: true }}>{content}</Markdown>
							<AoAttachment
								taskId={this.props.taskId}
								hudStyle={'face before'}
							/>
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
											taskId={this.props.taskId}
											cardSource="priorities"
											showAdd={false}
										/>
									) : null}
								</>
							) : null}
						</div>
						<AoCardHud taskId={this.props.taskId} hudStyle={'face after'} />
					</div>
				)
			case 'full':
				return (
					<React.Fragment>
						<AoStack taskId={this.props.taskId} cardSource={'context'} />
						<div
							id={'card-' + this.props.taskId}
							className={'card full'}
							onDrop={e => {
								e.preventDefault()
								e.stopPropagation()
							}}>
							<AoPaper taskId={this.props.taskId} />
							<AoCardHud taskId={this.props.taskId} hudStyle={'full before'} />
							<div className="content">
								<AoMission
									taskId={this.props.taskId}
									hudStyle={'full before'}
								/>
								<Markdown options={{ forceBlock: true }}>{content}</Markdown>
								<AoAttachment
									taskId={this.props.taskId}
									hudStyle={'full before'}
								/>
							</div>
							<AoStack taskId={this.props.taskId} cardSource="priorities" />
							<AoGrid taskId={this.props.taskId} />
							<AoStack taskId={this.props.taskId} cardSource="subTasks" />
							<AoCardHud taskId={this.props.taskId} hudStyle={'full after'} />
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
					<div id={'card-' + this.props.taskId} className={'card mini'}>
						<AoPaper taskId={card.taskId} />
						<AoCardHud taskId={this.props.taskId} hudStyle={'mini before'} />
						<div className={'content'}>
							<Markdown options={{ forceBlock: true }}>{shortened}</Markdown>
							<AoAttachment
								taskId={this.props.taskId}
								hudStyle={'mini before'}
							/>
						</div>
						<AoCardHud taskId={this.props.taskId} hudStyle={'mini after'} />
					</div>
				)
		}
	}
}
