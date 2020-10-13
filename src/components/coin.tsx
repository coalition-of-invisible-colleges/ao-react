import React from 'react'
import { observable, computed } from 'mobx'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'
import AoStack from './stack'
import { countCurrentSignatures } from '../cards'
import Coin from '../assets/images/coin.svg'
import Paw from '../assets/images/paw.svg'
import LazyTippy from './lazyTippy'
import 'tippy.js/dist/tippy.css'

interface CoinProps {
  taskId: string
  noPopups?: boolean
}

@observer
export default class AoCoin extends React.PureComponent<CoinProps> {
  private imageRef = React.createRef<HTMLImageElement>()

  constructor(props) {
    super(props)
    this.sign = this.sign.bind(this)
    this.signatureDecorators = this.signatureDecorators.bind(this)
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

  @computed get signCount() {
    const card = aoStore.hashMap.get(this.props.taskId)
    if (!card || !card.hasOwnProperty('signed')) return undefined
    console.log('card.signed length is ', card.signed.length)
    return countCurrentSignatures(card.signed)
  }

  @computed get isSigned() {
    const card = aoStore.hashMap.get(this.props.taskId)
    if (!card) return undefined

    return card.signed.some(
      signature => signature.memberId === aoStore.member.memberId
    )
  }

  sign() {
    api.signCard(this.props.taskId)
  }

  signatureDecorators(memberCards) {
    const taskId = this.props.taskId
    const card = aoStore.hashMap.get(taskId)
    if (!card) return null

    let renderedSignatures = {}
    renderedSignatures[aoStore.member.memberId] = (
      <span onClick={this.sign} className="action inline decorator">
        sign
      </span>
    )

    memberCards.forEach(memberCard => {
      if (!card.hasOwnProperty('signed') || card.signed.length < 1) return

      let lastFoundSig
      for (let i = card.signed.length - 1; i >= 0; i--) {
        if (card.signed[i].memberId == memberCard.taskId) {
          lastFoundSig = card.signed[i]
          break
        }
      }

      if (!lastFoundSig) return null
      if (memberCard.taskId === aoStore.member.memberId) {
        if (lastFoundSig.opinion === 1) {
          renderedSignatures[aoStore.member.memberId] = (
            <React.Fragment>
              <img
                src={Paw}
                className="decorator"
                style={{ height: '1.5em' }}
                draggable={false}
                onDoubleClick={event => {
                  event.stopPropagation()
                  event.nativeEvent.stopImmediatePropagation()
                }}
              />
              <span onClick={this.sign} className="action inline decorator">
                unsign
              </span>
            </React.Fragment>
          )
        }
      } else if (lastFoundSig.opinion === 1) {
        renderedSignatures[memberCard.taskId] = (
          <img
            src={Paw}
            className="decorator"
            style={{ height: '1.5em' }}
            draggable={false}
            onDoubleClick={event => {
              event.stopPropagation()
              event.nativeEvent.stopImmediatePropagation()
            }}
          />
        )
      }
    })
    return renderedSignatures
  }

  @computed get renderHodlCount() {
    if (this.signCount >= 1) {
      console.log('signCount is ', this.signCount)
      return (
        <React.Fragment>
          <img
            src={Paw}
            className="moonpaw spin"
            draggable={false}
            onDoubleClick={event => {
              event.stopPropagation()
              event.nativeEvent.stopImmediatePropagation()
            }}
          />
          <div className="hodls">{this.signCount}</div>
        </React.Fragment>
      )
    }

    if (this.hodlCount >= 2 || (this.hodlCount >= 1 && !this.isGrabbed)) {
      return <div className="hodls">{this.hodlCount}</div>
    } else {
      return ''
    }
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
            decorators={this.signatureDecorators(memberCards)}
            className="signatureDecorated"
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
            appendTo={document.getElementById('root')}>
            <img
              src={Coin}
              ref={this.imageRef}
              onClick={onClick}
              className="spin"
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
            ref={this.imageRef}
            onClick={onClick}
            className="spin"
            draggable={false}
            onDoubleClick={event => {
              event.stopPropagation()
              event.nativeEvent.stopImmediatePropagation()
            }}
          />
        )}
        {this.renderHodlCount}
      </div>
    )
  }
}
