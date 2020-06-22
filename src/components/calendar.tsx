import * as React from 'react'
import { observer } from 'mobx-react'
import { Redirect } from 'react-router-dom'
import aoStore, { AoState, Task } from '../client/store'
import api from '../client/api'
import { ObservableMap } from 'mobx'
import { delay, cancelablePromise, noop } from '../utils'
import AoSmartZone, { Sel } from './smartZone'
import Calendar from '../assets/images/calendar.svg'

interface State {
  calendarPanel: boolean
  page: number
  redirect?: string
}

export const defaultState: State = {
  calendarPanel: false,
  page: 0,
  redirect: undefined
}

@observer
export default class AoCalendar extends React.Component<{}, State> {
  constructor(props) {
    super(props)
    this.state = defaultState
    this.toggleCalendarPanel = this.toggleCalendarPanel.bind(this)
    this.renderCalendarButton = this.renderCalendarButton.bind(this)
    this.renderCalendarList = this.renderCalendarList.bind(this)
    this.goInResult = this.goInResult.bind(this)
  }

  toggleCalendarPanel() {
    this.setState({ calendarPanel: !this.state.calendarPanel })
  }

  goInResult(selection: Sel) {
    const trueY = aoStore.searchResults.length - selection.y - 1
    const taskId = aoStore.searchResults[trueY].taskId
    aoStore.addToContext([aoStore.currentCard])
    this.setState({
      redirect: '/task/' + taskId
    })
    this.setState({ calendarPanel: false })
  }

  renderCalendarButton() {
    return (
      <div onClick={this.toggleCalendarPanel} className={'actionCircle'}>
        <img src={Calendar} />
      </div>
    )
  }

  renderCalendarList() {
    const calendar = aoStore.state.tasks.filter(task => {
      return task.book.hasOwnProperty('startTs')
    })

    if (calendar.length < 1) {
      return ''
    }

    const results = calendar
      .slice()
      .reverse()
      .map((task, i) => (
        <AoSmartZone
          taskId={task.taskId}
          y={i}
          key={i}
          cardSource={'search'}
          onGoIn={this.goInResult}
        />
      ))

    return <div className={'results'}>{results}</div>
  }

  render() {
    if (this.state.redirect !== undefined) {
      this.setState({ redirect: undefined })
      return <Redirect to={this.state.redirect} />
    }

    if (!this.state.calendarPanel) {
      return <div id={'calendar'}>{this.renderCalendarButton()}</div>
    }

    return (
      <div id={'calendar'} className={'open'}>
        {this.renderCalendarButton()}
        {this.renderCalendarList()}
      </div>
    )
  }
}
