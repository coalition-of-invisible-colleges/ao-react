import React from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import { Task } from '../client/store'
import { TaskContext } from './taskContext'
import AoCardHud, { HudStyle } from './cardHud'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'

interface CardMenuProps {
  hudStyle: HudStyle
}

@observer
export default class CardMenu extends React.PureComponent<CardMenuProps> {
  static contextType = TaskContext

  render() {
    const { card, setRedirect } = this.context

    return (
      <Tippy
        zIndex={5}
        content={<AoCardHud hudStyle={'menu'} />}
        interactive={true}
        trigger={'click'}
        placement={'top-end'}
        appendTo={document.getElementById('root')}>
        <div
          className={'cardMenuButton'}
          onDoubleClick={event => {
            event.stopPropagation()
            event.nativeEvent.stopImmediatePropagation()
          }}>
          &#x22EE;
        </div>
      </Tippy>
    )
  }
}
