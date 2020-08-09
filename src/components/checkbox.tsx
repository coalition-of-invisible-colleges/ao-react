import React from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore, { Task } from '../client/store'
import { TaskContext } from './taskContext'
import api from '../client/api'
import { HudStyle } from './cardHud'
import Completed from '../assets/images/completed.svg'
import Uncompleted from '../assets/images/uncompleted.svg'

interface CheckboxProps {
  hudStyle: HudStyle
}

@observer
export default class AoCheckbox extends React.PureComponent<CheckboxProps> {
  static contextType = TaskContext

  render() {
    const { card, setRedirect } = this.context

    const computed = observable({
      get isCompleted() {
        return card.claimed.indexOf(aoStore.member.memberId) >= 0
      },
      get isGrabbed() {
        return card.deck.indexOf(aoStore.member.memberId) >= 0
      }
    })
    const onClick = event => {
      event.stopPropagation()
      event.nativeEvent.stopImmediatePropagation()

      if (computed.isCompleted) {
        api.uncheckCard(card.taskId)
      } else {
        api.completeCard(card.taskId)
      }
    }
    switch (this.props.hudStyle) {
      case 'full before':
      case 'face before':
      case 'collapsed':
        if (computed.isCompleted || computed.isGrabbed) {
          return (
            <img
              className="checkbox"
              src={computed.isCompleted ? Completed : Uncompleted}
              onClick={onClick}
              onDoubleClick={event => {
                event.stopPropagation()
                event.nativeEvent.stopImmediatePropagation()
              }}
            />
          )
        }
        return null
      case 'mini before':
        if (computed.isCompleted) {
          return <img src={Completed} className={'checkbox mini'} />
        }
        return null
      default:
        return null
    }
  }
}
