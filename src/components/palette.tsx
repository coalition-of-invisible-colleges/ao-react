import * as React from 'react'
import { useState } from 'react'
import { observer } from 'mobx-react'
import aoStore, { Task } from '../client/store'
import { TaskContext } from './taskContext'
import api from '../client/api'
import { ObservableMap } from 'mobx'
import { delay, cancelablePromise, noop } from '../utils'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { formatDistanceToNow } from 'date-fns'
import AoPaper from './paper'

interface State {
  color: string
}

export const defaultState: State = {
  color: undefined
}

@observer
export default class AoPalette extends React.Component<{}, State> {
  static contextType = TaskContext

  constructor(props) {
    super(props)
    this.state = defaultState
    this.onClick = this.onClick.bind(this)
  }

  onClick(event, color) {
    const card = this.context

    api.colorCard(card.taskId, color)
    this.setState({ color: color })
  }

  render() {
    const card = this.context

    const list = ['red', 'yellow', 'green', 'blue', 'purple'].map(
      (colorName, i) => (
        <div
          onClick={event => this.onClick(event, colorName)}
          className={'swatch'}
          key={i}>
          <div
            className={card.color === colorName ? 'border selected' : 'border'}>
            <AoPaper color={colorName} />
          </div>
          <div className={'label'}>{colorName}</div>
        </div>
      )
    )
    return <div className="palette">{list}</div>
    // }
    // return (
    //   <div className="palette">
    //     <button type="button" onClick={this.startEditing}>
    //       {aoStore.hashMap.get(this.props.taskId).color
    //         ? aoStore.hashMap.get(this.props.taskId).color
    //         : 'Color'}
    //     </button>
    //   </div>
    // )
  }
}
