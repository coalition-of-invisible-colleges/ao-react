import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore, { Task } from '../client/store'
import { ObservableMap } from 'mobx'
import { delay, cancelablePromise, noop } from '../utils'
import Markdown from 'markdown-to-jsx'
import AoPaper from './paper'
import AoGrid from './grid'
import AoStack from './stack'
import AoCardHud from './cardHud'

export type CardStyle = 'priority' | 'face' | 'full' | 'mini' | 'context'

interface CardProps {
	taskId: string
	cardStyle: CardStyle
}

const AoSmartCard: React.FunctionComponent<CardProps> = observer(
	({ taskId, cardStyle }) => {
		const card: Task = aoStore.hashMap.get(taskId)
		let content = card.name
		if (taskId === card.name) {
			content = aoStore.memberById.get(taskId).name
		}
		switch (cardStyle) {
			case 'context':
				return (
					<div className={'card context'}>
						<AoPaper taskId={taskId} />
						<div className={'content'}>
							<Markdown options={{ forceBlock: true }}>{content}</Markdown>
						</div>
					</div>
				)
			case 'priority':
				return (
					<div className={'card priority'} id={'card-' + taskId}>
						<AoPaper taskId={taskId} />
						<AoCardHud taskId={taskId} hudStyle="collapsed" />
						<div className={'content'}>
							<Markdown options={{ forceBlock: true }}>{content}</Markdown>
						</div>
					</div>
				)
			case 'face':
				return (
					<div className={'card face'} id={'card-' + taskId}>
						<AoPaper taskId={taskId} />
						<AoCardHud taskId={taskId} hudStyle={'face before'} />
						<div className={'content'}>
							<Markdown options={{ forceBlock: true }}>{content}</Markdown>
						</div>
						<AoCardHud taskId={taskId} hudStyle={'face after'} />
					</div>
				)
			case 'full':
				return (
					<React.Fragment>
						<AoStack taskId={taskId} cardSource={'context'} />
						<div
							id={'card-' + taskId}
							className={'card full'}
							onDrop={e => {
								e.preventDefault()
								e.stopPropagation()
							}}>
							<AoPaper taskId={taskId} />
							<AoCardHud taskId={taskId} hudStyle={'full before'} />
							<div className="content">
								<Markdown options={{ forceBlock: true }}>{content}</Markdown>
							</div>
							<AoStack taskId={taskId} cardSource="priorities" />
							<AoGrid taskId={taskId} />
							<AoStack taskId={taskId} cardSource="subTasks" />
							<AoCardHud taskId={taskId} hudStyle={'full after'} />
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
					<div className={'card mini'}>
						<AoPaper taskId={card.taskId} />
						<AoCardHud taskId={taskId} hudStyle={'mini before'} />
						<div className={'content'}>
							<Markdown options={{ forceBlock: true }}>{shortened}</Markdown>
						</div>
						<AoCardHud taskId={taskId} hudStyle={'mini after'} />
					</div>
				)
		}
	}
)

export default AoSmartCard
