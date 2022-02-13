import React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import AoCardHud, { HudStyle } from './cardHud'
import LazyTippy from './lazyTippy'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'

interface Props {
  taskId: string
  hudStyle: HudStyle
  noPopups?: boolean
}

@observer
export default class CardMenu extends React.Component<Props> {
  constructor(props: Props) {
    super(props)
    makeObservable(this)
  }

  @computed
  get renderMenuButton() {
    return (
      <div
        className="cardMenuButton"
        onClick={event => event.stopPropagation()}
        onDoubleClick={event => {
          event.stopPropagation()
          event.nativeEvent.stopImmediatePropagation()
        }}>
        &#x22EE;
      </div>
    )
  }

  render() {
    if (this.props.noPopups) {
      return this.renderMenuButton
    }

    return (
            <LazyTippy
            zIndex={5}
            content={<AoCardHud taskId={this.props.taskId} hudStyle="menu" />}
            interactive={true}
            trigger="click"
            placement="top-end"
            appendTo={document.getElementById('root')}
            theme="translucent">
            {this.renderMenuButton}
            </LazyTippy>
           )
  }
}
