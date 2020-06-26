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
import AoSmartCard from './smartCard'

interface StackState {
  redirect?: string
  selected?: Sel
  showAll: boolean
}

export const defaultState: StackState = {
  redirect: undefined,
  selected: undefined,
  showAll: false
}

interface StackProps {
  inId?: string
  cards: Task[]
  showAdd?: boolean
  alwaysShowAll?: boolean
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

  render() {
    let cardsToRender = this.props.cards
    if (this.state.redirect !== undefined) {
      this.setState({ redirect: undefined })
      return <Redirect to={this.state.redirect} />
    }

    let list = []
    if (this.state.showAll || this.props.alwaysShowAll) {
      list = cardsToRender.map((task, i) => (
        <AoSmartCard
          taskId={task.taskId}
          cardStyle={'priority'}
          key={task.taskId}
        />
      ))
    } else if (cardsToRender.length >= 1) {
      list = [
        <AoSmartCard
          taskId={cardsToRender[0].taskId}
          cardStyle={'priority'}
          key={cardsToRender[0].taskId}
        />
      ]
    }

    console.log('list is ', list)

    return (
      <div className={'stack'}>
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
