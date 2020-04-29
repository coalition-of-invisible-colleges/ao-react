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

export type CardStyle = 'priority' | 'card' | 'full' | 'mini'

interface SmartCardProps {
	taskId: string
	cardStyle: CardStyle
}

const AoSmartCard: React.FunctionComponent<SmartCardProps> = observer(
	({ taskId, cardStyle }) => {
		const card: Task = aoStore.hashMap.get(taskId)
		switch (cardStyle) {
			case 'priority':
				return (
					<div className={'priority'}>
						<AoPaper taskId={taskId} />
						<div className={'content'}>
							<Markdown>{card.name}</Markdown>
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
							<Markdown>{card.name}</Markdown>
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
							<Markdown>{card.name}</Markdown>
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
				return (
					<div className={'miniCard'}>
						{card.color ? <AoPaper taskId={card.taskId} /> : ''}
						<div className={'miniCardSummary'}>
							{card.seen.some(t => {
								return t.memberId === aoStore.member.memberId
							}) ? (
								''
							) : (
								<div className={'seen'} />
							)}
							<div className={'miniCompleted'}>
								{card.claimed.indexOf(aoStore.member.memberId) >= 0 ? (
									<img
										className={'miniCheckbox'}
										src="../assets/images/completed.svg"
									/>
								) : null}
								{card.completeValue > 0 ? (
									<span className={'miniValue'}>{card.completeValue}</span>
								) : null}
							</div>
						</div>
						<Markdown options={{ forceBlock: true }}>{card.name}</Markdown>
					</div>
				)
				break
		}
	}
)

export default AoSmartCard
