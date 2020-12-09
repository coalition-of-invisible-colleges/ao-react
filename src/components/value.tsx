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
export default class AoValue extends React.PureComponent<Props> {
  render() {
    const card = aoStore.hashMap.get(this.props.taskId)
    if (!card) return null

    const bonus = card.boost || 0
    const hasPoints = bonus > 0

    switch (this.props.hudStyle) {
      case 'full before':
        if (hasPoints) {
          return <div className="value full">{bonus + ' points'}</div>
        }
        return null
      case 'mini before':
        if (hasPoints) {
          return <span className="value mini">{bonus + 'p'}</span>
        }
        return null
      case 'face before':
      case 'collapsed':
      default:
        if (hasPoints) {
          return (
            <div className={'value summary ' + this.props.hudStyle}>
              {bonus + 'p'}
            </div>
          )
        }
        return null
    }
  }
}
