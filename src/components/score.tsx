import React from 'react'
import { computed, makeObservable } from 'mobx';
import { observer } from 'mobx-react'
import aoStore from '../client/store'

interface ScoreProps {
  memberId?: string
  prefix?: JSX.Element
}

@observer
export default class AoScore extends React.PureComponent<ScoreProps> {
  constructor(props) {
    super(props)
    makeObservable(this);
  }

  @computed get memberId() {
    if (this.props.memberId === undefined) {
      return aoStore.member.memberId
    }
    return this.props.memberId
  }

  @computed get isMe() {
    return this.memberId === aoStore.member.memberId
  }

  @computed
  get points() {
    if (!this.props.memberId) {
      return aoStore.memberCard.boost
    }
    const memberCard = aoStore.memberCard
    if (!memberCard) return null
    return memberCard.boost
  }

  render() {
    if (this.points <= 0) {
      return null
    }

    return (
      <div className="score">
        {this.props.prefix}
        {this.points}
      </div>
    )
  }
}
