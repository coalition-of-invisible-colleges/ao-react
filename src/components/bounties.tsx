import * as React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import AoStack from './stack'
import AoPopupPanel from './popupPanel'
import AoTip from './tip'
import { gloss } from '../semantics'

@observer
export default class AoBounties extends React.Component {
  constructor(props) {
    super(props)
    makeObservable(this)
  }

  @computed get bounties() {
    return aoStore.state.tasks
      .filter(task => {
        return (
          task.hasOwnProperty('boost') &&
          task.boost > 0 &&
          task.name !== task.taskId
        )
      })
      .sort((a, b) => a.boost - b.boost)
  }

  @computed get renderBountiesList() {
    if (this.bounties.length < 1) {
      return ''
    }

    return (
      <div className="results">
        <AoStack
          cards={this.bounties}
          zone="panel"
          cardStyle="face"
          alwaysShowAll={false}
          cardsBeforeFold={1}
        />
      </div>
    )
  }

  render() {
    if (this.bounties.length < 1) {
      return null
    }

    return (
      <div id="bounties">
        <h2>Bounties</h2>
        <div
          style={{
            textAlign: 'center',
            position: 'relative',
            top: '-0.5em',
          }}>
          <small>
            Earn points by completing tasks.{' '}
            <AoTip
              text={`Cards can be given one-time or recurring bounties. One-time bounties (aka 'bonus points') can be assigned from a ${gloss(
                'guild'
              )} card with points. To add points to a ${gloss(
                'guild'
              )} card, click 'Add points' in its menu. To set a recurring bounty, choose 'Set checkmark value' from the card's menu.`}
            />
          </small>
        </div>
        {this.renderBountiesList}
      </div>
    )
  }
}
