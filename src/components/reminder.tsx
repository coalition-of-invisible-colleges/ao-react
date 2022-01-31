import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore, { Task } from '../client/store'
import api from '../client/api'
import Gift from '../assets/images/gift.svg'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'

interface Props {
  memberCard: Task
}

export default function AoReminder(props: Props) {
  const [reminded, setReminded] = React.useState(false)
   
  const remindMember = (event) => {
    console.log("Reminder!")
    event.stopPropagation()
    api.remindMember(props.memberCard.taskId)
    setReminded(true)
  }
  const giftCount = props.memberCard.giftCount
  
  if(!giftCount || giftCount < 1) {
    return null
  }
  
  return <Tippy
    zIndex={4}
    theme="translucent"
    content={
      <span>
        <p>
          This member has {giftCount} unopened gift{giftCount > 1 && 's'}.
        </p>
        <p>
          <small>{ reminded ? "You have already sent a reminder to this member." : "Click to send this member a Signal reminder to check their gifts."}</small>
        </p>
      </span>
    }
    delay={[625, 200]}
    placement="right">
      <div className={'giftReminder' + (reminded ? ' disabled' : '')}>
      <img src={Gift} onClick={!reminded ? remindMember : undefined} />
      <span>{props.memberCard.giftCount}</span>
    </div>
  </Tippy>
  
}