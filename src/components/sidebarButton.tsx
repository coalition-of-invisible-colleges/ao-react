import * as React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore, { LeftSidebarTab } from '../client/store'
import Tippy from '@tippyjs/react'
import LazyTippy from './lazyTippy'
import { Placement, hideAll as hideAllTippys } from 'tippy.js'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'

interface PopupPanelProps {
	sidebarTab: LeftSidebarTab
	iconSrc?: string
	tooltipText?: string
	tooltipPlacement?: Placement
	onShown?: (instance) => void
	id?: string
	badge?: any
	badgeColor?: 'green' | 'yellow' | 'red'
	alsoHideHub?: boolean
	buttonClass?: string
}

interface State {
	isPanelOpen?: boolean
}

@observer
export default class AoSidebarButton extends React.Component<
	PopupPanelProps,
	State
> {
	constructor(props) {
		super(props)
		makeObservable(this)
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
				exclude: document.querySelectorAll('#hub')[1],
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
				<button
					onClick={() => {
						this.onPanelOpen()
						if (aoStore.leftSidebar === this.props.sidebarTab) {
							aoStore.closeLeftSidebar()
						} else {
							aoStore.setLeftSidebar(this.props.sidebarTab)
						}
						// if (this.props.onShown) this.props.onShown()
					}}
					id={this.props.id}
					className={
						aoStore.leftSidebar === this.props.sidebarTab
							? 'sidebarButton actionCircle open'
							: 'sidebarButton actionCircle' +
							  (this.props.buttonClass ? ' ' + this.props.buttonClass : '')
					}>
					{this.props.iconSrc && <img src={this.props.iconSrc} />}
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
				</button>
			</Tippy>
		)
	}
}
