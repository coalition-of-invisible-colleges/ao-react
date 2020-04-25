import React, { FunctionComponent } from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import { useParams } from 'react-router-dom'
import api from '../client/api'

interface AoPaperParams {
  taskId: string
}

const AoPaper: FunctionComponent<AoPaperParams> = observer(({ taskId }) => {
  const computed = observable({
    get cardColor() {
      const color = aoStore.hashMap.get(taskId).color
      switch (color) {
        case 'red':
        case 'yellow':
        case 'green':
        case 'blue':
        case 'purple':
        case 'black':
          return color
        default:
          return ''
      }
    },
    get cardAge() {
      const now = Date.now()
      const msSince = now - aoStore.hashMap.get(taskId).timestamp
      console.log('timestamp is ', aoStore.hashMap.get(taskId).timestamp)
      const days = msSince / (1000 * 60 * 60 * 24)
      return days
    }
  })
  let filename = 'paper_1.jpg'
  console.log('computed.cardAge is ', computed.cardAge)
  if (computed.cardAge >= 8) {
    filename = 'paper_2.png'
  } else if (computed.cardAge >= 30) {
    filename = 'paper_3.png'
  } else if (computed.cardAge >= 90) {
    filename = 'paper_4.png'
  }
  return (
    <div className={'paper'}>
      <img src={'../assets/images/' + filename} />
      <div className={'color ' + computed.cardColor} />
    </div>
  )
})

export default AoPaper
