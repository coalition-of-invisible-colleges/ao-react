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
  startTime?: Date
}

export const defaultState: State = {
  editing: false,
  startTime: undefined
}

interface CountdownParams {
  taskId: string
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
  CountdownParams,
  State
> {
  constructor(props) {
    super(props)
    this.state = defaultState
    this.startEditing = this.startEditing.bind(this)
    this.onChange = this.onChange.bind(this)
    this.bookResource = this.bookResource.bind(this)
    console.log('AoCountdown!')
  }

  startEditing(event) {
    console.log(
      'countdown value is ',
      aoStore.hashMap.get(this.props.taskId).book.startTs
    )
    if (aoStore.hashMap.get(this.props.taskId).book.startTs) {
      console.log('has a value')
      this.setState({
        startTime: aoStore.hashMap.get(this.props.taskId).book.startTs
      })
    }
    this.setState({ editing: true })
  }

  onChange(date) {
    console.log('onChange date is ', date)
    this.setState({ startTime: date })
  }

  bookResource() {
    console.log('book resource', this.state.startTime)
    let newStartTime: Date = this.state.startTime
      ? this.state.startTime
      : undefined
    if (newStartTime) {
      let newEndTime: Date = new Date(newStartTime)
      newEndTime.setDate(newEndTime.getDate() + 3)
      api.bookResource(
        this.props.taskId,
        newStartTime.getTime(),
        newEndTime.getTime()
      )
      this.setState({ editing: false })
    }
  }

  render() {
    console.log('render main grid')
    if (this.state.editing) {
      return (
        <div className="countdown">
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
    return (
      <div className="countdown">
        <button type="button" onClick={this.startEditing}>
          {aoStore.hashMap.get(this.props.taskId).book.startTs
            ? formatDistanceToNow(
                aoStore.hashMap.get(this.props.taskId).book.startTs
              )
            : 'Schedule'}
        </button>
      </div>
    )
  }
}
