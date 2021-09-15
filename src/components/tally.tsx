import React from 'react'
import { computed, makeObservable } from 'mobx';
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'
import { HudStyle } from './cardHud'
import AoMemberIcon from './memberIcon'
import One from '../assets/images/one.svg'
import Five from '../assets/images/five.svg'
import AoCheckmark from './checkmark'
import uuidV1 from 'uuid/v1'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'

interface Props {
  taskId: string
  hudStyle: HudStyle
}

@observer
export default class AoTally extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    makeObservable(this);
  }

  @computed get tally() {
    const card = aoStore.hashMap.get(this.props.taskId)
    if (!card) return undefined
    return card.claimed.length
  }

  @computed get renderTallyMarks() {
    const fives = Math.floor(this.tally / 5)
    const ones = Math.floor(this.tally % 5)

    let render = []
    for (let i = 0; i < fives; i++) {
      render.push(<img src={Five} key={uuidV1()} />)
    }
    for (let i = 0; i < ones; i++) {
      render.push(<img src={One} key={uuidV1()} />)
    }

    return render
  }

  @computed get renderClaimsList() {
    const taskId = this.props.taskId
    const card = aoStore.hashMap.get(taskId)
    if (!card) {
      return null
    }

    const renderedClaims = card.claimed.map(mId => {
      const member = aoStore.memberById.get(mId)
      const name = member ? member.name : 'deleted member'
      return (
        <div key={mId + '-claimed-' + this.props.taskId}>
          <AoCheckmark />
          <AoMemberIcon memberId={mId} /> {name}{' '}
        </div>
      )
    })

    if (renderedClaims.length <= 0) {
      return 'No claims'
    }

    return (
      <div className="infoTooltip">
        <h4>Completed By</h4>
        {renderedClaims}
      </div>
    )
  }

  render() {
    const taskId = this.props.taskId
    const card = aoStore.hashMap.get(taskId)
    if (!card) return null

    switch (this.props.hudStyle) {
      default:
        if (this.tally >= 1) {
          return (
            <Tippy
              zIndex={4}
              theme={'translucent'}
              content={this.renderClaimsList}
              delay={[625, 200]}>
              <div className="tally">{this.renderTallyMarks}</div>
            </Tippy>
          )
        }
    }

    return null
  }
}
