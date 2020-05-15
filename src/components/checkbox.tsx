import React, { FunctionComponent } from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'
import { HudStyle } from './cardHud'
import Completed from '../assets/images/completed.svg'
import Uncompleted from '../assets/images/uncompleted.svg'

interface AoCheckboxProps {
  taskId: string
  hudStyle: HudStyle
}

const AoCheckbox: FunctionComponent<AoCheckboxProps> = observer(
  ({ taskId, hudStyle }) => {
    const computed = observable({
      get isCompleted() {
        return (
          aoStore.hashMap
            .get(taskId)
            .claimed.indexOf(aoStore.member.memberId) >= 0
        )
      }
    })
    const onClick = event => {
      event.stopPropagation()
      if (computed.isCompleted) {
        api.uncheckCard(taskId)
      } else {
        api.completeCard(taskId)
      }
    }
    switch (hudStyle) {
      case 'full before':
      case 'face before':
      case 'collapsed':
        return (
          <img
            className="checkbox"
            src={computed.isCompleted ? Completed : Uncompleted}
            onClick={onClick}
          />
        )
      case 'mini before':
        if (computed.isCompleted) {
          return <img src={Completed} className={'checkbox mini'} />
        }
        return null
      default:
        return null
    }
  }
)

export default AoCheckbox
