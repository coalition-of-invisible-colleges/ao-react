import React from 'react'
import { computed } from 'mobx'
import { observer } from 'mobx-react'
import aoStore from '../client/store'

interface UnreadProps {
  taskId: string
}

@observer
export default class AoUnread extends React.PureComponent<UnreadProps> {
  @computed
  get seen() {
    const card = aoStore.hashMap.get(this.props.taskId)
    return aoStore.state.tasks.filter(
      t => t.deck.indexOf(aoStore.member.memberId) !== -1
    )
  }

  render() {
    const card = aoStore.hashMap.get(this.props.taskId)

    if (
      !card.seen ||
      (card.seen &&
        card.seen.some(t => {
          return t.memberId === aoStore.member.memberId
        }))
    ) {
      return ''
    }
    return <div className={'unread'} />
  }
}
