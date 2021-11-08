import * as React from 'react'
import { observer } from 'mobx-react'
import { computed } from 'mobx'
import { Redirect } from 'react-router-dom'
import AoCardComposer from './cardComposer'
import api from '../client/api'
import { goInCard } from '../cardTypes'
import Tippy from '@tippyjs/react'
import aoStore, { Task } from '../client/store'
import Quill from '../assets/images/compose.svg'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'

interface State {
	open?: boolean
	redirect?: string
}

@observer
export default class AoGem extends React.Component<{}, State> {
	private composeRef = React.createRef<AoCardComposer>()

	constructor(props) {
		super(props)
		this.state = {}
		this.toggle = this.toggle.bind(this)
		this.close = this.close.bind(this)
		this.detectEscape = this.detectEscape.bind(this)
		this.newCard = this.newCard.bind(this)
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.state.redirect !== undefined) {
			this.setState({ redirect: undefined })
		}
	}

	toggle() {
		this.setState({ open: !this.state.open })
	}

	close() {
		this.setState({ open: false })
	}

	detectEscape(event) {
		if (event.key === 'Escape') {
			event.stopPropagation()
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

		if (taskId) {
			aoStore.getTaskById_async(taskId, card => {
				if (!card) {
					console.log('missing card')
				}

				this.setState({ open: false })
				this.composeRef.current.clear()

				if (card) {
					api.findOrCreateCardInCard(name, card.taskId)
				} else {
					api.createCard(name).then(res => {
						const taskId = JSON.parse(res.text).event.taskId
						goInCard(taskId)
						this.setState({ redirect: taskId })
					})
				}
			})
		}
	}

	render() {
		if (this.state.redirect) {
			return <Redirect to={this.state.redirect} />
		}

		const theGem = (
			<div
				className={
					'action' +
					(this.state.open ? ' open' : '') +
					(aoStore.member.draft || aoStore.draft.length >= 1 ? ' draft' : '')
				}
				onClick={this.toggle}>
				<img src={Quill} />
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
