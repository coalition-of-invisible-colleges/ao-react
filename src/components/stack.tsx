import * as React from 'react'
import { FunctionComponent } from 'react'
import { useState } from 'react'
import { observer } from 'mobx-react'
import { ObservableMap, computed } from 'mobx'
import { Redirect } from 'react-router-dom'
import api from '../client/api'
import aoStore from '../client/store'
import Markdown from 'markdown-to-jsx'
import AoSmartZone, { Sel, CardSource } from './smartZone'

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
  taskId: string
  cardSource: CardSource
  showAdd?: boolean
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

  show() {
    this.setState({ showAll: true })
  }

  hide() {
    this.setState({ showAll: false })
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

    let list = []
    if (this.state.showAll || this.props.cardSource === 'context') {
      list = cardsToRender.map((stId, i) => (
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
    } else if (cardsToRender.length >= 1) {
      list = [
        <AoSmartZone
          selected={this.state.selected ? this.state.selected.y === 0 : false}
          inId={this.props.taskId}
          taskId={cardsToRender[0]}
          y={0}
          onSelect={this.selectStackZone}
          onGoIn={this.goInZone}
          key={0}
          cardSource={this.props.cardSource}
        />
      ]
    }

    return (
      <div
        className={
          this.props.cardSource === 'context' ? 'context stack' : 'stack'
        }>
        {this.props.cardSource !== 'context' && this.props.showAdd !== false ? (
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
        {this.props.cardSource !== 'context' && cardsToRender.length >= 2 ? (
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
