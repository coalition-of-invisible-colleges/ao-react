import React, { FunctionComponent } from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore from '../client/store'

const AoScore: FunctionComponent<> = observer(() => {
  const computed = observable({
    get pointsFromCards() {
      let points = 0
      aoStore.state.tasks.forEach(t => {
        if (t.deck.indexOf(aoStore.member.memberId) === -1) {
          return
        }
        if (
          t.claimed.some(c => {
            return c.indexOf(aoStore.member.memberId) >= 0
          })
        ) {
          if (t.completeValue && t.completeValue > 0) {
            points += t.completeValue
          }
        }
      })
      return points
    }
  })

  return (
    <div id={'score'}>
      <div>{computed.pointsFromCards}</div>
    </div>
  )
})

export default AoScore
