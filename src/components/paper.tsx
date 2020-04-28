import React, { FunctionComponent } from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import { useParams } from 'react-router-dom'
import api from '../client/api'
import Paper1 from '../assets/images/paper_1.svg'
import Paper2 from '../assets/images/paper_2.svg'
import Paper3 from '../assets/images/paper_3.svg'
import Paper4 from '../assets/images/paper_4.svg'

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
      // creation timestamp appears to have been removed from card creation.
      // this would need to be fixed for aging cards to work again.
      return false
      const now = Date.now()
      const msSince = now - aoStore.hashMap.get(taskId).timestamp
      // console.log('timestamp is ', aoStore.hashMap.get(taskId).timestamp)
      const days = msSince / (1000 * 60 * 60 * 24)
      return days
    }
  })
  let filename = Paper1
  // console.log('computed.cardAge is ', computed.cardAge)
  if (computed.cardAge >= 8) {
    filename = Paper2
  } else if (computed.cardAge >= 30) {
    filename = Paper3
  } else if (computed.cardAge >= 90) {
    filename = Paper4
  }
  return (
    <div className={'paper'}>
      <img src={filename} />
      <div className={'color ' + computed.cardColor} />
    </div>
  )
})

export default AoPaper
