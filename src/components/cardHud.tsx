import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
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
	taskId: string
	hudStyle: HudStyle
	prioritiesShown?: boolean
	onTogglePriorities?: (any) => void
	noPopups?: boolean
}

@observer
export default class CardHud extends React.PureComponent<CardHudProps> {
	render() {
		const taskId = this.props.taskId
		const card = aoStore.hashMap.get(taskId)
		const hudStyle = this.props.hudStyle

		switch (hudStyle) {
			case 'context':
				return (
					<div className={'hud'}>
						<AoMission taskId={taskId} hudStyle={hudStyle} />
						<AoPreview
							taskId={taskId}
							hudStyle={hudStyle}
							prioritiesShown={this.props.prioritiesShown}
							onTogglePriorities={this.props.onTogglePriorities}
						/>
						<AoCountdown taskId={taskId} hudStyle={hudStyle} />
					</div>
				)
				break
			case 'collapsed':
				return (
					<div className={'hud'}>
						<AoMission taskId={taskId} hudStyle={hudStyle} />
						<AoPreview
							taskId={taskId}
							hudStyle={hudStyle}
							prioritiesShown={this.props.prioritiesShown}
							onTogglePriorities={this.props.onTogglePriorities}
						/>
						<AoCountdown taskId={taskId} hudStyle={hudStyle} />
						<AoValue taskId={taskId} hudStyle={hudStyle} />
						<AoCheckbox taskId={taskId} hudStyle={hudStyle} />
						<AoCardMenu taskId={taskId} hudStyle={hudStyle} />
					</div>
				)
			case 'collapsed-mission':
				return (
					<div className={'hud'}>
						<AoPreview
							taskId={taskId}
							hudStyle={hudStyle}
							prioritiesShown={this.props.prioritiesShown}
							onTogglePriorities={this.props.onTogglePriorities}
						/>
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
						<AoCoin taskId={taskId} noPopups={this.props.noPopups} />
						<AoPreview taskId={taskId} hudStyle={hudStyle} />
						<AoCardMenu
							taskId={taskId}
							hudStyle={hudStyle}
							noPopups={this.props.noPopups}
						/>
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
						<AoMission taskId={taskId} hudStyle={hudStyle} />
						<AoCheckbox taskId={taskId} hudStyle={hudStyle} />
						<AoValue taskId={taskId} hudStyle={hudStyle} />
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
						<AoMission taskId={taskId} hudStyle={hudStyle} />
						<AoValue taskId={taskId} hudStyle={hudStyle} />
						<AoCountdown taskId={taskId} hudStyle={hudStyle} />
						<AoTimeClock taskId={taskId} hudStyle={hudStyle} />
						<AoPalette taskId={taskId} />
					</div>
				)
		}
	}
}
