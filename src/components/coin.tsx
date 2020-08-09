import React from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore, { Task } from '../client/store'
import { TaskContext } from './taskContext'
import api from '../client/api'
import AoStack from './stack'
import Coin from '../assets/images/coin.svg'
import Tippy from '@tippyjs/react'
import { Placement } from 'tippy.js'
import 'tippy.js/dist/tippy.css'

interface CoinProps {
  noPopup?: boolean
}

@observer
export default class AoCoin extends React.PureComponent<CoinProps> {
  static contextType = TaskContext

  render() {
    const { card, setRedirect } = this.context

    const computed = observable({
      get isGrabbed() {
        return card.deck.indexOf(aoStore.member.memberId) >= 0
      },
      get isMember() {
        return card.name === card.taskId
      },
      get hodlCount() {
        return card.deck.length
      }
    })
    const onClick = event => {
      event.stopPropagation()
      event.nativeEvent.stopImmediatePropagation()

      if (computed.isGrabbed) {
        api.dropCard(card.taskId)
      } else {
        api.grabCard(card.taskId)
      }
    }

    const memberCards = card.deck
      .map(memberId => aoStore.hashMap.get(memberId))
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
              noPopups={true}
            />
          </React.Fragment>
        ) : (
          ''
        )}
        <h3>
          {memberCards.length}{' '}
          {!computed.isMember
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
            alwaysShowAll={true}
            noPopups={true}
          />
        ) : null}
        {!computed.isMember ? (
          <p>Click to {computed.isGrabbed ? 'drop' : 'grab'} this card.</p>
        ) : (
          <p>
            Click to{' '}
            {computed.isGrabbed
              ? 'unvouch.'
              : 'vouch for this member within this community.'}
          </p>
        )}
      </React.Fragment>
    )
    return (
      <div className={computed.isGrabbed ? 'coin' : 'coin ungrabbed'}>
        {!this.props.noPopup ? (
          <Tippy
            zIndex={4}
            interactive={true}
            content={list}
            hideOnClick={false}
            delay={[625, 200]}
            appendTo={() =>
              document.getElementById('card-' + card.taskId).parentElement
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
          </Tippy>
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
        {computed.hodlCount >= 2 ||
        (computed.hodlCount >= 1 && !computed.isGrabbed) ? (
          <div className="hodls">{computed.hodlCount}</div>
        ) : (
          ''
        )}
      </div>
    )
  }
}
