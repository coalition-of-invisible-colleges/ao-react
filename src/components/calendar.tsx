import React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import { Task } from '../interfaces'
import AoStack from './stack'
import AoPopupPanel from './popupPanel'
import { formatDistanceToNow } from 'date-fns'

@observer
export default class AoCalendar extends React.Component {
  render() {
    let {
      now,
      today,
      tomorrow,
      thisWeek,
      nextWeek,
      thisMonth,
      nextMonth,
      thisYear,
      eventually,
      past,
      overdue,
    } = aoStore.eventsAsAgenda

    let renderedCalendarList

    if (
      overdue.length +
        now.length +
        today.length +
        tomorrow.length +
        thisWeek.length +
        nextWeek.length +
        thisMonth.length +
        nextMonth.length +
        thisYear.length +
        eventually.length <
      1
    ) {
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
          {overdue.length >= 1 ? <h2>Overdue</h2> : ''}
          <AoStack
            cards={overdue}
            cardStyle={'priority'}
            alwaysShowAll={true}
          />
          {now.length >= 1 ? <h2>Now</h2> : ''}
          <AoStack cards={now} cardStyle={'priority'} alwaysShowAll={true} />
          {today.length >= 1 ? <h2>Today</h2> : ''}
          <AoStack cards={today} cardStyle={'priority'} alwaysShowAll={true} />
          {tomorrow.length >= 1 ? <h2>Tomorrow</h2> : ''}
          <AoStack
            cards={tomorrow}
            cardStyle={'priority'}
            alwaysShowAll={true}
          />
          {thisWeek.length >= 1 ? <h2>This Week</h2> : ''}
          <AoStack
            cards={thisWeek}
            cardStyle={'priority'}
            alwaysShowAll={true}
          />
          {nextWeek.length >= 1 ? <h2>Next Week</h2> : ''}
          <AoStack
            cards={nextWeek}
            cardStyle={'priority'}
            alwaysShowAll={false}
          />
          <div className={'tail'}>
            <AoStack
              cards={thisMonth}
              cardStyle={'priority'}
              alwaysShowAll={false}
              descriptor={{ singular: 'This Month', plural: 'This Month' }}
              noFirstCard={true}
            />
            <AoStack
              cards={nextMonth}
              cardStyle={'priority'}
              alwaysShowAll={false}
              descriptor={{ singular: 'Next Month', plural: 'Next Month' }}
              noFirstCard={true}
            />
            <AoStack
              cards={thisYear}
              cardStyle={'priority'}
              alwaysShowAll={false}
              descriptor={{ singular: 'This Year', plural: 'This Year' }}
              noFirstCard={true}
            />
            <AoStack
              cards={eventually}
              cardStyle={'priority'}
              alwaysShowAll={false}
              descriptor={{ singular: 'Eventually', plural: 'Eventually' }}
            />
            <AoStack
              cards={past}
              cardStyle={'priority'}
              descriptor={{ singular: 'past event', plural: 'past events' }}
              noFirstCard={true}
            />
          </div>
        </div>
      )
    }

    const nowPlusSoon = overdue.concat(now, today)
    const renderedBadge =
      nowPlusSoon.length >= 1 ? (
        <React.Fragment>
          {overdue.length >= 1 ? overdue.length : nowPlusSoon.length.toString()}
          <div style={{ fontSize: '0.75em' }}>
            {overdue.length >= 1
              ? 'overdue'
              : formatDistanceToNow(nowPlusSoon[0].book.startTs, {
                  addSuffix: true,
                })}
          </div>
        </React.Fragment>
      ) : undefined

    return (
      <div id="calendar">
        <h2>Calendar</h2>
        {renderedCalendarList}
      </div>
    )
  }
}
