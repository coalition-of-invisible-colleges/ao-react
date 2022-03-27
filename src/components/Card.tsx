import React from 'react'
import ReactDOM from 'react-dom'
import { useState, useEffect } from 'react'
import {
  makeAutoObservable,
  makeObservable,
  observable,
  computed,
  action,
  runInAction,
  reaction,
  autorun,
} from 'mobx'
import { observer } from 'mobx-react'
import { useHistory } from 'react-router-dom'
import aoStore, { Member, Resource } from '../client/store'

import AoStack from './stack'

import AoContextCard from './contextCard'
import AoDrawPile from './draw'
import AoDiscardZone from './discard'
import AoHud from './hud'
import { Helmet } from 'react-helmet'
import { ShepherdTour as Tour } from 'react-shepherd'
import { steps, tourOptions } from './tour'
import api from '../client/api'

interface CardProps {
  match
}

interface RenderProps {
  taskId?: string
}

class ContextStackWatcher {
  contextCardList = aoStore.contextCards

  constructor() {
    makeObservable(this, { contextCardList: observable })
  }
}
const contextStackWatcher = new ContextStackWatcher()
reaction(
  () => {
    return aoStore.context
  },

  contextCardList => {}
)

class CurrentContextCard {
  cardItem = null
  loadingCardItemFromServer = null
  history = null

  constructor() {
    makeObservable(this, { cardItem: observable })
  }

  setCardItem(taskId) {
    let taskIdUrlString = '/task/'

    if (taskId !== null && taskId !== undefined) {
      //TODO: some kind of loader spinner?
      // get the card from the client store or from the server
      aoStore.getTaskById_async(taskId, taskItem => {
        runInAction(() => {
          this.cardItem = taskItem

          taskIdUrlString += taskId

          if (window.location.pathname !== taskIdUrlString) {
            this.history.push(taskIdUrlString)
          }

          document.title = 'loading....'
        })
      })
    } else {
      runInAction(() => {
        this.cardItem = null
        this.history.push(taskIdUrlString)
      })
    }
  }
}
const currentContextCard = new CurrentContextCard()
const currentCardReaction = reaction(
  () => {
    return aoStore.currentCard
  },
  currentCard => {
    currentContextCard.setCardItem(currentCard)
  }
)

const PageTitleView = observer(() => {
  let pageTitle = 'Loading...'

  if (currentContextCard.cardItem) {
    if (
      currentContextCard.cardItem.name === currentContextCard.cardItem.taskId
    ) {
      const foundMember = aoStore.memberById.get(
        currentContextCard.cardItem.taskId
      )
      if (foundMember) {
        pageTitle = foundMember.name
      } else {
        const foundResource = aoStore.resourceById.get(
          currentContextCard.cardItem.taskId
        )?.name
      }
    } else {
      pageTitle = currentContextCard.cardItem.name
    }
  }

  return (
    <Helmet>
      <title>{pageTitle}</title>
    </Helmet>
  )
})

interface ContextCardViewProps {
  renderMeNowPlease: number  
} 

const ContextCardView = observer((props: ContextCardViewProps) => {
  if (currentContextCard.cardItem === null) {
    return <AoDrawPile />
  } else {
    return (
      <AoContextCard
        task={currentContextCard.cardItem}
        cardStyle="full"
        padTop={!!aoStore.taskDoingNow}
      />
    )
  }
})

export default function AoCard(props) {
  const [renderMeNowPlease, setRenderMeNowPlease] = React.useState(0)
  
  let history = useHistory()
  currentContextCard.history = history

  console.log(history.action)

  let targetTaskId
  if (props.match.path === '/') {
    aoStore.getCommunityHubCardId(communityHubCardTaskId =>
      aoStore.setCurrentCard(communityHubCardTaskId)
    )
  } else if (props.match.params && props.match.params.taskId) {
    let targetTaskId = props.match.params.taskId
    console.log('@: components/Card.tsx: rendering task: ', { targetTaskId })

    aoStore.getTaskById_async(targetTaskId, () => {
      console.log('@: components/Card.tsx: task loaded from server: ', {
        targetTaskId,
        clientSideData: aoStore.hashMap.get(targetTaskId),
      })
      aoStore.setCurrentCard(targetTaskId)
    })
  }

  return (
    <Tour steps={steps} tourOptions={tourOptions}>
      <div id="tour-current-card">
        <AoDiscardZone onDiscard={() => {
          setRenderMeNowPlease(renderMeNowPlease + 1)} 
          }/>
        {
          <div>
            <PageTitleView />
            <ContextCardView renderMeNowPlease={renderMeNowPlease} />
          </div>
        }
        {<AoHud />}
      </div>
    </Tour>
  )
}
