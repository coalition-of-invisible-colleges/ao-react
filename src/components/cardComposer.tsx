import * as React from 'react'
import { observer } from 'mobx-react'
import { Coords } from '../cards'

interface CardComposerProps {
	onNewCard: (string, coords?) => void
	onChange?: (newName: string) => void
	onBlur?: (event) => void
	coords?: Coords
}

interface State {
	text?: string
}

@observer
export default class AoCardComposer extends React.PureComponent<
	CardComposerProps,
	State
> {
	constructor(props) {
		super(props)
		this.state = {}
		this.onBlur = this.onBlur.bind(this)
		this.onKeyDown = this.onKeyDown.bind(this)
		this.onChange = this.onChange.bind(this)
	}

	public clear() {
		this.setState({ text: '' })
	}

	onBlur(event) {
		if (this.props.onBlur) {
			this.props.onBlur(event)
		}
	}

	onKeyDown(event) {
		if (event.key === 'Enter' && !event.shiftKey) {
			const trimmed = this.state.text.trim()
			if (!trimmed || trimmed.length < 1) {
				console.log('Empty card—nothing created.')
				return
			}
			this.props.onNewCard(trimmed, this.props.coords)
			this.setState({ text: '' })
			this.onBlur(event)
		} else if (event.key === 'Escape') {
			this.onBlur(event)
		}
	}

	onChange(event) {
		this.setState({ text: event.target.value })
		if (this.props.onChange) {
			this.props.onChange(event.target.value)
		}
	}

	render() {
		return (
			<textarea
				autoFocus
				onBlur={this.onBlur}
				className={'zone cardComposer'}
				onChange={this.onChange}
				onKeyDown={this.onKeyDown}
				value={this.state.text}
			/>
		)
	}
}
