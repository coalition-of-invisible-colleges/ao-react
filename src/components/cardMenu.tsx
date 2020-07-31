import React, { FunctionComponent } from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import AoCardHud, { HudStyle } from './cardHud'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'

interface AoCardMenuProps {
  taskId: string
  hudStyle: HudStyle
}

const AoCardMenu: FunctionComponent<AoCardMenuProps> = observer(
  ({ taskId, hudStyle }) => {
    return (
      <Tippy
        zIndex={5}
        content={<AoCardHud taskId={taskId} hudStyle={'menu'} />}
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
)

export default AoCardMenu
