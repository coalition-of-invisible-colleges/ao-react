import React, { FunctionComponent } from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import { useParams } from 'react-router-dom'
import api from '../client/api'
import Completed from '../assets/images/completed.svg'
import Uncompleted from '../assets/images/uncompleted.svg'
interface AoCheckboxParams {
  taskId: string
}

const AoCheckbox: FunctionComponent<AoCheckboxParams> = observer(
  ({ taskId }) => {
    console.log('checkbox!', taskId, aoStore.hashMap.get(taskId))
    const computed = observable({
      get isCompleted() {
        return (
          aoStore.hashMap
            .get(taskId)
            .claimed.indexOf(aoStore.member.memberId) >= 0
        )
      }
    })
    const onClick = () => {
      if (computed.isCompleted) {
        api.uncheckCard(taskId)
      } else {
        api.completeCard(taskId)
      }
    }
    return (
      <img
        className="checkbox"
        src={computed.isCompleted ? Completed : Uncompleted}
        onClick={onClick}
      />
    )
  }
)

export default AoCheckbox
