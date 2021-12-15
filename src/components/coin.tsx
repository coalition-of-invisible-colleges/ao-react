import React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'
import AoStack from './stack'
import { countCurrentSignatures } from '../cards'
import { countVouches } from '../cardTypes'
import Coin from '../assets/images/coin.svg'
import GoldenDoge from '../assets/images/goldendoge.svg'
import Paw from '../assets/images/paw.svg'
import LazyTippy from './lazyTippy'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'
import { gloss } from '../semantics'

interface CoinProps {
  taskId: string
  noPopups?: boolean
}

@observer
export default class AoCoin extends React.Component<CoinProps> {
  private imageRef = React.createRef<HTMLImageElement>()

  constructor(props) {
    super(props)
    makeObservable(this)
    this.sign = this.sign.bind(this)
    this.unsign = this.unsign.bind(this)
    this.signatureDecorators = this.signatureDecorators.bind(this)
  }

  @computed get isGrabbed() {
    const card = aoStore.hashMap.get(this.props.taskId)
    if (!card) return null

    return card.deck.indexOf(aoStore.member.memberId) >= 0
  }

  @computed get isMember() {
    const taskId = this.props.taskId
    const card = aoStore.hashMap.get(taskId)
    if (!card) return null

    return card.name === taskId
  }

  @computed get isActiveMember() {
    const member = aoStore.memberById.get(this.props.taskId)
    if (!member) {
      return null
    }
    const isActive = member.active >= 1

    return this.isMember && isActive
  }

  @computed get hodlCount() {
    const card = aoStore.hashMap.get(this.props.taskId)
    if (!card || !card.hasOwnProperty('deck')) return null

    return card.deck.length
  }

  @computed get signCount() {
    const card = aoStore.hashMap.get(this.props.taskId)
    if (!card || !card.hasOwnProperty('signed')) return null
    return countCurrentSignatures(card.signed)
  }

  @computed get isSigned() {
    const card = aoStore.hashMap.get(this.props.taskId)
    if (!card) return null

    return card.signed.some(
      signature => signature.memberId === aoStore.member.memberId
    )
  }

  @computed get defenseScore() {
    const card = aoStore.hashMap.get(this.props.taskId)
    if (!card || !card.hasOwnProperty('deck')) return null
    const member = aoStore.memberById.get(this.props.taskId)
    if (!member) return null

    let max = countVouches(this.props.taskId)

    const memberCards = card.deck
      .map(memberId => aoStore.hashMap.get(memberId))
      .forEach(memberCard => {
        if (memberCard !== undefined) {
          max = Math.max(max, countVouches(memberCard.taskId))
        }
      })

    return max
  }

  sign() {
    api.signCard(this.props.taskId)
  }

  unsign() {
    api.signCard(this.props.taskId, 0)
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

      if (lastFoundSig === undefined) return
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
              <span onClick={this.unsign} className="action inline decorator">
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
        .map(taskId => aoStore.hashMap.get(taskId))
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

    let mySignature
    if (card.hasOwnProperty('signed')) {
      for (let i = card.signed.length - 1; i >= 0; i--) {
        if (card.signed[i].memberId == aoStore.member.memberId) {
          mySignature = card.signed[i]
          break
        }
      }
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
        {this.isMember && memberCards ? (
          <React.Fragment>
            <Tippy
              zIndex={4}
              theme="translucent"
              content="Your Attack is the same as your vouches"
              delay={[625, 200]}>
              <span
                style={{
                  cursor: 'default',
                  marginRight: '1em',
                  display: 'inline-block',
                }}>
                Attack: {memberCards.length}
              </span>
            </Tippy>
            <Tippy
              zIndex={4}
              theme="translucent"
              content='Your Defense is the highest Attack score amongst you and everyone who vouches for you. To ban or delete your account, another member must have a higher Attack than your Defense AND be listed before you in the ordered list of members (sort members by "Order")'
              delay={[625, 200]}>
              <span
                style={{
                  cursor: 'default',
                  display: 'inline-block',
                }}>
                Defense: {this.defenseScore}
              </span>
            </Tippy>
          </React.Fragment>
        ) : null}
        {memberCards.length >= 1 ? (
          <AoStack
            cards={memberCards}
            zone="panel"
            cardStyle="member"
            cardsBeforeFold={3}
            noPopups={true}
            decorators={this.signatureDecorators(memberCards)}
            className="signatureDecorated"
          />
        ) : null}
        <div>
          {card.guild && <p>Sign to join this {gloss('guild')}</p>}
          {mySignature && mySignature.opinion >= 1 ? (
            <span>
              <strong>signed</strong>
            </span>
          ) : (
            <span onClick={this.sign} className="action inline decorator">
              sign{card.guild && ' & join'}
            </span>
          )}
          {!mySignature || (mySignature && mySignature.opinion >= 1) ? (
            <span
              onClick={this.unsign}
              className="action inline decorator"
              style={{ marginLeft: '1em' }}>
              {!mySignature || mySignature.opinion ? 'un' : "don't "}sign
              {card.guild &&
                (mySignature && mySignature.opinion ? ' & quit' : ' & join')}
            </span>
          ) : (
            <span style={{ marginLeft: '1em' }}>
              <strong>declined to sign</strong>
            </span>
          )}
        </div>
        {!this.isMember ? (
          <p>Click moon to {this.isGrabbed ? 'drop' : 'grab'} this card.</p>
        ) : (
          <p>
            Click moon to{' '}
            {this.isGrabbed
              ? 'unvouch.'
              : 'vouch for this member within this community.'}
          </p>
        )}
      </React.Fragment>
    )

    const pendingDeletion =
      card.hasOwnProperty('deck') &&
      card.deck.length <= 0 &&
      card.taskId !== card.name &&
      Date.now() - card.created > 5 * 60 * 1000

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
              src={this.isActiveMember ? GoldenDoge : Coin}
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
        {pendingDeletion && <div className="pendingDeletion" />}
      </div>
    )
  }
}
