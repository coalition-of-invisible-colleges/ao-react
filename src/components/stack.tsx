import * as React from 'react'
import { FunctionComponent } from 'react'
import { useState } from 'react'
import { observer } from 'mobx-react'
import { ObservableMap, computed } from 'mobx'
import { Redirect } from 'react-router-dom'
import api from '../client/api'
import aoStore, { Task } from '../client/store'
import Markdown from 'markdown-to-jsx'
import AoContextCard, { CardStyle, CardZone } from './contextCard'
import { TaskContext } from './taskContext'
import AoDragZone from './dragZone'
import AoDropZone, { CardPlay, Sel } from './dropZone'
import AoCardComposer from './cardComposer'

interface StackState {
  redirect?: string
  selected?: Sel
  showAll: boolean
  showCompose: boolean
}

interface CounterWord {
  singular: string
  plural: string
}

export const defaultState: StackState = {
  redirect: undefined,
  selected: undefined,
  showAll: false,
  showCompose: false
}

interface StackProps {
  inId?: string
  cards: Task[]
  cardStyle?: CardStyle
  showAdd?: boolean
  hideAddWhenCards?: boolean
  addButtonText?: string
  alwaysShowAll?: boolean
  noFirstCard?: boolean
  descriptor?: CounterWord
  onNewCard?: (string) => void
  onDrop?: (CardPlay) => void
  zone?: CardZone
}

@observer
export default class AoStack extends React.Component<StackProps, StackState> {
  constructor(props) {
    super(props)
    this.state = defaultState
    this.selectStackZone = this.selectStackZone.bind(this)
    this.goInZone = this.goInZone.bind(this)
    this.show = this.show.bind(this)
    this.hide = this.hide.bind(this)
    this.toggleCompose = this.toggleCompose.bind(this)
  }

  selectStackZone(selection: Sel) {
    this.setState({ selected: selection })
  }

  goInZone(selection: Sel) {
    this.setState({
      redirect: '/task/' + this.props.cards[selection.y].taskId
    })
  }

  show(event) {
    event.stopPropagation()
    event.nativeEvent.stopImmediatePropagation()
    this.setState({ showAll: true })
  }

  hide(event) {
    event.stopPropagation()
    event.nativeEvent.stopImmediatePropagation()
    this.setState({ showAll: false })
  }

  toggleCompose() {
    this.setState({ showCompose: !this.state.showCompose })
  }

  render() {
    const cardsToRender =
      this.props.cards && this.props.cards.length >= 1
        ? this.props.cards
            .slice()
            .filter(t => {
              if (!t) {
                console.log('Missing card detected: ', t)
                return false
              }
              return true
            })
            .reverse()
        : []
    if (this.state.redirect !== undefined) {
      this.setState({ redirect: undefined })
      return <Redirect to={this.state.redirect} />
    }

    let addButton
    if (this.state.showCompose) {
      addButton = (
        <AoCardComposer
          onNewCard={this.props.onNewCard}
          onBlur={() => this.setState({ showCompose: false })}
        />
      )
    } else if (
      this.props.showAdd &&
      !(this.props.hideAddWhenCards && cardsToRender.length >= 1)
    ) {
      // onClick={() => this.props.onSelect({ y: this.props.y })}

      addButton = (
        <p className={'action'} onClick={this.toggleCompose}>
          {this.props.addButtonText ? this.props.addButtonText : '+card'}
        </p>
      )
    }

    let list = []
    if (this.state.showAll || this.props.alwaysShowAll) {
      // wrap a DropZone here to drop on the whole stack. call this.onDrop on drop
      list = cardsToRender.map((task, i) => (
        <TaskContext.Provider value={task} key={task.taskId}>
          <AoDragZone
            dragContext={{
              zone: this.props.zone,
              inId: this.props.inId,
              y: i
            }}>
            <AoContextCard
              cardStyle={this.props.cardStyle ? this.props.cardStyle : 'face'}
              inlineStyle={
                this.props.cardStyle === 'context'
                  ? {
                      maxWidth:
                        (30 - (cardsToRender.length - i)).toString() + 'em'
                    }
                  : {}
              }
            />
          </AoDragZone>
        </TaskContext.Provider>
      ))
    } else if (this.props.noFirstCard) {
    } else if (cardsToRender.length >= 1) {
      list = [
        <TaskContext.Provider
          value={cardsToRender[0]}
          key={cardsToRender[0].taskId}>
          <AoDragZone
            dragContext={{
              zone: this.props.zone,
              inId: this.props.inId,
              y: 0
            }}>
            <AoContextCard
              cardStyle={this.props.cardStyle ? this.props.cardStyle : 'face'}
            />
          </AoDragZone>
        </TaskContext.Provider>
      ]
    }

    let numCards = cardsToRender.length - 1
    if (this.props.noFirstCard) {
      numCards = cardsToRender.length
    }

    let renderedDescriptor: string
    if (this.props.descriptor) {
      renderedDescriptor =
        cardsToRender.length >= 2
          ? this.props.descriptor.plural
          : this.props.descriptor.singular
      renderedDescriptor = renderedDescriptor + ' '
    }

    let showButton = (
      <>
        {(!this.props.alwaysShowAll && cardsToRender.length >= 2) ||
        (this.props.noFirstCard && cardsToRender.length >= 1) ? (
          !this.state.showAll ? (
            <div onClick={this.show} className={'action'}>
              {numCards} {renderedDescriptor}&#8964;
            </div>
          ) : (
            <div onClick={this.hide} className={'action'}>
              {this.props.noFirstCard ? (
                <>
                  {numCards} {renderedDescriptor}
                </>
              ) : null}
              &#8963;
            </div>
          )
        ) : (
          ''
        )}
      </>
    )
    return (
      <div className={'stack'}>
        <AoDropZone
          inId={this.props.inId}
          y={0}
          onDrop={this.props.onDrop}
          zoneStyle={this.props.zone}>
          {addButton}
          {this.props.noFirstCard ? (
            <>
              {showButton}
              {list}
            </>
          ) : (
            <>
              {list}
              {showButton}
            </>
          )}
        </AoDropZone>
      </div>
    )
  }
}
