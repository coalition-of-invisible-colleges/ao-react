import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import AoContextCard from './contextCard'

const timeRange = 1000 * 60 * 60 * 24 * 3

export default function AoEventReminders() {
  const now = Date.now()
  
  const impendingEvents = aoStore.state.tasks.filter(task => {

    if(!task.deck.includes(aoStore.member.memberId)) {

      return false
    }
    
    if(!task.book || !task.book.hasOwnProperty('startTs') || task.book.startTs < 1) {

      return false
    }
    
    const msUntilEvent = task.book.startTs - now
    if(msUntilEvent > timeRange) {

      return false
    }
    
    if(msUntilEvent < 0 && task.claimed.indexOf(aoStore.member.memberId) >= 0) {

      return false
    }
    
    return true
  })
  
  impendingEvents.sort((taskA, taskB) => taskA.book.startTs - taskB.book.startTs)
  const renderedEvents = impendingEvents.map(task => <AoContextCard task={task} cardStyle='notification' />)
  
  return <div className="eventReminders">
          {renderedEvents}
        </div>
}