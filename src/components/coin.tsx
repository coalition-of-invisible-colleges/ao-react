import React, { FunctionComponent } from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'
import AoStack from './stack'
import Coin from '../assets/images/coin.svg'
import Tippy from '@tippyjs/react'
import { Placement } from 'tippy.js'
import 'tippy.js/dist/tippy.css'

interface AoCoinProps {
  taskId: string
  noPopup?: boolean
}

const AoCoin: FunctionComponent<AoCoinProps> = observer(
  ({ taskId, noPopup }) => {
    const computed = observable({
      get isGrabbed() {
        return (
          aoStore.hashMap.get(taskId).deck.indexOf(aoStore.member.memberId) >= 0
        )
      },
      get isMember() {
        return aoStore.hashMap.get(taskId).name === taskId
      },
      get hodlCount() {
        return aoStore.hashMap.get(taskId).deck.length
      }
    })
    const onClick = event => {
      event.stopPropagation()
      event.nativeEvent.stopImmediatePropagation()

      if (computed.isGrabbed) {
        api.dropCard(taskId)
      } else {
        api.grabCard(taskId)
      }
    }

    const memberCards = aoStore.hashMap
      .get(taskId)
      .deck.map(memberId => aoStore.hashMap.get(memberId))
      .slice()
      .reverse()

    let list = (
      <React.Fragment>
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
        {!noPopup ? (
          <Tippy
            zIndex={4}
            interactive={true}
            content={list}
            hideOnClick={false}
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
)

export default AoCoin
