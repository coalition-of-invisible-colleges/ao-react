import React, { FunctionComponent } from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import { useParams } from 'react-router-dom'
import api from '../client/api'

interface AoCoinParams {
  taskId: string
}

const AoCoin: FunctionComponent<AoCoinParams> = observer(({ taskId }) => {
  console.log('coin!', taskId, aoStore.hashMap.get(taskId))
  const computed = observable({
    get isGrabbed() {
      return (
        aoStore.hashMap.get(taskId).deck.indexOf(aoStore.member.memberId) >= 0
      )
    },
    get hodlCount() {
      return aoStore.hashMap.get(taskId).deck.length
    }
  })
  const onClick = () => {
    if (computed.isGrabbed) {
      api.dropCard(taskId)
    } else {
      api.grabCard(taskId)
    }
  }
  return (
    <div className={computed.isGrabbed ? 'coin' : 'coin ungrabbed'}>
      <img
        src="../assets/images/coin.svg"
        onClick={onClick}
        draggable={false}
      />
      <div className="hodls">{computed.hodlCount}</div>
    </div>
  )
})

export default AoCoin
