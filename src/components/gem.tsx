import * as React from 'react'
import { computed } from 'mobx'
import { observer } from 'mobx-react'
import AoCardComposer from './cardComposer'
import api from '../client/api'
import Tippy from '@tippyjs/react'
import aoStore, { Task } from '../client/store'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'

interface State {
	open?: boolean
}

@observer
export default class AoGem extends React.PureComponent<{}, State> {
	private composeRef = React.createRef<AoCardComposer>()

	constructor(props) {
		super(props)
		this.state = {}
		this.toggle = this.toggle.bind(this)
		this.close = this.close.bind(this)
		this.detectEscape = this.detectEscape.bind(this)
		this.newCard = this.newCard.bind(this)
	}

	toggle() {
		this.setState({ open: !this.state.open })
	}

	close() {
		this.setState({ open: false })
	}

	detectEscape(event) {
		if (event.key === 'Escape') {
			this.close()
		}
	}

	newCard(name: string) {
		if (name.trim().length < 1) {
			return
		}

		let taskId = aoStore.currentCard
		if (!taskId) {
			taskId = aoStore.memberCard.taskId
		}

		let card
		if (taskId) {
			card = aoStore.hashMap.get(taskId)
			if (!card) {
				console.log('missing card')
			}
		}

		this.setState({ open: false })
		this.composeRef.current.clear()

		if (card) {
			api.findOrCreateCardInCard(name, card.taskId)
		} else {
			api.createCard(name)
		}
	}

	render() {
		const theGem = (
			<div
				className={'action' + (this.state.open ? ' open' : '')}
				onClick={this.toggle}>
				{aoStore.member.draft ? 'draft' : '+card'}
			</div>
		)

		return (
			<div id="gem" onKeyDown={this.detectEscape}>
				{this.state.open && (
					<AoCardComposer
						ref={this.composeRef}
						onNewCard={this.newCard}
						onBlur={this.close}
					/>
				)}
				{!this.state.open ? (
					<Tippy
						zIndex={4}
						theme="translucent"
						content={
							aoStore.member.draft
								? 'Continue your draft'
								: 'Compose a new card'
						}>
						{theGem}
					</Tippy>
				) : (
					theGem
				)}
			</div>
		)
	}
}
