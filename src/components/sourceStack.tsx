// move onDrag out logic to smartCard (all cards are draggable)
// dropZone only wraps the immediate element that is droppable. so dropZone will wrap the entire priorities region.import
// start by getting drag to work from Top Missions list to Community Hub grid

import * as React from 'react'
import { FunctionComponent } from 'react'
import { useState } from 'react'
import { observer } from 'mobx-react'
import { ObservableMap, computed } from 'mobx'
import { Redirect } from 'react-router-dom'
import api from '../client/api'
import aoStore, { Task } from '../client/store'
import Markdown from 'markdown-to-jsx'
import { Sel } from './smartZone'
import AoContextCard, { CardStyle, CardZone } from './contextCard'
import { TaskContext } from './taskContext'
import AoDragZone from './dragZone'
import AoCardComposer from './cardComposer'

interface StackState {
  redirect?: string
  selected?: Sel
  showAll: boolean
  showCompose: boolean
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
  onNewCard?: (string) => void
  onDrop?: (event) => void
  zone?: CardZone
}

@observer
export default class AoSourceStack extends React.Component<
  StackProps,
  StackState
> {
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

  show() {
    this.setState({ showAll: true })
  }

  hide() {
    this.setState({ showAll: false })
  }

  toggleCompose() {
    this.setState({ showCompose: !this.state.showCompose })
  }

  render() {
    const cardsToRender =
      this.props.cards && this.props.cards.length >= 1
        ? this.props.cards.slice().reverse()
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
            />
          </AoDragZone>
        </TaskContext.Provider>
      ))
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

    return (
      <div className={'stack'}>
        {addButton}
        {list}
        {!this.props.alwaysShowAll && cardsToRender.length >= 2 ? (
          !this.state.showAll ? (
            <div onClick={this.show} className={'action'}>
              {cardsToRender.length - 1} &#8964;
            </div>
          ) : (
            <div onClick={this.hide} className={'action'}>
              &#8963;
            </div>
          )
        ) : (
          ''
        )}
      </div>
    )
  }
}
