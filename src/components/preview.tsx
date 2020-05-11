import React, { FunctionComponent } from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import { useParams } from 'react-router-dom'
import api from '../client/api'
import { HudStyle } from './cardHud'
import Completed from '../assets/images/completed.svg'
import Uncompleted from '../assets/images/uncompleted.svg'

interface AoPreviewProps {
  taskId: string
  hudStyle: HudStyle
}

const AoCheckbox: FunctionComponent<AoPreviewProps> = observer(
  ({ taskId, hudStyle }) => {
    const computed = observable({
      get subCardCount() {
        const card = aoStore.hashMap.get(taskId)
        let gridCardCount = 0
        if (card.grid) {
          Object.keys(card.grid.rows).forEach(i => {
            Object.keys(card.grid.rows[i]).forEach(cell => {
              gridCardCount++
            })
          })
        }
        const subCardCount =
          card.priorities.length +
          gridCardCount +
          card.subTasks.length +
          card.completed.length
        return subCardCount
      }
    })
    if (computed.subCardCount < 1) {
      return null
    }
    switch (hudStyle) {
      case 'face after':
      case 'collapsed':
      case 'mini after':
        return <div className={'preview'}>({computed.subCardCount})</div>
      default:
        return null
    }
  }
)

export default AoCheckbox
