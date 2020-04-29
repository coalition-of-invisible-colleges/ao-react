import React, { FunctionComponent } from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import { useParams } from 'react-router-dom'
import api from '../client/api'
import Completed from '../assets/images/completed.svg'
import Uncompleted from '../assets/images/uncompleted.svg'

interface AoCheckboxProps {
  taskId: string
}

const AoCheckbox: FunctionComponent<AoCheckboxProps> = observer(
  ({ taskId }) => {
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
      <div className="checkbox" onClick={onClick}>
        <img src={computed.isCompleted ? Completed : Uncompleted} />
      </div>
    )
  }
)

export default AoCheckbox
