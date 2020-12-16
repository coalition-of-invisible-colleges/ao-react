import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'
import { Coords } from '../cards'

interface Props {
	onNewCard: (string, coords?) => void
	onChange?: (newName: string) => void
	onBlur?: (event) => void
	coords?: Coords
}

interface State {
	uploadDraftTimer?
	saved?: boolean
}

@observer
export default class AoCardComposer extends React.PureComponent<Props, State> {
	constructor(props) {
		super(props)
		this.state = {}
		this.uploadDraft = this.uploadDraft.bind(this)
		this.onBlur = this.onBlur.bind(this)
		this.onKeyDown = this.onKeyDown.bind(this)
		this.onChange = this.onChange.bind(this)

		if (aoStore.member.draft) {
			aoStore.saveDraft(aoStore.member.draft)
		}
	}

	uploadDraft() {
		api.updateMemberField('draft', aoStore.draft)
		this.setState({ saved: true })
	}

	public clear() {
		aoStore.clearDraft()
	}

	onBlur(event) {
		this.setState({ saved: false })
		if (this.props.onBlur) {
			this.props.onBlur(event)
		}
	}

	onKeyDown(event) {
		if (event.key === 'Enter' && !event.shiftKey) {
			const trimmed = aoStore.draft ? aoStore.draft.trim() : null
			if (!trimmed || trimmed.length < 1) {
				console.log('Empty card—nothing created.')
				return
			}
			this.props.onNewCard(trimmed, this.props.coords)
			aoStore.clearDraft()
			this.onBlur(event)
		} else if (event.key === 'Escape') {
			this.onBlur(event)
		}
	}

	onChange(event) {
		aoStore.saveDraft(event.target.value)
		if (this.state.uploadDraftTimer) {
			clearTimeout(this.state.uploadDraftTimer)
		}
		const uploadDraftTimer = setTimeout(this.uploadDraft, 3000)
		this.setState({ uploadDraftTimer })
		if (this.props.onChange) {
			this.props.onChange(event.target.value)
		}
	}

	render() {
		return (
			<div style={{ position: 'relative' }}>
				<textarea
					autoFocus
					onBlur={this.onBlur}
					className="zone cardComposer"
					onChange={this.onChange}
					onKeyDown={this.onKeyDown}
					value={aoStore.draft}
					placeholder="idea"
				/>
				{this.state.saved && (
					<div
						style={{
							position: 'absolute',
							right: '1.1em',
							bottom: '1em',
							fontSize: '0.8em',
							color: 'gray'
						}}>
						saved
					</div>
				)}
			</div>
		)
	}
}
