import React from 'react'
import { computed } from 'mobx'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import AoStack from './stack'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'

@observer
export default class AoScore extends React.PureComponent {
  @computed
  get myCards() {
    return aoStore.state.tasks.filter(
      t => t.deck.indexOf(aoStore.member.memberId) !== -1
    )
  }

  @computed
  get checkedCards() {
    return this.myCards.filter(t => {
      if (!t.claimed.some(c => c.indexOf(aoStore.member.memberId) >= 0)) {
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
    return (
      <Tippy
        interactive={true}
        placement={'top'}
        delay={[625, 200]}
        content={
          <React.Fragment>
            <h2>Points From Cards</h2>
            {this.checkedCards.length >= 1 ? (
              <AoStack
                cardStyle={'priority'}
                cards={this.checkedCards}
                zone={'panel'}
              />
            ) : (
              <p>
                You have no points from cards. Check off a card with a valued
                checkmark to increase your score.
              </p>
            )}
          </React.Fragment>
        }>
        <div id={'score'}>
          <div>Score: {this.pointsFromCards}</div>
        </div>
      </Tippy>
    )
  }
}
