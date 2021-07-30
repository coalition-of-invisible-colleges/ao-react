import React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'
import { HudStyle } from './cardHud'
import Completed from '../assets/images/completed.svg'
import Uncompleted from '../assets/images/uncompleted.svg'

interface CheckboxProps {
  taskId: string
  hudStyle: HudStyle
}

@observer
export default class AoCheckbox extends React.PureComponent<CheckboxProps> {
  constructor(props: CheckboxProps) {
    super(props)
    makeObservable(this)
  }

  @computed get isCompleted() {
    const card = aoStore.hashMap.get(this.props.taskId)
    if (!card) return undefined
    return card.claimed.indexOf(aoStore.member.memberId) >= 0
  }

  @computed get isGrabbed() {
    const card = aoStore.hashMap.get(this.props.taskId)
    if (!card) return undefined
    return card.deck.indexOf(aoStore.member.memberId) >= 0
  }

  render() {
    const taskId = this.props.taskId
    const card = aoStore.hashMap.get(taskId)
    if (!card) return null

    const onClick = event => {
      event.stopPropagation()
      event.nativeEvent.stopImmediatePropagation()

      if (this.isCompleted) {
        api.uncheckCard(taskId)
      } else {
        api.completeCard(taskId)
      }
    }
    switch (this.props.hudStyle) {
      case 'full before':
      case 'face before':
      case 'collapsed':
        if (this.isCompleted || this.isGrabbed) {
          return (
            <img
              className="checkbox"
              src={this.isCompleted ? Completed : Uncompleted}
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
        if (this.isCompleted) {
          return <img src={Completed} className="checkbox mini" />
        }
      case 'badge':
        if (this.isCompleted) {
          return <img src={Completed} className="checkbox badge" />
        }
        return null
      default:
        return null
    }
  }
}
