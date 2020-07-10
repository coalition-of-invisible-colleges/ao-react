import * as React from 'react'
import { observer } from 'mobx-react'
import Tippy from '@tippyjs/react'
import { Placement } from 'tippy.js'
import 'tippy.js/dist/tippy.css'

interface PopupPanelProps {
	iconSrc: string
	tooltipText?: string
	tooltipPlacement?: Placement
	panelPlacement?: Placement
	onShown?: () => void
}

interface State {
	isPanelOpen?: boolean
}

@observer
export default class AoPopupPanel extends React.Component<
	PopupPanelProps,
	State
> {
	constructor(props) {
		super(props)
		this.state = {}
		this.onPanelOpen = this.onPanelOpen.bind(this)
		this.onPanelClose = this.onPanelClose.bind(this)
	}

	onPanelOpen() {
		this.setState({ isPanelOpen: true })
	}

	onPanelClose() {
		this.setState({ isPanelOpen: false })
	}

	render() {
		return (
			<Tippy
				zIndex={2}
				content={
					this.props.tooltipText && this.props.tooltipText.length >= 1
						? this.props.tooltipText
						: 'click to open'
				}
				placement={
					this.props.tooltipPlacement ? this.props.tooltipPlacement : 'auto'
				}>
				<Tippy
					zIndex={3}
					trigger={'click'}
					content={React.createElement(
						'div',
						{ className: 'popupPanel' },
						this.props.children
					)}
					placement={
						this.props.panelPlacement ? this.props.panelPlacement : 'auto'
					}
					interactive={true}
					maxWidth={'none'}
					onShow={this.onPanelOpen}
					onShown={this.props.onShown}
					onHide={this.onPanelClose}
					hideOnClick={'toggle'}>
					<div
						className={
							this.state.isPanelOpen ? 'actionCircle open' : 'actionCircle'
						}>
						<img src={this.props.iconSrc} />
					</div>
				</Tippy>
			</Tippy>
		)
	}
}
