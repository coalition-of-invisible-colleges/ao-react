import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import AoStack from './stack'
import Sun from '../assets/images/sun.svg'
import AoContextCard from './contextCard'
import api from '../client/api'
import AoPopupPanel from './popupPanel'

@observer
export default class AoHub extends React.PureComponent<{}> {
  constructor(props) {
    super(props)
    this.state = {}
    this.addCommunityCard = this.addCommunityCard.bind(this)
  }

  addCommunityCard() {
    api.createCard('community hub')
    console.log('card added')
  }

  render() {
    let communityCard = aoStore.cardByName.get('community hub')
    let topMissions = aoStore.topMissions
    let topCards = aoStore.topCards

    return (
      <div id={'hub'}>
        <AoPopupPanel
          iconSrc={Sun}
          tooltipText={'Community Hub'}
          tooltipPlacement={'right'}
          panelPlacement={'right-start'}
          id={'hub'}>
          <React.Fragment>
            <div className={'left'}>
              <h2>
                {aoStore.state.cash.alias
                  ? aoStore.state.cash.alias
                  : 'Community Hub'}
              </h2>
              {communityCard && communityCard.hasOwnProperty('taskId') ? (
                <AoContextCard
                  task={communityCard}
                  cardStyle={'full'}
                  noContextOnFull={true}
                />
              ) : (
                <p onClick={this.addCommunityCard} className={'action'}>
                  +H.U.B.
                </p>
              )}
            </div>
            <div className={'right'}>
              <h2>Top Missions</h2>
              <AoStack
                cards={topMissions}
                alwaysShowAll={true}
                cardStyle={'mission'}
              />
              <h2>Top Cards</h2>
              <AoStack
                cards={topCards}
                alwaysShowAll={true}
                cardStyle={'priority'}
              />
            </div>
          </React.Fragment>
        </AoPopupPanel>
      </div>
    )
  }
}
