import React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore, { Task } from '../client/store'
import { HudStyle } from './cardHud'
import AoStack from './stack'
import { prioritizeCard } from '../cardTypes'
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
  constructor(props: PreviewProps) {
    super(props)
    makeObservable(this)
  }

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

  @computed get renderedPriorities() {
    const taskId = this.props.taskId
    const card = aoStore.hashMap.get(taskId)

    const stopIt = event => {
      event.stopPropagation()
    }

    return (
      <div onClick={stopIt}>
        {aoStore.currentCard === taskId ? (
          <p>You Are Here</p>
        ) : (
          <React.Fragment>
            {this.props.hudStyle === 'badge' &&
            card.guild &&
            card.guild.length >= 1 ? (
              <h3>{card.guild}</h3>
            ) : null}
            <AoStack
              inId={taskId}
              cardStyle="priority"
              cards={this.priorityCards}
              zone="priorities"
              onDrop={prioritizeCard}
              cardsBeforeFold={3}
            />
          </React.Fragment>
        )}
      </div>
    )
  }

  render() {
    if (this.subCardCount < 1) {
      return null
    }

    const taskId = this.props.taskId
    const card = aoStore.hashMap.get(taskId)
    const projects = aoStore.subGuildsByGuild.get(taskId)
    const projectCount = projects ? projects.length : undefined

    let delay
    let wrappedPriorityCount

    switch (this.props.hudStyle) {
      case 'collapsed':
        return (
          <div className="preview">
            {this.priorityCount >= 1 ? (
              <div
                className="action togglePriorities"
                onClick={this.props.onTogglePriorities}
                onDoubleClick={this.preventDoubleClick}>
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
        return <div className="preview">({this.subCardCount})</div>
      case 'badge':
        delay = [0, 0]
        if (this.priorityCount >= 1) {
          wrappedPriorityCount = (
            <div className="label">{this.priorityCount}!</div>
          )
        } else {
          return null
        }
      case 'mini after':
        if (delay === undefined) {
          delay = [625, 200]
        }
        if (wrappedPriorityCount == undefined) {
          wrappedPriorityCount = (
            <div className="label">{this.priorityCount + '!'}</div>
          )
        }
        if (this.priorityCount >= 1) {
          const placement = this.props.hudStyle === 'badge' ? 'top' : 'bottom'
          return (
            <div
              className="preview nopad"
              onClickCapture={event => {
                console.log('propagating to', event.currentTarget.parentElement)
                document.getElementById('card-clickable-' + taskId).click()
              }}>
              <LazyTippy
                interactive={true}
                maxWidth="none"
                placement={placement}
                animation="scale-extreme"
                delay={delay}
                theme="translucent"
                appendTo={() =>
                  document.getElementById('card-' + taskId).parentElement
                    .parentElement.parentElement.parentElement
                }
                content={this.renderedPriorities}>
                {wrappedPriorityCount}
              </LazyTippy>
            </div>
          )
        }
        return <div className="preview">({this.subCardCount})</div>
      default:
        return null
    }
  }
}
