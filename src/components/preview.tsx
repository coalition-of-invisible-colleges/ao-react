import React, { FunctionComponent } from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore, { Task } from '../client/store'
import { HudStyle } from './cardHud'
import Completed from '../assets/images/completed.svg'
import Uncompleted from '../assets/images/uncompleted.svg'
import AoStack from './stack'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'

interface AoPreviewProps {
  taskId: string
  hudStyle: HudStyle
  prioritiesShown?: boolean
  onTogglePriorities?: (any) => void
}

const AoPreview: FunctionComponent<AoPreviewProps> = observer(
  ({ taskId, hudStyle, prioritiesShown, onTogglePriorities }) => {
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
      },
      get priorityCount() {
        const card = aoStore.hashMap.get(taskId)
        return card.priorities.length
      },
      get priorityCards() {
        const card = aoStore.hashMap.get(taskId)
        let priorityCards: Task[] = []
        card.priorities.forEach(tId => {
          let priority = aoStore.hashMap.get(tId)
          if (!priority) {
            return
          }
          priorityCards.push(priority)
        })
        return priorityCards
      }
    })
    if (computed.subCardCount < 1) {
      return null
    }
    switch (hudStyle) {
      case 'collapsed':
        return (
          <div className={'preview'}>
            {computed.priorityCount >= 1 ? (
              <div className="action" onClick={onTogglePriorities}>
                {computed.priorityCount}{' '}
                {computed.priorityCount > 1 ? 'priorities' : 'priority'}{' '}
                {prioritiesShown ? (
                  <React.Fragment>&#8963;</React.Fragment>
                ) : (
                  <React.Fragment>&#8964;</React.Fragment>
                )}
              </div>
            ) : null}
            ({computed.subCardCount})
          </div>
        )
      case 'face after':
        return <div className={'preview'}>({computed.subCardCount})</div>
      case 'mini after':
        if (computed.priorityCount >= 1) {
          return (
            <Tippy
              interactive={true}
              maxWidth={'none'}
              appendTo={() =>
                document.getElementById('card-' + taskId).parentElement
              }
              content={
                <AoStack
                  inId={taskId}
                  cardStyle={'priority'}
                  cards={computed.priorityCards}
                />
              }>
              <div className={'preview nopad'}>{computed.priorityCount}!</div>
            </Tippy>
          )
        }
        return <div className={'preview'}>({computed.subCardCount})</div>
      default:
        return null
    }
  }
)

export default AoPreview
