import React from 'react'
import ReactDOM from "react-dom"
import { useState, useEffect } from 'react'
import { makeAutoObservable, makeObservable, observable, action, runInAction,reaction } from 'mobx'
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

interface CardProps {
  match
}

interface RenderProps {
  taskId?: string
}


export class ContextPile {
  contextPileList         = aoStore.contextCards;

  constructor () {
    makeObservable(this, {contextPileList: observable})
  }

}
const contextPile       = new ContextPile()
const ContextPileView   = observer( ({contextPile}) => <div id="context">
         contextCard.tsx__full__noContextOnFull_false
         <AoStack
           cards={contextPile.contextPileList}
           cardStyle="context"
           alwaysShowAll={true}
           zone="context"
         />
       </div>
  
);



export class CurrentContextCard {
  cardItem = null;
  loadingCardItemFromServer = null;
  history = null;

  constructor() { 
    makeObservable(this, {cardItem: observable}) 
  }

  setCardItem(taskId) {
    aoStore.getTaskById_async(taskId, (taskItem) => { runInAction(() => { this.cardItem = taskItem; contextPile.contextPileList.push(taskItem)} ) });
    this.history.push("/task/"+taskId);
  }
}
const currentContextCard = new CurrentContextCard();
const currentCardReaction =
    reaction
    ( () => 
      { console.log("AO: client/Card.tsx: currentCardReaction: aoStore.currentCard"+ aoStore.currentCard)
        return aoStore.currentCard 
      },
      (currentCard) => 
      { currentContextCard.setCardItem(currentCard) 
      }
    );

const PageTitleView   = observer( ({currentContextCard}) => <Helmet><title>{currentContextCard.cardItem?currentContextCard.cardItem.name:"Loading..."}</title></Helmet> );

const ContextCardView = observer( ({currentContextCard}) => <AoContextCard task={currentContextCard.cardItem} cardStyle="full" />)



// const CardTitleView = observer( ({currentContextCard}) => <Helmet><title>{currentContextCard.cardItem.name}</title></Helmet> );
// ReactDOM.render(<PageTitleView currentContextCard={currentContextCard} />, document.getElementById("root"));


function renderCard(taskId?: string, props?: any) {
  console.log('AO: components/Card.tsx: renderCard: taskId is ', {taskId, props})

  // let card
  // let cardText
  // if (taskId) {
  //   card = aoStore.hashMap.get(taskId)

  //   if (card) {
  //     cardText = ''
  //     if (card.name === taskId) {
  //       let memberOrResource: Member | Resource = aoStore.memberById.get(taskId)
  //       if (!memberOrResource) {
  //         memberOrResource = aoStore.resourceById.get(taskId)
  //       }
  //       if (memberOrResource) {
  //         cardText = memberOrResource.name
  //       }
  //     } else if (card.guild) {
  //       cardText = card.guild
  //     } else {
  //       cardText = card.name
  //     }

  //     if (cardText.length > 12) {
  //       cardText = cardText.substring(0, 12) + '…'
  //     }
  //   }
  // }

  // currentContextCard.setCardItem(taskId);

  return (
    <Tour steps={steps} tourOptions={tourOptions}>
      <div id="tour-current-card">
        {
          // <Helmet>
          //   <title>
          //     {//cardText ? cardText + ' - ' : ''
          //     }
          //     {aoStore.state.cash.alias}
          //   </title>
          // </Helmet>
        }
        Card.tsx
        { <AoDiscardZone /> 
        }
        { 
          //card ? <AoContextCard taskId={taskId} task={card} cardStyle="full" /> : <AoDrawPile />
          // <AoContextCard taskId={taskId} task={card} cardStyle="full" />
          //taskId?<AoContextCard taskId={taskId} cardStyle="full" />:<div>'AO: components/Card.tsx: taskId not set'</div>
          // <div id="currentContextCard">currentContextCard div: {taskId}
          <div>
            <PageTitleView      currentContextCard={currentContextCard} />
            {
              //<ContextPileView    contextPile={contextPile} />
            }
            <ContextCardView    currentContextCard={currentContextCard} />
          </div>
          // <CardHeadingView    currentContextCard={currentContextCard} />
          // </div>

        }
        { 
          <AoHud />
        }
      </div>
    </Tour>
  )
}

interface CardState {
  nextRender?: boolean
}

export default function AoCard(props) {
  let history = useHistory()
  currentContextCard.history = history;

  let taskId =
    props.match.params.hasOwnProperty('taskId') && props.match.params.taskId

  console.log("AO: components/Card.tsx: AoCard:", { props })

  useEffect(() => {
    aoStore.setCurrentCard(taskId);
    currentContextCard.setCardItem(taskId);

    // setTimeout(() => currentContextCard.cardItem.name = "Woosh", 2000);
  },
  [taskId]
  )

  useEffect(() => {
    if (aoStore.globalRedirect) {
      history.push(aoStore.globalRedirect)
      aoStore.setGlobalRedirect(null)
    }
  }, [aoStore.globalRedirect])

  return (
    aoStore.currentCard?<div tabIndex={0} style={{ outline: 'none' }}>
      { renderCard(aoStore.currentCard, props) 
      }
    </div>:"No taskId"
  )
  // ReactDOM.render(renderCard(aoStore.currentCard), document.getElementById("root"));
}
