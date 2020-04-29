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
import AoSmartZone, { Sel } from './smartZone'

interface StackState {
  redirect?: string
  selected?: Sel
}

export const defaultState: StackState = {
  redirect: undefined
}

type CardSource = 'priorities' | 'subTasks' | 'completed'

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
    console.log(
      'goInZone taskId is ',
      this.props.taskId,
      ' and cardSource is ',
      this.props.cardSource,
      ' and y is ',
      selection.y
    )
    console.log(
      "so altogether it's ",
      aoStore.hashMap.get(this.props.taskId)[this.props.cardSource]
    )
    this.setState({
      redirect:
        '/task/' +
        aoStore.hashMap.get(this.props.taskId)[this.props.cardSource][
          selection.y
        ]
    })
  }

  render() {
    console.log('AoStack taskId is ', this.props.taskId)
    const cardsToRender = aoStore.hashMap.get(this.props.taskId)[
      this.props.cardSource
    ]
    console.log('cardsToRender is ', cardsToRender)
    if (this.state.redirect !== undefined) {
      this.setState({ redirect: undefined })
      return <Redirect to={this.state.redirect} />
    }

    const list = cardsToRender
      .slice()
      .reverse()
      .map((stId, i) => (
        <AoSmartZone
          selected={this.state.selected ? this.state.selected.y === i : false}
          inId={this.props.taskId}
          taskId={stId}
          y={i}
          onSelect={this.selectStackZone}
          onGoIn={this.goInZone}
          key={i}
          cardSource={this.props.cardSource}
        />
      ))

    return (
      <div className={'stack'}>
        <AoSmartZone
          selected={this.state.selected ? this.state.selected.y === -1 : false}
          y={-1}
          inId={this.props.taskId}
          onSelect={this.selectStackZone}
          onGoIn={this.goInZone}
          cardSource={this.props.cardSource}
        />
        {list}
      </div>
    )
  }
}
