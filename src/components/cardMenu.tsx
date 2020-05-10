import React, { FunctionComponent } from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import { useParams } from 'react-router-dom'
import AoPalette from './palette'
import AoValue from './value'
import AoCountdown from './countdown'
import AoTimeClock from './timeclock'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'

interface AoCardMenuProps {
  taskId: string
}

const AoCardMenu: FunctionComponent<AoCardMenuProps> = observer(
  ({ taskId }) => {
    return (
      <Tippy
        content={
          <div className={'cardMenu'}>
            <AoValue taskId={taskId} />
            <AoCountdown taskId={taskId} />
            <AoTimeClock taskId={taskId} />
            <AoPalette taskId={taskId} />
          </div>
        }
        interactive={true}
        trigger={'click'}
        placement={'top-end'}>
        <div className={'cardMenuButton'}>&#x22EE;</div>
      </Tippy>
    )
  }
)

export default AoCardMenu
