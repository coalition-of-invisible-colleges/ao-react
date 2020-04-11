import * as React from 'react'
import { useState } from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'

const Members: React.FunctionComponent<{}> = observer(({}) => {
  const [newMember, setNewMember] = useState('')
  const onChange = e => setNewMember(e.target.value)
  const onClick = e => api.createMember(newMember)
  return (
    <div>
      <div>
        {aoStore.state.members.map((val, i) => (
          <div key={i}>{val.name}</div>
        ))}
      </div>
      <div>
        Add Member
        <input type="text" value={newMember} onChange={onChange} />
        <button type="button" onClick={onClick}>
          Add Member
        </button>
      </div>
    </div>
  )
})

export default Members
