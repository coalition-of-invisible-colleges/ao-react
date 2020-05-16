import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore, { Task } from '../client/store'
import api from '../client/api'
import { ObservableMap } from 'mobx'
import { delay, cancelablePromise, noop } from '../utils'
import Markdown from 'markdown-to-jsx'
import AoPalette from './palette'
import AoCoin from './coin'
import AoCheckbox from './checkbox'
import AoValue from './value'
import AoCountdown from './countdown'
import AoTimeClock from './timeclock'
import AoStack from './stack'
import AoCardMenu from './cardMenu'
import AoPreview from './preview'

export type HudStyle =
	| 'full before'
	| 'full after'
	| 'face before'
	| 'face after'
	| 'collapsed'
	| 'mini before'
	| 'mini after'
	| 'menu'

interface CardHudProps {
	taskId: string
	hudStyle: HudStyle
}

const AoCardHud: React.FunctionComponent<CardHudProps> = observer(
	({ taskId, hudStyle }) => {
		const card: Task = aoStore.hashMap.get(taskId)
		switch (hudStyle) {
			case 'collapsed':
				return (
					<div className={'hud'}>
						<AoPreview taskId={taskId} hudStyle={hudStyle} />
						<AoCountdown taskId={taskId} hudStyle={hudStyle} />
						<AoValue taskId={taskId} hudStyle={hudStyle} />
						<AoCheckbox taskId={taskId} hudStyle={hudStyle} />
						<AoCardMenu taskId={taskId} hudStyle={hudStyle} />
					</div>
				)
			case 'full before':
			case 'face before':
				return (
					<div className={'hud ' + hudStyle}>
						<AoCountdown taskId={taskId} hudStyle={hudStyle} />
						<AoValue taskId={taskId} hudStyle={hudStyle} />
						<AoCheckbox taskId={taskId} hudStyle={hudStyle} />
					</div>
				)
			case 'full after':
				return (
					<div className={'hud ' + hudStyle}>
						<AoCoin taskId={taskId} />
						<AoCardMenu taskId={taskId} hudStyle={hudStyle} />
					</div>
				)
			case 'face after':
				return (
					<div className={'hud ' + hudStyle}>
						<AoCoin taskId={taskId} />
						<AoPreview taskId={taskId} hudStyle={hudStyle} />
						<AoCardMenu taskId={taskId} hudStyle={hudStyle} />
					</div>
				)
			case 'mini before':
				return (
					<div className={'hud ' + hudStyle}>
						{card.seen &&
						card.seen.some(t => {
							return t.memberId === aoStore.member.memberId
						}) ? (
							''
						) : (
							<div className={'seen'} />
						)}
						<AoCheckbox taskId={taskId} hudStyle={hudStyle} />
						<AoValue taskId={card.taskId} hudStyle={hudStyle} />
					</div>
				)

			case 'mini after':
				return (
					<div className={'hud ' + hudStyle}>
						<AoCountdown taskId={taskId} hudStyle={hudStyle} />
						<AoPreview taskId={taskId} hudStyle={hudStyle} />
						<AoCardMenu taskId={taskId} hudStyle={hudStyle} />
					</div>
				)
			case 'menu':
				return (
					<div className={'hud menu'}>
						<AoValue taskId={taskId} hudStyle={hudStyle} />
						<AoCountdown taskId={taskId} hudStyle={hudStyle} />
						<AoTimeClock taskId={taskId} hudStyle={hudStyle} />
						<AoPalette taskId={taskId} />
					</div>
				)
		}
	}
)

export default AoCardHud
