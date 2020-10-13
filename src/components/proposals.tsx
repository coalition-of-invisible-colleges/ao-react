import * as React from 'react'
import { computed } from 'mobx'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import AoStack from './stack'
import { countCurrentSignatures } from '../cards'
import AoPopupPanel from './popupPanel'
import AoTip from './tip'
import Scroll from '../assets/images/scroll.svg'

@observer
export default class AoProposals extends React.PureComponent {
  constructor(props) {
    super(props)
  }

  @computed get proposals() {
    return aoStore.state.tasks
      .filter(task => {
        return (
          task.hasOwnProperty('signed') &&
          task.signed.some(signature => signature.opinion >= 1)
        )
      })
      .sort(
        (a, b) =>
          countCurrentSignatures(a.signed) - countCurrentSignatures(b.signed)
      )
  }

  @computed get renderProposalsList() {
    if (this.proposals.length < 1) {
      return ''
    }

    return (
      <div className="results">
        <AoStack
          cards={this.proposals}
          zone="panel"
          cardStyle="face"
          alwaysShowAll={true}
        />
      </div>
    )
  }

  render() {
    if (this.proposals.length < 1) {
      return null
    }
    const renderedBadge = (
      <React.Fragment>{this.proposals.length}</React.Fragment>
    )

    return (
      <div id="proposals">
        <AoPopupPanel
          iconSrc={Scroll}
          tooltipText="Proposals"
          badge={renderedBadge}
          tooltipPlacement="right"
          panelPlacement="right">
          <React.Fragment>
            <h2>Proposals</h2>
            <div
              style={{
                textAlign: 'center',
                position: 'relative',
                top: '-0.5em'
              }}>
              <small>
                Sign cards to pin them here.{' '}
                <AoTip text="To sign a card, hover over its moon, then click 'sign' next to your name in the list. This is the official pinned bulletin for this server, for posting proposals, propositions, motions, announcements, rules, guidelines, policies, rulings, etc." />
              </small>
            </div>
            {this.renderProposalsList}
          </React.Fragment>
        </AoPopupPanel>
      </div>
    )
  }
}
