import * as React from 'react'
import { computed } from 'mobx'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import AoStack from './stack'
import AoPopupPanel from './popupPanel'
import AoTip from './tip'
import Chest from '../assets/images/chest.svg'

@observer
export default class AoBounties extends React.PureComponent {
  constructor(props) {
    super(props)
  }

  @computed get bounties() {
    return aoStore.state.tasks
      .filter(task => {
        return (
          ((task.hasOwnProperty('boost') && task.boost > 0) ||
            (task.hasOwnProperty('completeValue') && task.completeValue > 0)) &&
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
          cardsBeforeFold={3}
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
        <AoPopupPanel
          iconSrc={Chest}
          tooltipText="Bounties"
          tooltipPlacement="right"
          panelPlacement="right"
          id="tour-bounties">
          <React.Fragment>
            <h2>Bounties</h2>
            <div
              style={{
                textAlign: 'center',
                position: 'relative',
                top: '-0.5em'
              }}>
              <small>
                Earn points by completing tasks.{' '}
                <AoTip text="Cards can be given one-time or recurring bounties. One-time bounties (aka 'bonus points') can be assigned from a mission card with points. To add points to a mission card, click 'Add points' in its menu. To set a recurring bounty, choose 'Set checkmark value' from the card's menu." />
              </small>
            </div>
            {this.renderBountiesList}
          </React.Fragment>
        </AoPopupPanel>
      </div>
    )
  }
}
