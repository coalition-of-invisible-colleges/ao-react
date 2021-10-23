import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'
import { HudStyle } from './cardHud'

interface Props {
  taskId: string
  hudStyle: HudStyle
}

@observer
export default class AoValue extends React.Component<Props> {
  render() {
    const card = aoStore.hashMap.get(this.props.taskId)
    if (!card) return null

    const bonus = card.boost || 0
    const hasPoints = bonus > 0

    const goal = card.hasOwnProperty('goal') && card.goal >= 0 ? card.goal : 0
    const hasGoal = goal > 0

    const pointsSlashGoal = (
      <span>
        {hasPoints ? bonus : hasGoal ? '0' : ''}
        {hasGoal && '/'}
        {hasGoal && goal}
      </span>
    )

    switch (this.props.hudStyle) {
      case 'full before':
        if (hasPoints || hasGoal) {
          return <div className="value full">{pointsSlashGoal} points</div>
        }
        return null
      case 'mini before':
        if (hasPoints || hasGoal) {
          return <span className="value mini">{pointsSlashGoal}</span>
        }
        return null
      case 'face before':
      case 'collapsed':
      default:
        if (hasPoints || hasGoal) {
          return (
            <div className={'value summary ' + this.props.hudStyle}>
              {pointsSlashGoal}
            </div>
          )
        }
        return null
    }
  }
}
