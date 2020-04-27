import * as React from 'react'
import { observer } from 'mobx-react'
import { Redirect } from 'react-router-dom'
import aoStore, { AoState } from '../client/store'
import api from '../client/api'
import { ObservableMap } from 'mobx'
import { delay, cancelablePromise, noop } from '../utils'

interface State {
  editing: boolean
  text?: string
}

export const defaultState: State = {
  editing: false,
  text: undefined
}

interface ValueParams {
  taskId: string
}

@observer
export default class AoValue extends React.Component<ValueParams, State> {
  constructor(props) {
    super(props)
    this.state = defaultState
    this.startEditing = this.startEditing.bind(this)
    this.saveValue = this.saveValue.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
    // this.textBox = React.createRef()
    console.log('AoValue!')
  }

  // componentDidUpdate() {
  //   this.refs.textBox.focus()
  // }

  startEditing(event) {
    console.log(
      'value is ',
      aoStore.hashMap.get(this.props.taskId).completeValue
    )
    if (aoStore.hashMap.get(this.props.taskId).completeValue) {
      console.log('has a value')
      this.setState({
        text: aoStore.hashMap.get(this.props.taskId).completeValue.toString()
      })
    }
    this.setState({ editing: true })
  }

  saveValue(event) {
    console.log('save Value', event.target.value)
    let newValue: number =
      this.state.text.length > 0 ? parseInt(this.state.text, 10) : 0
    if (newValue !== NaN) {
      api.valueCard(this.props.taskId, newValue)
      this.setState({ editing: false })
    }
  }

  onKeyDown(event) {
    if (event.key === 'Enter') {
      this.saveValue(event)
    }
  }

  onChange(event) {
    console.log('on change', event.target.value)
    this.setState({ text: event.target.value })
  }

  render() {
    if (this.state.editing) {
      return (
        <div className="value">
          <input
            type="text"
            onChange={this.onChange}
            onKeyDown={this.onKeyDown}
            // ref={this.textBox}
            value={this.state.text}
            autoFocus
          />
          <button type="button" onClick={this.saveValue}>
            Set Value
          </button>
        </div>
      )
    }
    return (
      <div className="value">
        <button type="button" onClick={this.startEditing}>
          {aoStore.hashMap.get(this.props.taskId).completeValue
            ? aoStore.hashMap.get(this.props.taskId).completeValue
            : 'P'}
        </button>
      </div>
    )
  }
}
