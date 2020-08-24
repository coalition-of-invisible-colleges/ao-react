import React from 'react'
import { observable, computed } from 'mobx'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'
import AoStack from './stack'
import Coin from '../assets/images/coin.svg'
import LazyTippy from './lazyTippy'
import 'tippy.js/dist/tippy.css'

interface CoinProps {
  taskId: string
  noPopups?: boolean
}

@observer
export default class AoCoin extends React.PureComponent<CoinProps> {
  constructor(props) {
    super(props)
  }

  @computed get isGrabbed() {
    const card = aoStore.hashMap.get(this.props.taskId)
    if (!card) return undefined

    return card.deck.indexOf(aoStore.member.memberId) >= 0
  }

  @computed get isMember() {
    const taskId = this.props.taskId
    const card = aoStore.hashMap.get(taskId)
    if (!card) return undefined

    return card.name === taskId
  }

  @computed get hodlCount() {
    const card = aoStore.hashMap.get(this.props.taskId)
    if (!card || !card.hasOwnProperty('deck')) return undefined

    return card.deck.length
  }

  render() {
    const taskId = this.props.taskId
    const card = aoStore.hashMap.get(taskId)
    if (!card) return null

    const onClick = event => {
      event.stopPropagation()
      event.nativeEvent.stopImmediatePropagation()

      if (this.isGrabbed) {
        api.dropCard(taskId)
      } else {
        api.grabCard(taskId)
      }
    }

    const memberCards = card.deck
      .map(memberId => aoStore.hashMap.get(memberId))
      .filter(memberCard => memberCard !== undefined)
      .slice()
      .reverse()

    let parentCards = []
    if (
      card &&
      card.hasOwnProperty('parents') &&
      card.parents &&
      card.parents.length >= 1
    ) {
      parentCards = card.parents
        .map(memberId => aoStore.hashMap.get(memberId))
        .filter(task => {
          if (!task || !task.hasOwnProperty('taskId')) {
            return false
          }

          if (task.taskId === task.name) {
            return false
          }
          if (task.taskId === aoStore.currentCard) {
            return false
          }
          return true
        })
        .reverse()
    }

    let list = (
      <React.Fragment>
        {parentCards && parentCards.length >= 1 ? (
          <React.Fragment>
            <h3>
              Within {parentCards.length} other card
              {parentCards.length >= 2 ? 's' : ''}
            </h3>
            <AoStack
              cards={parentCards}
              zone={'panel'}
              cardStyle={'priority'}
              cardsBeforeFold={3}
              noPopups={true}
            />
          </React.Fragment>
        ) : (
          ''
        )}
        <h3>
          {memberCards.length}{' '}
          {!this.isMember
            ? memberCards.length === 1
              ? 'Hodl'
              : 'Hodlers'
            : memberCards.length === 1
            ? 'Vouch'
            : 'Vouches'}
        </h3>
        {memberCards && memberCards.length >= 1 ? (
          <AoStack
            cards={memberCards}
            zone={'panel'}
            cardStyle={'member'}
            cardsBeforeFold={3}
            noPopups={true}
          />
        ) : null}
        {!this.isMember ? (
          <p>Click to {this.isGrabbed ? 'drop' : 'grab'} this card.</p>
        ) : (
          <p>
            Click to{' '}
            {this.isGrabbed
              ? 'unvouch.'
              : 'vouch for this member within this community.'}
          </p>
        )}
      </React.Fragment>
    )
    return (
      <div className={this.isGrabbed ? 'coin' : 'coin ungrabbed'}>
        {!this.props.noPopups ? (
          <LazyTippy
            zIndex={4}
            interactive={true}
            content={list}
            hideOnClick={false}
            delay={[625, 200]}
            appendTo={() =>
              document.getElementById('card-' + taskId).parentElement
            }>
            <img
              src={Coin}
              onClick={onClick}
              draggable={false}
              onDoubleClick={event => {
                event.stopPropagation()
                event.nativeEvent.stopImmediatePropagation()
              }}
            />
          </LazyTippy>
        ) : (
          <img
            src={Coin}
            onClick={onClick}
            draggable={false}
            onDoubleClick={event => {
              event.stopPropagation()
              event.nativeEvent.stopImmediatePropagation()
            }}
          />
        )}
        {this.hodlCount >= 2 || (this.hodlCount >= 1 && !this.isGrabbed) ? (
          <div className="hodls">{this.hodlCount}</div>
        ) : (
          ''
        )}
      </div>
    )
  }
}
