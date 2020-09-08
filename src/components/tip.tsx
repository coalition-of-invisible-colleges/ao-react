import * as React from 'react'
import { observer } from 'mobx-react'
import Tippy from '@tippyjs/react'
import { Placement } from 'tippy.js'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'

interface PopupPanelProps {
	text: string
	placement?: Placement
}

@observer
export default class AoTip extends React.PureComponent<PopupPanelProps> {
	render() {
		return (
			<Tippy
				zIndex={4}
				theme={'translucent'}
				delay={[475, 200]}
				content={this.props.text}
				placement={this.props.placement ? this.props.placement : 'right'}
				maxWidth="15em">
				<strong
					style={{
						opacity: '0.5',
						cursor: 'default',
						display: 'inline-block'
					}}>
					&#10067;
				</strong>
			</Tippy>
		)
	}
}
