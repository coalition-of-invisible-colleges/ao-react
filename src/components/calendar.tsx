import * as React from 'react'
import { observer } from 'mobx-react'
import { Redirect } from 'react-router-dom'
import aoStore, { AoState, Task } from '../client/store'
import api from '../client/api'
import { ObservableMap } from 'mobx'
import { delay, cancelablePromise, noop } from '../utils'
import AoStack from './stack'
import AoPopupPanel from './popupPanel'
import Timecube from '../assets/images/timecube.svg'
import { formatDistanceToNow } from 'date-fns'

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

  renderCalendarList() {}

  render() {
    if (this.state.redirect !== undefined) {
      this.setState({ redirect: undefined })
      return <Redirect to={this.state.redirect} />
    }

    let events = aoStore.state.tasks
      .filter(task => {
        return task.book.hasOwnProperty('startTs') && task.book.startTs > 0
      })
      .sort((a, b) => {
        return b.book.startTs - a.book.startTs
      })

    const soonMs = 64800000 // 18 hours
    const laterMs = 604800000 // 1 week
    const pastBufferMs = 3600000 // supposed to be 1 hour event length by default
    let eventually: Task[] = []

    const now = events.filter(task => {
      const timeToNow = task.book.startTs - Date.now()
      return timeToNow <= 0 && timeToNow > -pastBufferMs
    })

    const soon = events.filter(task => {
      const timeToNow = task.book.startTs - Date.now()
      return timeToNow <= soonMs && timeToNow > 0
    })

    const later = events.filter(task => {
      const timeToNow = task.book.startTs - Date.now()
      if (timeToNow > laterMs) {
        eventually.push(task)
        return false
      } else {
        return timeToNow <= laterMs && timeToNow > soonMs
      }
    })

    const past = events.filter(task => {
      return task.book.startTs - Date.now() < -pastBufferMs
    })

    past.reverse()

    let renderedCalendarList

    if (now.length + soon.length + later.length + eventually.length < 1) {
      renderedCalendarList = (
        <div className={'results'}>
          <div className={'results empty'}>
            There are no upcoming events. Click &#x22EE;&#8594;schedule event on
            a card to create an event.
          </div>
          {past.length >= 1 ? (
            <AoStack
              cards={past}
              cardStyle={'priority'}
              descriptor={{ singular: 'past event', plural: 'past events' }}
              noFirstCard={true}
            />
          ) : (
            ''
          )}
        </div>
      )
    } else {
      renderedCalendarList = (
        <div className={'results'}>
          {now.length >= 1 ? <h2>Now</h2> : ''}
          <AoStack cards={now} cardStyle={'priority'} alwaysShowAll={true} />
          {soon.length >= 1 ? <h2>Soon (&lt; 18 hrs)</h2> : ''}
          <AoStack cards={soon} cardStyle={'priority'} alwaysShowAll={true} />
          {later.length >= 1 ? <h2>Later (&lt; 1 wk)</h2> : ''}
          <AoStack cards={later} cardStyle={'priority'} alwaysShowAll={true} />
          {eventually.length >= 1 ? <h2>Eventually</h2> : ''}
          <AoStack
            cards={eventually}
            cardStyle={'priority'}
            alwaysShowAll={true}
          />
          <div style={{ height: '1em' }} />
          <AoStack
            cards={past}
            cardStyle={'priority'}
            descriptor={{ singular: 'past event', plural: 'past events' }}
            noFirstCard={true}
          />
        </div>
      )
    }

    const nowPlusSoon = now.concat(soon)
    const renderedBadge =
      nowPlusSoon.length >= 1 ? (
        <React.Fragment>
          {nowPlusSoon.length.toString()}
          <div style={{ fontSize: '0.75em' }}>
            {formatDistanceToNow(nowPlusSoon[0].book.startTs, {
              addSuffix: true
            })}
          </div>
        </React.Fragment>
      ) : (
        undefined
      )

    return (
      <div id={'calendar'}>
        <AoPopupPanel
          iconSrc={Timecube}
          tooltipText={'Calendar'}
          badge={renderedBadge}
          tooltipPlacement={'right'}
          panelPlacement={'right'}>
          {renderedCalendarList}
        </AoPopupPanel>
      </div>
    )
  }
}
