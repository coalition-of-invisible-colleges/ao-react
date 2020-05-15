import * as React from 'react'
import { useState } from 'react'
import { observer } from 'mobx-react'
import aoStore, { AoState } from '../client/store'
import api from '../client/api'
import { ObservableMap } from 'mobx'
import { delay, cancelablePromise, noop } from '../utils'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { formatDistanceToNow } from 'date-fns'
import AoPaper from './paper'

interface State {
  // editing: boolean
  color: string
}

export const defaultState: State = {
  // editing: false,
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
    // this.startEditing = this.startEditing.bind(this)
    this.onClick = this.onClick.bind(this)
  }

  // startEditing(event) {
  //   if (aoStore.hashMap.get(this.props.taskId).color) {
  //     console.log('has a value')
  //     this.setState({
  //       color: aoStore.hashMap.get(this.props.taskId).color
  //     })
  //   }
  //   this.setState({ editing: true })
  // }

  onClick(event, color) {
    api.colorCard(this.props.taskId, color)
    this.setState({ color: color })
  }

  render() {
    // if (this.state.editing) {
    const list = ['red', 'yellow', 'green', 'blue', 'purple'].map(
      (colorName, i) => (
        <div
          onClick={event => this.onClick(event, colorName)}
          className={'swatch'}
          key={i}>
          <div
            className={
              aoStore.hashMap.get(this.props.taskId).color === colorName
                ? 'border selected'
                : 'border'
            }>
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
