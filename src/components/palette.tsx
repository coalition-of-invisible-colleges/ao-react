import * as React from 'react'
import { useState } from 'react'
import { observer } from 'mobx-react'
import { Redirect } from 'react-router-dom'
import aoStore, { AoState } from '../client/store'
import api from '../client/api'
import { ObservableMap } from 'mobx'
import { delay, cancelablePromise, noop } from '../utils'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { formatDistanceToNow } from 'date-fns'

interface State {
  editing: boolean
  color: string
}

export const defaultState: State = {
  editing: false,
  color: undefined
}

interface PaletteParams {
  taskId: string
}

@observer
export default class AoPalette extends React.Component<PaletteParams, State> {
  constructor(props) {
    super(props)
    this.state = defaultState
    this.startEditing = this.startEditing.bind(this)
    this.onClick = this.onClick.bind(this)
    console.log('AoCountdown!')
  }

  startEditing(event) {
    if (aoStore.hashMap.get(this.props.taskId).color) {
      console.log('has a value')
      this.setState({
        color: aoStore.hashMap.get(this.props.taskId).color
      })
    }
    this.setState({ editing: true })
  }

  onClick(event, color) {
    console.log('onClick color is ', color)
    api.colorCard(this.props.taskId, color)
    this.setState({ color: color, editing: false })
  }

  render() {
    if (this.state.editing) {
      return (
        <div className="palette">
          <button onClick={event => this.onClick(event, 'red')}>Red</button>
          <button onClick={event => this.onClick(event, 'yellow')}>
            Yellow
          </button>
          <button onClick={event => this.onClick(event, 'green')}>Green</button>
          <button onClick={event => this.onClick(event, 'blue')}>Blue</button>
          <button onClick={event => this.onClick(event, 'purple')}>
            Purple
          </button>
          <button onClick={event => this.onClick(event, 'black')}>Black</button>
        </div>
      )
    }
    return (
      <div className="palette">
        <button type="button" onClick={this.startEditing}>
          {aoStore.hashMap.get(this.props.taskId).color
            ? aoStore.hashMap.get(this.props.taskId).color
            : 'Color'}
        </button>
      </div>
    )
  }
}
