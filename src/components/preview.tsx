import React from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore, { Task } from '../client/store'
import { HudStyle } from './cardHud'
import AoStack from './stack'
import { prioritizeCard } from '../cards'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/animations/scale-extreme.css'

interface PreviewProps {
  taskId: string
  hudStyle: HudStyle
  prioritiesShown?: boolean
  onTogglePriorities?: (any) => void
  projectsShown?: boolean
  onToggleProjects?: (any) => void
  hideSubcardCountOnCollapsed?: boolean
}

@observer
export default class AoPreview extends React.PureComponent<PreviewProps> {
  render() {
    const taskId = this.props.taskId
    const card = aoStore.hashMap.get(taskId)

    const computed = observable({
      get subCardCount() {
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
        return card.priorities.length
      },
      get priorityCards() {
        let priorityCards: Task[] = []
        card.priorities.forEach(tId => {
          let priority = aoStore.hashMap.get(tId)
          if (!priority) {
            return
          }
          priorityCards.push(priority)
        })
        return priorityCards
      },
      get projectCount() {
        let count = 0
        let allSubCards = card.priorities.concat(card.subTasks, card.completed)

        allSubCards.forEach(tId => {
          let subCard = aoStore.hashMap.get(tId)
          if (subCard) {
            if (subCard.guild && subCard.guild.length >= 1) {
              count++
            }
          }
        })

        if (card.grid && card.grid.rows) {
          Object.entries(card.grid.rows).forEach(([y, row]) => {
            Object.entries(row).forEach(([x, cell]) => {
              let gridCard = aoStore.hashMap.get(cell)
              if (gridCard && gridCard.guild && gridCard.guild.length >= 1) {
                count++
              }
            })
          })
        }
        return count
      }
    })
    if (computed.subCardCount < 1) {
      return null
    }
    switch (this.props.hudStyle) {
      case 'collapsed':
        return (
          <div className={'preview'}>
            {computed.priorityCount >= 1 ? (
              <div
                className="action"
                onClick={this.props.onTogglePriorities}
                onDoubleClick={event => {
                  event.stopPropagation()
                  event.nativeEvent.stopImmediatePropagation()
                }}>
                {computed.priorityCount}{' '}
                {computed.priorityCount > 1 ? 'priorities' : 'priority'}{' '}
                {this.props.prioritiesShown ? (
                  <React.Fragment>&#8963;</React.Fragment>
                ) : (
                  <React.Fragment>&#8964;</React.Fragment>
                )}
              </div>
            ) : null}
            {this.props.onToggleProjects !== undefined &&
            computed.projectCount >= 1 ? (
              <div
                className="action"
                onClick={this.props.onToggleProjects}
                onDoubleClick={event => {
                  event.stopPropagation()
                  event.nativeEvent.stopImmediatePropagation()
                }}>
                {computed.projectCount}{' '}
                {computed.projectCount > 1 ? 'projects' : 'project'}{' '}
                {this.props.projectsShown ? (
                  <React.Fragment>&#8963;</React.Fragment>
                ) : (
                  <React.Fragment>&#8964;</React.Fragment>
                )}
              </div>
            ) : null}
            {!this.props.hideSubcardCountOnCollapsed ? (
              <>({computed.subCardCount})</>
            ) : null}
          </div>
        )
      case 'collapsed-mission':
      case 'face after':
        return <div className={'preview'}>({computed.subCardCount})</div>
      case 'mini after':
        if (computed.priorityCount >= 1) {
          return (
            <Tippy
              interactive={true}
              maxWidth={'none'}
              placement={'bottom'}
              animation={'scale-extreme'}
              delay={[625, 200]}
              appendTo={() =>
                document.getElementById('card-' + taskId).parentElement
                  .parentElement.parentElement
              }
              content={
                <AoStack
                  inId={taskId}
                  cardStyle={'priority'}
                  cards={computed.priorityCards}
                  zone={'priorities'}
                  onDrop={prioritizeCard}
                  cardsBeforeFold={3}
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
}
