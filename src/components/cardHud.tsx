import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore, { Task } from '../client/store'
import { TaskContext } from './taskContext'
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
import AoCardMenu from './cardMenu'
import AoPreview from './preview'
import AoMission from './mission'

export type HudStyle =
	| 'context'
	| 'full before'
	| 'full after'
	| 'face before'
	| 'face after'
	| 'collapsed'
	| 'collapsed-mission'
	| 'mini before'
	| 'mini after'
	| 'menu'

interface CardHudProps {
	hudStyle: HudStyle
	prioritiesShown?: boolean
	onTogglePriorities?: (any) => void
	projectsShown?: boolean
	onToggleProjects?: (any) => void
}

const AoCardHud: React.FunctionComponent<CardHudProps> = observer(
	({
		hudStyle,
		prioritiesShown,
		onTogglePriorities,
		projectsShown,
		onToggleProjects
	}) => {
		const card: Task = React.useContext(TaskContext)
		switch (hudStyle) {
			case 'context':
				return (
					<div className={'hud'}>
						<AoMission hudStyle={hudStyle} />
						<AoPreview
							hudStyle={hudStyle}
							prioritiesShown={prioritiesShown}
							onTogglePriorities={onTogglePriorities}
						/>
						<AoCountdown hudStyle={hudStyle} />
					</div>
				)
				break
			case 'collapsed':
				return (
					<div className={'hud'}>
						<AoMission hudStyle={hudStyle} />
						<AoPreview
							hudStyle={hudStyle}
							prioritiesShown={prioritiesShown}
							onTogglePriorities={onTogglePriorities}
						/>
						<AoCountdown hudStyle={hudStyle} />
						<AoValue hudStyle={hudStyle} />
						<AoCheckbox hudStyle={hudStyle} />
						<AoCardMenu hudStyle={hudStyle} />
					</div>
				)
			case 'collapsed-mission':
				return (
					<div className={'hud'}>
						<AoPreview
							hudStyle={hudStyle}
							prioritiesShown={prioritiesShown}
							onTogglePriorities={onTogglePriorities}
						/>
						<AoCountdown hudStyle={hudStyle} />
						<AoValue hudStyle={hudStyle} />
						<AoCheckbox hudStyle={hudStyle} />
						<AoCardMenu hudStyle={hudStyle} />
					</div>
				)
			case 'full before':
			case 'face before':
				return (
					<div className={'hud ' + hudStyle}>
						<AoCountdown hudStyle={hudStyle} />
						<AoValue hudStyle={hudStyle} />
						<AoCheckbox hudStyle={hudStyle} />
					</div>
				)
			case 'full after':
				return (
					<div className={'hud ' + hudStyle}>
						<AoCoin />
						<AoCardMenu hudStyle={hudStyle} />
					</div>
				)
			case 'face after':
				return (
					<div className={'hud ' + hudStyle}>
						<AoCoin />
						<AoPreview hudStyle={hudStyle} />
						<AoCardMenu hudStyle={hudStyle} />
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
						<AoMission hudStyle={hudStyle} />
						<AoCheckbox hudStyle={hudStyle} />
						<AoValue hudStyle={hudStyle} />
					</div>
				)

			case 'mini after':
				return (
					<div className={'hud ' + hudStyle}>
						<AoCountdown hudStyle={hudStyle} />
						<AoPreview hudStyle={hudStyle} />
						<AoCardMenu hudStyle={hudStyle} />
					</div>
				)
			case 'menu':
				return (
					<div className={'hud menu'}>
						<AoMission hudStyle={hudStyle} />
						<AoValue hudStyle={hudStyle} />
						<AoCountdown hudStyle={hudStyle} />
						<AoTimeClock hudStyle={hudStyle} />
						<AoPalette />
					</div>
				)
		}
	}
)

export default AoCardHud
