import * as React from 'react'
import { computed } from 'mobx'
import { observer } from 'mobx-react'
import Tippy from '@tippyjs/react'
import LazyTippy from './lazyTippy'
import { Placement, hideAll as hideAllTippys } from 'tippy.js'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'

interface PopupPanelProps {
	iconSrc: string
	tooltipText?: string
	tooltipPlacement?: Placement
	panelPlacement?: Placement
	onShown?: (instance) => void
	id?: string
	badge?: any
	badgeColor?: 'green' | 'yellow'
	alsoHideHub?: boolean
}

interface State {
	isPanelOpen?: boolean
}

@observer
export default class AoPopupPanel extends React.PureComponent<
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
		if (this.props.alsoHideHub) {
			hideAllTippys()
		} else {
			hideAllTippys({
				// This is messy but hopefully works consistently.
				exclude: document.querySelectorAll('#hub')[1]
			})
		}
		this.setState({ isPanelOpen: true })
	}

	onPanelClose() {
		this.setState({ isPanelOpen: false })
	}

	@computed get renderContent() {
		return React.createElement(
			'div',
			{ className: 'popupPanel' },
			this.props.children
		)
	}

	render() {
		return (
			<LazyTippy
				zIndex={3}
				trigger="click"
				content={this.renderContent}
				placement={
					this.props.panelPlacement ? this.props.panelPlacement : 'auto'
				}
				interactive={true}
				maxWidth="none"
				onShow={this.onPanelOpen}
				onShown={instance => {
					this.props.onShown ? this.props.onShown(instance) : undefined
				}}
				onHide={this.onPanelClose}
				hideOnClick="toggle">
				<Tippy
					zIndex={4}
					theme="translucent"
					content={
						this.props.tooltipText && this.props.tooltipText.length >= 1
							? this.props.tooltipText
							: 'click to open'
					}
					placement={
						this.props.tooltipPlacement ? this.props.tooltipPlacement : 'auto'
					}>
					<div
						id={this.props.id}
						className={
							this.state.isPanelOpen ? 'actionCircle open' : 'actionCircle'
						}>
						<img src={this.props.iconSrc} />
						{this.props.badge ? (
							<div
								className={
									'badge' +
									(this.props.badgeColor ? ' ' + this.props.badgeColor : '')
								}>
								{this.props.badge}
							</div>
						) : (
							''
						)}
					</div>
				</Tippy>
			</LazyTippy>
		)
	}
}
