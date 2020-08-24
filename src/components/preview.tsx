import React from 'react'
import { observable, computed } from 'mobx'
import { observer } from 'mobx-react'
import aoStore, { Task } from '../client/store'
import { HudStyle } from './cardHud'
import AoStack from './stack'
import { prioritizeCard } from '../cards'
import Tippy from '@tippyjs/react'
import LazyTippy from './lazyTippy'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/animations/scale-extreme.css'
import _ from 'lodash'

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
  preventDoubleClick(event) {
    event.stopPropagation()
    event.nativeEvent.stopImmediatePropagation()
  }

  @computed get subCardCount() {
    const card = aoStore.hashMap.get(this.props.taskId)
    if (!card) return null

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

  @computed get priorityCount() {
    const card = aoStore.hashMap.get(this.props.taskId)

    return card.priorities.length
  }

  @computed get priorityCards() {
    const card = aoStore.hashMap.get(this.props.taskId)

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

  render() {
    if (this.subCardCount < 1) {
      return null
    }

    const taskId = this.props.taskId
    const card = aoStore.hashMap.get(taskId)
    const projects = aoStore.subGuildsByGuild.get(taskId)
    const projectCount = projects ? projects.length : undefined

    switch (this.props.hudStyle) {
      case 'collapsed':
        return (
          <div className={'preview'}>
            {this.priorityCount >= 1 ? (
              <div
                className="action togglePriorities"
                onClick={this.props.onTogglePriorities}
                onDoubleClick={event => {
                  event.stopPropagation()
                  event.nativeEvent.stopImmediatePropagation()
                }}>
                {this.priorityCount}{' '}
                {this.priorityCount > 1 ? 'priorities' : 'priority'}{' '}
                {this.props.prioritiesShown ? (
                  <React.Fragment>&#8963;</React.Fragment>
                ) : (
                  <React.Fragment>&#8964;</React.Fragment>
                )}
              </div>
            ) : null}
            {this.props.onToggleProjects !== undefined && projectCount >= 1 ? (
              <div
                className="action toggleProjects"
                onClick={this.props.onToggleProjects}
                onDoubleClick={this.preventDoubleClick}>
                {projectCount} {projectCount > 1 ? 'projects' : 'project'}{' '}
                {this.props.projectsShown ? (
                  <React.Fragment>&#8963;</React.Fragment>
                ) : (
                  <React.Fragment>&#8964;</React.Fragment>
                )}
              </div>
            ) : null}
            {!this.props.hideSubcardCountOnCollapsed ? (
              <>({this.subCardCount})</>
            ) : null}
          </div>
        )
      case 'collapsed-mission':
      case 'face after':
        return <div className={'preview'}>({this.subCardCount})</div>
      case 'mini after':
        if (this.priorityCount >= 1) {
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
                  cards={this.priorityCards}
                  zone={'priorities'}
                  onDrop={prioritizeCard}
                  cardsBeforeFold={3}
                />
              }>
              <div className={'preview nopad'}>{this.priorityCount}!</div>
            </Tippy>
          )
        }
        return <div className={'preview'}>({this.subCardCount})</div>
      default:
        return null
    }
  }
}
