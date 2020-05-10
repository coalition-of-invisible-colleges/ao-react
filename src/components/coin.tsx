import React, { FunctionComponent } from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import { useParams } from 'react-router-dom'
import api from '../client/api'
import Coin from '../assets/images/coin.svg'

interface AoCoinParams {
  taskId: string
}

const AoCoin: FunctionComponent<AoCoinParams> = observer(({ taskId }) => {
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
  const onClick = event => {
    event.stopPropagation()
    if (computed.isGrabbed) {
      api.dropCard(taskId)
    } else {
      api.grabCard(taskId)
    }
  }
  return (
    <div className={computed.isGrabbed ? 'coin' : 'coin ungrabbed'}>
      <img src={Coin} onClick={onClick} draggable={false} />
      {computed.hodlCount >= 2 ? (
        <div className="hodls">{computed.hodlCount}</div>
      ) : (
        ''
      )}
    </div>
  )
})

export default AoCoin
