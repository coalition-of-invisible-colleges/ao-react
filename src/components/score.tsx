import React from 'react'
import { computed } from 'mobx'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import AoStack from './stack'
import LazyTippy from './lazyTippy'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'

interface ScoreProps {
  memberId?: string
  prefix?: JSX.Element
}

@observer
export default class AoScore extends React.PureComponent<ScoreProps> {
  constructor(props) {
    super(props)
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
  get checkedCards() {
    return aoStore.myCards.filter(t => {
      if (!t.claimed.some(c => c.indexOf(this.memberId) >= 0)) {
        return false
      }

      if (!t.hasOwnProperty('completeValue') || t.completeValue <= 0) {
        return false
      }
      return true
    })
  }

  @computed
  get pointsFromCards() {
    let points = 0
    this.checkedCards.forEach(t => {
      points += t.completeValue
    })
    return points
  }

  render() {
    if (this.pointsFromCards <= 0) {
      return null
    }

    return (
      <LazyTippy
        interactive={true}
        placement={'top'}
        delay={[625, 200]}
        theme={
          this.checkedCards.length < 1 && this.isMe ? 'translucent' : undefined
        }
        content={
          <React.Fragment>
            <h3>Points From Cards</h3>
            {this.checkedCards.length >= 1 ? (
              <AoStack
                cardStyle={'priority'}
                cards={this.checkedCards}
                zone={'panel'}
              />
            ) : (
              <p>
                {this.isMe
                  ? 'You have no points from cards. Check off a card with a valued checkmark to increase your score.'
                  : 'This member has no points from cards.'}
              </p>
            )}
          </React.Fragment>
        }>
        <div className="score">
          {this.props.prefix}
          {this.pointsFromCards}
        </div>
      </LazyTippy>
    )
  }
}
