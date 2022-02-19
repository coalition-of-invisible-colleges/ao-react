import React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'
import { HudStyle } from './cardHud'
import AoStack from './stack'
import Grab from '../assets/images/grab.svg'
import Completed from '../assets/images/completed.svg'
import Uncompleted from '../assets/images/uncompleted.svg'
import LazyTippy from './lazyTippy'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'

interface CheckboxProps {
  taskId: string
  hudStyle: HudStyle
}

@observer
export default class AoCheckbox extends React.PureComponent<CheckboxProps> {
  constructor(props: CheckboxProps) {
    super(props)
    makeObservable(this)
    this.grabCard = this.grabCard.bind(this)
  }

  @computed get isCompleted() {
    const card = aoStore.hashMap.get(this.props.taskId)
    if (!card) return undefined
    return card.claimed.indexOf(aoStore.member.memberId) >= 0
  }

  @computed get isGrabbed() {
    const card = aoStore.hashMap.get(this.props.taskId)
    if (!card) return undefined
    return card.deck.indexOf(aoStore.member.memberId) >= 0
  }

  grabCard(event) {
    event.stopPropagation()
    event.nativeEvent.stopImmediatePropagation()

    api.grabCard(this.props.taskId)
  }

  render() {
    const taskId = this.props.taskId
    const card = aoStore.hashMap.get(taskId)
    if (!card || card.taskId === aoStore.memberCard.taskId) return null

    const showTinyCheckbox =
      (aoStore.member.priorityMode || aoStore.localPriorityMode) &&
      card?.priorities?.length >= 1
    const onClick = event => {
      event.stopPropagation()
      event.nativeEvent.stopImmediatePropagation()

      if (this.isCompleted) {
        api.uncheckCard(taskId)
      } else {
        api.completeCard(taskId)
      }
    }

    switch (this.props.hudStyle) {
      case 'full before':
      case 'face before':
      case 'collapsed':
      case 'badge':
      case 'mini after':
        const memberCards = card.deck
          .map(memberId => aoStore.hashMap.get(memberId))
          .filter(memberCard => memberCard !== undefined)
          .slice()
          .reverse()

        if (this.isCompleted || this.isGrabbed) {
          return (
            <LazyTippy
              zIndex={4}
              theme="translucent"
              content={
                <span>
                  <p>Click to grab card to deck</p>
                  <p>
                    <small>
                      Cards in your collection cannot be deleted by other
                      members.
                    </small>
                  </p>
                  <p>Members holding this card:</p>
                  <p>
                    {memberCards.length >= 1 && (
                      <AoStack
                        cards={memberCards}
                        zone="panel"
                        cardStyle="member"
                        cardsBeforeFold={3}
                        noPopups={true}
                        className="signatureDecorated"
                      />
                    )}
                  </p>
                </span>
              }
              delay={[625, 200]}
              placement="left-start">
              <img
                className={
                  'checkbox ' +
                  this.props.hudStyle +
                  (this.isCompleted ? ' checked' : ' unchecked') +
                  (showTinyCheckbox ? ' tiny' : '')
                }
                src={this.isCompleted ? Completed : Uncompleted}
                onClick={onClick}
                onDoubleClick={event => {
                  event.stopPropagation()
                  event.nativeEvent.stopImmediatePropagation()
                }}
              />
            </LazyTippy>
          )
        } else {
          return (
            <LazyTippy
              zIndex={4}
              theme="translucent"
              content={
                <span>
                  <p>Click to grab card to deck</p>
                  <p>
                    <small>
                      Cards in your collection cannot be deleted by other
                      members.
                    </small>
                  </p>
                  <p>Members holding this card:</p>
                  <p>
                    {memberCards.length >= 1 ? (
                      <AoStack
                        cards={memberCards}
                        zone="panel"
                        cardStyle="member"
                        cardsBeforeFold={3}
                        noPopups={true}
                        className="signatureDecorated"
                      />
                    ) : null}
                  </p>
                </span>
              }
              delay={[625, 200]}
              placement="left-start">
              <img
                className={'grab ' + this.props.hudStyle}
                src={Grab}
                onClick={this.grabCard}
                onDoubleClick={event => {
                  event.stopPropagation()
                  event.nativeEvent.stopImmediatePropagation()
                }}
              />
            </LazyTippy>
          )
        }
      default:
        return null
    }
  }
}
