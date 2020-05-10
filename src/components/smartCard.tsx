import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore, { Task } from '../client/store'
import api from '../client/api'
import { ObservableMap } from 'mobx'
import { delay, cancelablePromise, noop } from '../utils'
import Markdown from 'markdown-to-jsx'
import AoPaper from './paper'
import AoPalette from './palette'
import AoCoin from './coin'
import AoCheckbox from './checkbox'
import AoValue from './value'
import AoCountdown from './countdown'
import AoTimeClock from './timeclock'
import AoGrid from './grid'
import Completed from '../assets/images/completed.svg'

export type CardStyle = 'priority' | 'card' | 'full' | 'mini'

interface SmartCardProps {
	taskId: string
	cardStyle: CardStyle
}

const AoSmartCard: React.FunctionComponent<SmartCardProps> = observer(
	({ taskId, cardStyle }) => {
		const card: Task = aoStore.hashMap.get(taskId)
		let content = card.name
		if (taskId === card.name) {
			content = aoStore.memberById.get(taskId).name
		}
		switch (cardStyle) {
			case 'priority':
				return (
					<div className={'card prioritized'}>
						<AoPaper taskId={taskId} />
						<div className={'content'}>
							<Markdown options={{ forceBlock: true }}>{content}</Markdown>
						</div>
						<AoValue taskId={taskId} />
						<AoCheckbox taskId={taskId} />
					</div>
				)
				break
			case 'card':
				return (
					<div className={'card'}>
						<AoPaper taskId={taskId} />
						<AoValue taskId={taskId} />
						<AoCheckbox taskId={taskId} />
						<div className={'content'}>
							<Markdown options={{ forceBlock: true }}>{content}</Markdown>
						</div>
						<AoCoin taskId={taskId} />
					</div>
				)
				break
			case 'full':
				return (
					<div className={'card'}>
						<AoPaper taskId={taskId} />
						<AoValue taskId={taskId} />
						<AoCheckbox taskId={taskId} />
						<div className={'content'}>
							<Markdown options={{ forceBlock: true }}>{content}</Markdown>
						</div>
						<AoTimeClock taskId={taskId} />
						<AoPalette taskId={taskId} />
						<AoCountdown taskId={taskId} />
						<AoCoin taskId={taskId} />
					</div>
				)
				break
			case 'mini':
			default:
				let gridCardCount = 0
				if (card.grid) {
					console.log('grid is ', card.grid)
					Object.keys(card.grid.rows).forEach(i => {
						console.log('row! row is ', card.grid.rows[i])
						Object.keys(card.grid.rows[i]).forEach(cell => {
							console.log('cell!')
							gridCardCount++
						})
					})
				}
				console.log('gridCardCount is ', gridCardCount)
				const subCardCount =
					card.priorities.length +
					gridCardCount +
					card.subTasks.length +
					card.completed.length
				return (
					<div className={'miniCard'}>
						{card.color ? <AoPaper taskId={card.taskId} /> : ''}
						<div className={'miniCardSummary'}>
							{card.seen &&
							card.seen.some(t => {
								return t.memberId === aoStore.member.memberId
							}) ? (
								''
							) : (
								<div className={'seen'} />
							)}
							<div className={'miniCompleted'}>
								{card.claimed.indexOf(aoStore.member.memberId) >= 0 ? (
									<img className={'miniCheckbox'} src={Completed} />
								) : null}
								{card.completeValue > 0 ? (
									<span className={'miniValue'}>{card.completeValue}</span>
								) : null}
							</div>
							{subCardCount >= 1 ? (
								<div className={'miniPreview'}>{subCardCount}</div>
							) : (
								''
							)}
						</div>
						<div className={'content'}>
							<Markdown options={{ forceBlock: true }}>{content}</Markdown>
						</div>
					</div>
				)
				break
		}
	}
)

export default AoSmartCard
