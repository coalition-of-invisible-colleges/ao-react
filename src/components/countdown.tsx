import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { formatDistanceToNow, format } from 'date-fns'
import { HudStyle } from './cardHud'
import Timecube from '../assets/images/timecube.svg'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'

interface State {
  editing: boolean
  startTime?: Date
}

export const defaultState: State = {
  editing: false,
  startTime: undefined,
}

interface CountdownProps {
  taskId: string
  hudStyle: HudStyle
}

interface DatePickerProps {
  startTime: Date
  onChange: (event: Date) => void
}

@observer
class RenderDatePicker extends React.PureComponent<DatePickerProps> {
  render() {
    return (
      <DatePicker
        selected={this.props.startTime}
        onChange={date => this.props.onChange(date)}
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
}

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
    this.renderCountdown = this.renderCountdown.bind(this)
  }

  startEditing(event) {
    const card = aoStore.hashMap.get(this.props.taskId)
    if (!card) return null

    if (card.book.startTs) {
      let newStartTime: Date = new Date(0)
      newStartTime.setUTCMilliseconds(card.book.startTs)
      this.setState({
        startTime: newStartTime,
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

  renderCountdown() {
    const card = aoStore.hashMap.get(this.props.taskId)
    if (!card) return null

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
      default:
        return (
          <div className={'countdown summary ' + this.props.hudStyle}>
            {formatDistanceToNow(card.book.startTs, { addSuffix: true })}
          </div>
        )
    }
  }

  render() {
    const card = aoStore.hashMap.get(this.props.taskId)
    if (!card) return null
    
    if(this.props.hudStyle === 'badge' && card.book.startTs) {
      return this.renderCountdown()
    }

    if (this.state.editing || this.props.hudStyle === 'menu') {
      return (
        <div className="countdown">
          <RenderDatePicker
            startTime={this.state.startTime}
            onChange={this.onChange}
          />
          <button type="button" onClick={this.bookResource}>
            Schedule
          </button>
        </div>
      )
    }

    if (!card.book.startTs) {
      return null
    }

    return (
      <Tippy
        placement="top"
        delay={[475, 200]}
        theme="translucent"
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
