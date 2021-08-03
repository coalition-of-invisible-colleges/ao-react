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
	placeholderText?: string
}

interface State {
	uploadDraftTimer?
	saved?: boolean
}

@observer
export default class AoCardComposer extends React.Component<Props, State> {
	private _ismounted
	private composerBox = React.createRef<HTMLTextAreaElement>()

	constructor(props) {
		super(props)

		console.log("AO: components/cardComposer.tsx: constructor: ", {props})
		this.state = {}
		this.focus = this.focus.bind(this)
		this.uploadDraft = this.uploadDraft.bind(this)
		this.clear = this.clear.bind(this)
		this.onBlur = this.onBlur.bind(this)
		this.onKeyDown = this.onKeyDown.bind(this)
		this.onChange = this.onChange.bind(this)

		if (aoStore.member.draft) {
			aoStore.saveDraft(aoStore.member.draft)
		}
	}

	focus() {
		this.composerBox.current.focus()
	}

	componentDidMount() {
		this._ismounted = true
	}

	componentWillUnmount() {
		this._ismounted = false
	}

	uploadDraft() {
		api.updateMemberField('draft', aoStore.draft)
		if (this._ismounted) {
			this.setState({ saved: true })
		}
	}

	public clear() {
		aoStore.clearDraft()
		api.updateMemberField('draft', null)
	}

	onBlur(event) {
		this.setState({ saved: false })
		if (this.props.onBlur) {
			this.props.onBlur(event)
		}
	}

	onKeyDown(event) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault()
			if (this.state.uploadDraftTimer) {
				clearTimeout(this.state.uploadDraftTimer)
			}

			const trimmed = aoStore.draft ? aoStore.draft.trim() : null
			if (!trimmed || trimmed.length < 1) {
				console.log('Empty card—nothing created.')
				return
			}
			
			this.props.onNewCard(trimmed, this.props.coords)
			this.clear()
			this.onBlur(event)
		} else if (event.key === 'Escape') {
			this.onBlur(event)
		}
	}

	onChange(event) {
		aoStore.saveDraft(event.target.value)
		if (
			aoStore.draft !== aoStore.member.draft &&
			aoStore.draft.length >= 1 &&
			event.target.value.trim().length >= 1
		) {
			if (this.state.uploadDraftTimer) {
				clearTimeout(this.state.uploadDraftTimer)
			}
			const uploadDraftTimer = setTimeout(this.uploadDraft, 3000)
			this.setState({ uploadDraftTimer })
		}
		if (this.props.onChange) {
			this.props.onChange(event.target.value)
		}
	}

	render() {
		return (
			<div className="cardComposer">
				<textarea
					autoFocus
					onBlur={this.onBlur}
					className="zone"
					onChange={this.onChange}
					onKeyDown={this.onKeyDown}
					value={aoStore.draft}
					placeholder={this.props.placeholderText || 'idea'}
					ref={this.composerBox}
				/>
				{this.state.saved && (
					<div
						style={{
							position: 'absolute',
							right: '1.25em',
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
