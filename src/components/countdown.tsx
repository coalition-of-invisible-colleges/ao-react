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
import { formatDistanceToNow, fromUnixTime, format } from 'date-fns'
import { HudStyle } from './cardHud'

interface State {
  editing: boolean
  startTime?: Date
}

export const defaultState: State = {
  editing: false,
  startTime: undefined
}

interface CountdownProps {
  taskId: string
  hudStyle: HudStyle
}

interface DatePickerParams {
  startTime: Date
  bookResource: (event: Date) => void
  onChange: (event: Date) => void
}

const RenderDatePicker: React.FunctionComponent<DatePickerParams> = observer(
  ({ bookResource, startTime, onChange }) => {
    return (
      <DatePicker
        selected={startTime}
        onChange={date => onChange(date)}
        showTimeSelect
        timeFormat="HH:mm"
        timeIntervals={15}
        timeCaption="time"
        dateFormat="MMMM d, yyyy h:mm aa"
        todayButton="Today"
        placeholderText="set date &amp; time"
      />
    )
  }
)

@observer
export default class AoCountdown extends React.Component<
  CountdownProps,
  State
> {
  constructor(props) {
    super(props)
    this.state = defaultState
    this.startEditing = this.startEditing.bind(this)
    this.onChange = this.onChange.bind(this)
    this.bookResource = this.bookResource.bind(this)
  }

  startEditing(event) {
    if (aoStore.hashMap.get(this.props.taskId).book.startTs) {
      let newStartTime: Date = new Date(0)
      newStartTime.setUTCMilliseconds(
        aoStore.hashMap.get(this.props.taskId).book.startTs
      )
      this.setState({
        startTime: newStartTime
      })
    }
    this.setState({ editing: true })
  }

  onChange(date) {
    let newStartTime: Date = new Date(0)
    newStartTime.setUTCMilliseconds(date)

    this.setState({ startTime: newStartTime })
  }

  bookResource() {
    if (this.state.startTime) {
      let newEndTime: Date = new Date(this.state.startTime)
      newEndTime.setDate(newEndTime.getDate() + 3)
      api.bookResource(
        this.props.taskId,
        this.state.startTime.getTime(),
        newEndTime.getTime()
      )
      this.setState({ editing: false })
    }
  }

  render() {
    if (this.state.editing) {
      return (
        <div className={'countdown'}>
          <RenderDatePicker
            bookResource={this.bookResource}
            startTime={this.state.startTime}
            onChange={this.onChange}
          />
          <button type="button" onClick={this.bookResource}>
            Schedule
          </button>
        </div>
      )
    }

    if (
      !aoStore.hashMap.get(this.props.taskId).book.startTs &&
      this.props.hudStyle !== 'menu'
    ) {
      return null
    }

    switch (this.props.hudStyle) {
      case 'full before':
        return (
          <div
            onClick={this.startEditing}
            className={'countdown action ' + this.props.hudStyle}>
            {formatDistanceToNow(
              aoStore.hashMap.get(this.props.taskId).book.startTs,
              { addSuffix: true }
            )}
          </div>
        )
      case 'face before':
      case 'collapsed':
      case 'mini after':
        return (
          <div className={'countdown summary ' + this.props.hudStyle}>
            {formatDistanceToNow(
              aoStore.hashMap.get(this.props.taskId).book.startTs,
              { addSuffix: true }
            )}
          </div>
        )
      case 'menu':
        return (
          <div
            onClick={this.startEditing}
            className={'countdown action ' + this.props.hudStyle}>
            {aoStore.hashMap.get(this.props.taskId).book.startTs
              ? format(
                  aoStore.hashMap.get(this.props.taskId).book.startTs,
                  'MMMM d, yyyy @ h:mm a'
                )
              : 'schedule event'}
          </div>
        )
      default:
        return null
    }
  }
}
