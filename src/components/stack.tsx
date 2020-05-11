import * as React from 'react'
import { FunctionComponent } from 'react'
import { useState } from 'react'
import { observer } from 'mobx-react'
import { ObservableMap, computed } from 'mobx'
import {
  Redirect,
  Switch,
  Route,
  useParams,
  useRouteMatch
} from 'react-router-dom'
import api from '../client/api'
import aoStore from '../client/store'
import Markdown from 'markdown-to-jsx'
import AoSmartZone, { Sel, CardSource } from './smartZone'

interface StackState {
  redirect?: string
  selected?: Sel
}

export const defaultState: StackState = {
  redirect: undefined
}

interface StackProps {
  taskId: string
  cardSource: CardSource
}

@observer
export default class AoStack extends React.Component<StackProps, StackState> {
  constructor(props) {
    super(props)
    this.state = defaultState
    this.selectStackZone = this.selectStackZone.bind(this)
    this.goInZone = this.goInZone.bind(this)
  }

  selectStackZone(selection: Sel) {
    this.setState({ selected: selection })
  }

  goInZone(selection: Sel) {
    let taskId
    if (this.props.cardSource === 'context') {
      taskId = aoStore.context[selection.y]
      aoStore.clearContextTo(taskId)
    } else {
      aoStore.addToContext([this.props.taskId])
      const trueY =
        aoStore.hashMap.get(this.props.taskId)[this.props.cardSource].length -
        1 -
        selection.y
      taskId = aoStore.hashMap.get(this.props.taskId)[this.props.cardSource][
        trueY
      ]
    }
    this.setState({
      redirect: '/task/' + taskId
    })
  }

  render() {
    let cardsToRender
    if (this.props.cardSource === 'context') {
      cardsToRender = aoStore.context.slice()
    } else {
      cardsToRender = aoStore.hashMap
        .get(this.props.taskId)
        [this.props.cardSource].slice()
        .reverse()
    }
    if (this.state.redirect !== undefined) {
      this.setState({ redirect: undefined })
      return <Redirect to={this.state.redirect} />
    }

    const list = cardsToRender.map((stId, i) => (
      <AoSmartZone
        selected={this.state.selected ? this.state.selected.y === i : false}
        inId={this.props.taskId}
        taskId={stId}
        y={i}
        onSelect={this.selectStackZone}
        onGoIn={this.goInZone}
        key={i}
        cardSource={this.props.cardSource}
        style={
          this.props.cardSource === 'context'
            ? {
                maxWidth: (30 - (cardsToRender.length - i)).toString() + 'em'
              }
            : {}
        }
      />
    ))

    return (
      <div
        className={
          this.props.cardSource === 'context' ? 'context stack' : 'stack'
        }>
        {this.props.cardSource !== 'context' ? (
          <AoSmartZone
            selected={
              this.state.selected ? this.state.selected.y === -1 : false
            }
            y={-1}
            inId={this.props.taskId}
            onSelect={this.selectStackZone}
            onGoIn={this.goInZone}
            cardSource={this.props.cardSource}
          />
        ) : (
          ''
        )}
        {list}
      </div>
    )
  }
}
