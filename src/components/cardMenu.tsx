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
    const str = console.log('taskId is ', taskId)
    return (
      <Tippy
        zIndex={2}
        content={<AoCardHud taskId={taskId} hudStyle={'menu'} />}
        interactive={true}
        trigger={'click'}
        placement={'top-end'}
        appendTo={() => {
          console.log('getting the element now')
          return document.getElementById('card-' + taskId).parentElement
        }}>
        <div className={'cardMenuButton'}>&#x22EE;</div>
      </Tippy>
    )
  }
)

export default AoCardMenu
