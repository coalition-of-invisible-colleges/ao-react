import * as React from 'react'
import { observer } from 'mobx-react'
import { Redirect } from 'react-router-dom'
import aoStore, { AoState, Task } from '../client/store'
import api from '../client/api'
import { ObservableMap } from 'mobx'
import { delay, cancelablePromise, noop } from '../utils'
import Timecube from '../assets/images/timecube.svg'
import AoPopupPanel from './popupPanel'
import AoStack from './stack'

interface State {
  page: number
  redirect?: string
}

export const defaultState: State = {
  page: 0,
  redirect: undefined
}

@observer
export default class AoCalendar extends React.Component<{}, State> {
  constructor(props) {
    super(props)
    this.state = defaultState
    this.renderCalendarList = this.renderCalendarList.bind(this)
  }

  renderCalendarList() {
    let events = aoStore.state.tasks
      .filter(task => {
        return task.book.hasOwnProperty('startTs')
      })
      .sort((a, b) => {
        return a.book.startTs - b.book.startTs
      })

    if (events.length < 1) {
      return ''
    }

    return (
      <div className={'results'}>
        {' '}
        <AoStack cards={events} cardStyle={'priority'} alwaysShowAll={true} />
      </div>
    )
  }

  render() {
    if (this.state.redirect !== undefined) {
      this.setState({ redirect: undefined })
      return <Redirect to={this.state.redirect} />
    }

    return (
      <div id={'calendar'}>
        <AoPopupPanel
          iconSrc={Timecube}
          tooltipText={'Calendar'}
          tooltipPlacement={'right'}
          panelPlacement={'right'}>
          <h2>Upcoming Events</h2>
          {this.renderCalendarList()}
        </AoPopupPanel>
      </div>
    )
  }
}
