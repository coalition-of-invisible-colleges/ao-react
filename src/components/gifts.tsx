import * as React from 'react'
import { computed } from 'mobx'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import AoStack from './stack'
import AoPopupPanel from './popupPanel'
import Gift from '../assets/images/gifts.svg'

@observer
export default class AoGifts extends React.PureComponent {
  constructor(props) {
    super(props)
  }

  @computed get myGifts() {
    return aoStore.state.tasks.filter(task => {
      return task.passed.some(pass => pass[1] === aoStore.member.memberId)
    })
  }

  @computed get renderGiftsList() {
    if (this.myGifts.length < 1) {
      return ''
    }

    return (
      <div className="results">
        <AoStack
          cards={this.myGifts}
          zone="gifts"
          cardStyle="face"
          alwaysShowAll={true}
        />
      </div>
    )
  }

  render() {
    if (this.myGifts.length < 1) {
      return null
    }
    const renderedBadge = <React.Fragment>{this.myGifts.length}</React.Fragment>

    return (
      <div id="gifts">
        <AoPopupPanel
          iconSrc={Gift}
          tooltipText="Gifts"
          badge={renderedBadge}
          tooltipPlacement="right"
          panelPlacement="right">
          <React.Fragment>
            <h2>Gifts</h2>
            <div
              style={{
                textAlign: 'center',
                position: 'relative',
                top: '-0.5em'
              }}>
              <small>Cards passed to you</small>
            </div>
            {this.renderGiftsList}
          </React.Fragment>
        </AoPopupPanel>
      </div>
    )
  }
}
