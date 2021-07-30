import React from 'react'
import { useState, useEffect } from 'react'
import { observer } from 'mobx-react'
import { useHistory } from 'react-router-dom'
import aoStore, { Member, Resource } from '../client/store'
import AoContextCard from './contextCard'
import AoDrawPile from './draw'
import AoDiscardZone from './discard'
import AoHud from './hud'
import { Helmet } from 'react-helmet'
import { ShepherdTour as Tour } from 'react-shepherd'
import { steps, tourOptions } from './tour'

interface CardProps {
  match
}

interface RenderProps {
  taskId?: string
}

function renderCard(taskId?: string) {
  console.log('taskId is ', taskId)

  let card
  let cardText
  if (taskId) {
    card = aoStore.hashMap.get(taskId)

    if (card) {
      cardText = ''
      if (card.name === taskId) {
        let memberOrResource: Member | Resource = aoStore.memberById.get(taskId)
        if (!memberOrResource) {
          memberOrResource = aoStore.resourceById.get(taskId)
        }
        if (memberOrResource) {
          cardText = memberOrResource.name
        }
      } else if (card.guild) {
        cardText = card.guild
      } else {
        cardText = card.name
      }

      if (cardText.length > 12) {
        cardText = cardText.substring(0, 12) + '…'
      }
    }
  }

  return (
    <Tour steps={steps} tourOptions={tourOptions}>
      <div id="tour-current-card">
        <Helmet>
          <title>
            {cardText ? cardText + ' - ' : ''}
            {aoStore.state.cash.alias}
          </title>
        </Helmet>
        <AoDiscardZone />
        {card ? <AoContextCard task={card} cardStyle="full" /> : <AoDrawPile />}
        <AoHud />
      </div>
    </Tour>
  )
}

interface CardState {
  nextRender?: boolean
}

export default function AoCard(props) {
  let history = useHistory()

  let taskId =
    props.match.params.hasOwnProperty('taskId') && props.match.params.taskId

  useEffect(() => aoStore.setCurrentCard(taskId), [taskId])

  useEffect(() => {
    if (aoStore.globalRedirect) {
      history.push(aoStore.globalRedirect)
      // aoStore.setGlobalRedirect(null)
    }
  }, [aoStore.globalRedirect])

  return (
    <div tabIndex={0} style={{ outline: 'none' }}>
      {renderCard(aoStore.currentCard)}
    </div>
  )
}
