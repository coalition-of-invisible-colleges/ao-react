import React, { FunctionComponent } from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import { useParams } from 'react-router-dom'
import api from '../client/api'

interface AoBoatParams {
  inId: string
  taskId: string
}

const AoBoat: FunctionComponent<AoBoatParams> = observer(({ taskId, inId }) => {
  console.log('boat!', taskId, aoStore.hashMap.get(taskId))
  const onClick = () => {
    api.prioritizeCard(taskId, inId)
  }
  return (
    <img
      className="boat"
      src="../assets/images/boat.svg"
      onClick={onClick}
      draggable={false}
    />
  )
})

export default AoBoat
