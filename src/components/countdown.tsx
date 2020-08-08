import * as React from 'react'
import { useState } from 'react'
import { observer } from 'mobx-react'
import { Redirect } from 'react-router-dom'
import aoStore, { Task } from '../client/store'
import { TaskContext } from './taskContext'
import api from '../client/api'
import { ObservableMap } from 'mobx'
import { delay, cancelablePromise, noop } from '../utils'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { formatDistanceToNow, fromUnixTime, format } from 'date-fns'
import { HudStyle } from './cardHud'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'

interface State {
  editing: boolean
  startTime?: Date
}

export const defaultState: State = {
  editing: false,
  startTime: undefined
}

interface CountdownProps {
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
  static contextType = TaskContext

  constructor(props) {
    super(props)
    this.state = defaultState
    this.startEditing = this.startEditing.bind(this)
    this.onChange = this.onChange.bind(this)
    this.bookResource = this.bookResource.bind(this)
    this.renderCountdown = this.renderCountdown.bind(this)
  }

  startEditing(event) {
    const card = this.context

    if (card.book.startTs) {
      let newStartTime: Date = new Date(0)
      newStartTime.setUTCMilliseconds(card.book.startTs)
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
    const card = this.context
    if (this.state.startTime) {
      let newEndTime: Date = new Date(this.state.startTime)
      newEndTime.setDate(newEndTime.getDate() + 3)
      api.bookResource(
        card.taskId,
        this.state.startTime.getTime(),
        newEndTime.getTime()
      )
      this.setState({ editing: false })
    }
  }

  renderCountdown() {
    const card = this.context

    switch (this.props.hudStyle) {
      case 'full before':
        return (
          <div
            onClick={this.startEditing}
            className={'countdown action ' + this.props.hudStyle}>
            {formatDistanceToNow(card.book.startTs, { addSuffix: true })}
          </div>
        )
      case 'face before':
      case 'collapsed':
      case 'mini after':
        return (
          <div className={'countdown summary ' + this.props.hudStyle}>
            {formatDistanceToNow(card.book.startTs, { addSuffix: true })}
          </div>
        )
      default:
        return null
    }
  }

  render() {
    const card = this.context

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

    if (this.props.hudStyle === 'menu') {
      return (
        <div
          onClick={this.startEditing}
          className={'countdown action ' + this.props.hudStyle}>
          {card.book.startTs
            ? format(card.book.startTs, 'MMMM d, yyyy @ h:mm a')
            : 'schedule event'}
        </div>
      )
    }

    if (!card.book.startTs) {
      return null
    }

    return (
      <Tippy
        interactive={true}
        placement={'top'}
        delay={[475, 200]}
        theme={'translucent'}
        appendTo={document.getElementById('root')}
        content={
          <div style={{ width: 'max-content' }}>
            {format(card.book.startTs, 'MMMM d, yyyy @ h:mm a')}
          </div>
        }>
        {this.renderCountdown()}
      </Tippy>
    )
  }
}
