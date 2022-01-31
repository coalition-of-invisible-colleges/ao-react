import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import AoContextCard from './contextCard'

const timeRange = 1000 * 60 * 60 * 24 * 3

export default function AoEventReminders() {

const now = Date.now()

const impendingEvents = aoStore.state.tasks.filter(task => task.deck.includes(aoStore.member.memberId) && task.book && task.book.startTs >= 1 && (task.book.startTs - now <= timeRange) && task.claimed.indexOf(aoStore.member.memberId) === -1)
impendingEvents.sort((taskA, taskB) => taskA.book.startTs - taskB.book.startTs)
const renderedEvents = impendingEvents.map(task => <AoContextCard task={task} cardStyle='notification' />)

return <div className="eventReminders">
        {renderedEvents}
      </div>
}