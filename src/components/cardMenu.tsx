import React from 'react'
import { observable, computed } from 'mobx'
import { observer } from 'mobx-react'
import { Task } from '../client/store'
import { TaskContext } from './taskContext'
import AoCardHud, { HudStyle } from './cardHud'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'

interface CardMenuProps {
  hudStyle: HudStyle
  noPopups?: boolean
}

@observer
export default class CardMenu extends React.PureComponent<CardMenuProps> {
  static contextType = TaskContext

  @computed
  get renderMenuButton() {
    return (
      <div
        className={'cardMenuButton'}
        onDoubleClick={event => {
          event.stopPropagation()
          event.nativeEvent.stopImmediatePropagation()
        }}>
        &#x22EE;
      </div>
    )
  }

  render() {
    const { card, setRedirect } = this.context

    if (this.props.noPopups) {
      return this.renderMenuButton
    }

    return (
      <Tippy
        zIndex={5}
        content={<AoCardHud hudStyle={'menu'} />}
        interactive={true}
        trigger={'click'}
        placement={'top-end'}
        appendTo={document.getElementById('root')}>
        {this.renderMenuButton}
      </Tippy>
    )
  }
}
