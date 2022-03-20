import * as React from 'react'

import { Helmet } from 'react-helmet'

import {
  computed,
  makeObservable,
  observable,
  reaction,
  comparer,
  runInAction,
} from 'mobx'
import { observer, Observer } from 'mobx-react'
import aoStore, { Member, Resource } from '../client/store'
import { Task } from '../interfaces'
import api from '../client/api'
import { delay, cancelablePromise } from '../utils'
import Markdown from 'markdown-to-jsx'
import AoPaper from './paper'
import AoGrid from './grid'
import AoStack from './stack'
import AoCardHud from './cardHud'
import AoMission from './mission'
import AoAttachment from './attachment'
import AoCoin from './coin'
import AoBird from './bird'
import AoPreview from './preview'
import AoCheckmark from './checkmark'
import AoMetric from './metric'
import AoMemberIcon from './memberIcon'
import AoCountdown from './countdown'
import AoHiddenFieldset from './hiddenFieldset'
import AoInterval from './interval'
import AoCrowdfund from './crowdfund'
import AoPrice from './price'
import AoFund from './fund'
import AoStash from './stash'
import AoGridResizer from './gridResizer'
import BlankBadge from '../assets/images/badge_blank.svg'
import Gift from '../assets/images/gift.svg'
import Boat from '../assets/images/boat.svg'
import Clipboard from '../assets/images/clipboard.svg'
import Timecube from '../assets/images/timecube.svg'
import Chest from '../assets/images/chest.svg'
import Lilypad from '../assets/images/chatroom.svg'
import Checkbox from '../assets/images/completed.svg'
import Star from '../assets/images/star.svg'
import Stash from '../assets/images/stash.svg'
import Controls from '../assets/images/controls.svg'
import {
  goInCard,
  prioritizeCard,
  subTaskCard,
  CardZone,
  CardPlay,
  CardLocation
} from '../cardTypes'
import AoDragZone from './dragZone'
import AoDropZone from './dropZone'
import AoDropZoneSimple from './dropZoneSimple'
import AoCardTabs, { CardTab, CardTabId } from './cardTabs'
// import AoProposals from './proposals'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'

export type CardStyle =
  | 'priority'
  | 'face'
  | 'full'
  | 'compact'
  | 'mini'
  | 'badge'
  | 'checkmark'
  | 'context'
  | 'mission'
  | 'member'
  | 'envelope'
  | 'notification'
  | 'index'

export interface DragContext {
  zone: CardZone
  level?: number
  inId?: string
  x?: number
  y: number
}

interface CardProps {
  // task: string
  task: Task
  cardStyle?: CardStyle
  inlineStyle?: React.CSSProperties
  noContextOnFull?: boolean
  noPopups?: boolean
  noFindOnPage?: boolean
  inId?: string
  padTop?: boolean
  priorPriors?: string[]
  isCurrentCard?: boolean
}


interface State {
  showPriorities?: boolean
  showCompleted?: boolean
  showProjects?: boolean
  // loadedFromServer: boolean
  confirmedLoadedAllChildren: boolean
  renderMeNowPlease?: boolean
  showCopied?: boolean
  currentTab?: CardTabId
  closingDrawerTimeout?
}

// const AoContextCard =
//     (props) =>
//     {
//       console.log("AO: components/AoContextCard: ", {props});

//       let card = aoStore.hashMap.get(props.taskId);

//       return <Helmet><title>{card.loadedFromServer?card.name:"loading..."}</title></Helmet>
//     };

// export default observable(AoContextCard);

export default class AoContextCard extends React.Component<CardProps, State> {
  constructor(props) {
    super(props)
    // makeObservable(this);

    this.state = { confirmedLoadedAllChildren: false } //task:this.props.task};

    // let loadedTask = props.task;
    // this.props.taskLoaded = loadedTask?true:false
    // this.props.task = this.props.task

    this.togglePriorities = this.togglePriorities.bind(this)
    this.toggleProjects = this.toggleProjects.bind(this)
    this.newPriority = this.newPriority.bind(this)
    this.newSubTask = this.newSubTask.bind(this)
    this.goInCard = this.goInCard.bind(this)
    this.refocusAll = this.refocusAll.bind(this)
    this.copyCardToClipboard = this.copyCardToClipboard.bind(this)
    this.onSwitchTab = this.onSwitchTab.bind(this)
    this.renderCardContent = this.renderCardContent.bind(this)
    this.clearPendingPromise = this.clearPendingPromise.bind(this)
    this.dropToCard = this.dropToCard.bind(this)

    this.taskHasLoadedAllChildren = false
  }

  taskName
  taskHasLoadedAllChildren

  executeOnUnmount_list = []

  forceRerender() {
    this.setState({ renderMeNowPlease: true })
  }

  loadChildTasksAndPossiblyReRender() {
    // console.log('AO: components/contextCard.tsx: loadChildTasksAndReRender: ', {
    //   props: this.props,
    //   state: this.state,
    // })

    // if (forceReload === true) this.setState({"confirmedLoadedAllChildren":false})

    // this code will try to load all the subcards of this card using local client and server async
    //   if all the cards are already on the client, it will finish synchronously, discarding the
    //   response of the async callback
    if (!this.props.task) return
    if (this.props.cardStyle !== 'full') return

    this.taskHasLoadedAllChildren = false

    let currentLoadedState = aoStore.getAllLinkedCardsForThisTaskId_async(
      this.props.task.taskId,
      stateRequiresUpdate => {
        // console.log(
        //   'AO: components/contextCard.tsx: loadChildTasksAndReRender: running callback after loading all child cards',
        //   { stateRequiresUpdate }
        // )

        if (stateRequiresUpdate === true) {
          // this.childComponentsLastUpdated = Date.now()
          this.taskHasLoadedAllChildren = true
          this.setState({ renderMeNowPlease: true })
        }
      }
    )
    if (currentLoadedState !== false) {
      // this.setState({confirmedLoadedAllChildren: true})
      this.taskHasLoadedAllChildren = true
    }
  }

  onPropsTaskChangeFunction() {
    this.loadChildTasksAndPossiblyReRender()
    this.taskName = this.props.task ? this.props.task.name : 'No Task'

    if (this.props.cardStyle === 'full') {
      if (
        aoStore.context.length === 0 &&
        this.props.task &&
        this.props.task.taskId !== aoStore.member.memberId
      ) {
        runInAction(() => aoStore.context.push(aoStore.member.memberId))
      }

      if (this.props.task && this.props.task.taskId) {
        aoStore.removeFromContext(this.props.task.taskId)
      }
    }
  }

  subCardsReaction
  registerSubCardsReaction() {
    if (this.subCardsReaction) this.subCardsReaction()
    this.subCardsReaction = reaction(
      () => {
        let toReturn = []

        if (!this.props.task || this.props.cardStyle !== 'full') {
          // do nothing
        } else {
          this.props.task &&
            this.props.task.priorities &&
            this.props.task.priorities.length
          this.props.task &&
            this.props.task.subTasks &&
            this.props.task.subTasks.length
          this.props.task &&
            this.props.task.completed &&
            this.props.task.completed.length
          this.props.task && this.props.task.grid && this.props.task.grid.rows
          this.props.task && this.props.task.aoGridToolDoNotUpdateUI

          toReturn = this.allSubCardItems
          toReturn.push(
            this.props.task && this.props.task.aoGridToolDoNotUpdateUI
          )
        }
        return toReturn
      },
      projectCards => {
        if (
          this.taskHasLoadedAllChildren === true &&
          this.props.task.aoGridToolDoNotUpdateUI !== true
        ) {
          this.setState({ renderMeNowPlease: true })
        }
      },
      { equals: comparer.structural }
    )
  }

  componentDidMount() {
    this.onPropsTaskChangeFunction()
    this.registerSubCardsReaction()
  }

  componentDidUpdate(prevProps, prevState) {
    if(prevProps?.task?.taskId !== this.props?.task?.taskId) {
      if(this.state.showCopied) {
        this.setState({showCopied: false})
      }
    }
    this.onPropsTaskChangeFunction()
    this.registerSubCardsReaction()
  }

  componentWillUnmount() {
    this.clearPendingPromise()
    if (this.subCardsReaction) this.subCardsReaction()
  }

  pendingPromise = undefined

  clearPendingPromise() {
    if (this.pendingPromise) {
      this.pendingPromise.cancel()
    }
    this.pendingPromise = undefined
  }

  @computed get allSubCardItems() {
    let debuggingOutput = []

    const card = this.props.task
    if (!card) return []

    let toReturn = []
    let allSubCards = []

    let subCardArrayList = [card.priorities, card.subTasks, card.completed]

    subCardArrayList.forEach((subCardArray, index) => {
      subCardArray.forEach(cardItem => {
        toReturn.push(index + ':' + cardItem)
      })
    })

    if (card.grid && card.grid.rows) {
      Object.entries(card.grid.rows).forEach(([y, row]) => {
        Object.entries(row).forEach(([x, cell]) => {
          debuggingOutput.push({ y, x, cell })
          toReturn.push(y + ':' + x + ':' + cell)
        })
      })
    }

    return toReturn
  }

  @computed get projectCards() {
    if (this.props.cardStyle !== 'mission' && this.props.cardStyle !== 'index') {
      return undefined
    }
    let debuggingOutput = []

    const card = this.props.task
    if (!card) return []

    let projectCards: Task[] = []
    let allSubCards = [].concat(card.priorities, card.subTasks, card.completed)

    allSubCards.forEach(tId => {
      let subCard = aoStore.hashMap.get(tId)
      debuggingOutput.push({ tId, subCard })
      if (subCard) {
        if (
          subCard.guild &&
          subCard.guild.length >= 1 &&
          subCard.deck.length >= 1
        ) {
          projectCards.push(subCard)
        }
      }
    })

    if (card.grid && card.grid.rows) {
      Object.entries(card.grid.rows).forEach(([y, row]) => {
        Object.entries(row).forEach(([x, cell]) => {
          let gridCard = aoStore.hashMap.get(cell)
          debuggingOutput.push({ y, x, cell, gridCard })
          if (
            gridCard &&
            gridCard.guild &&
            gridCard.guild.length >= 1 &&
            gridCard.deck.length >= 1
          ) {
            projectCards.push(gridCard)
          }
        })
      })
    }

    return projectCards
  }

  togglePriorities(event) {
    event.stopPropagation()
    event.nativeEvent.stopImmediatePropagation()
    if (!this.state.showPriorities) {
      this.setState({ showPriorities: true, showProjects: false })
    } else {
      this.setState({ showPriorities: false })
    }
  }

  showProjects() {
    this.setState({ showProjects: true })
  }
  
  toggleProjects(event) {
    event.nativeEvent.stopImmediatePropagation()
    if (!this.state.showProjects) {
      this.setState({ showProjects: true, showPriorities: false })
    } else {
      this.setState({ showProjects: false })
    }
  }

  newPriority(name: string) {
    const card = this.props.task
    if (!card) {
      console.log('missing card')
    }
    api
      .findOrCreateCardInCard(name, card.taskId, true)
      .then(() => this.setState({ renderMeNowPlease: true }))
  }

  newSubTask(name: string) {
    const card = this.props.task
    if (!card) {
      console.log('missing card')
    }
    api
      .findOrCreateCardInCard(name, card.taskId)
      .then(() => this.setState({ renderMeNowPlease: true }))
  }

  goInCard(event = null) {
    const card = this.props.task
    if (!card) {
      console.log('missing card')
      return
    }
    let thisCardIsRenderedInTheContextStack = this.props.cardStyle === 'context'
    goInCard(
      card.taskId,
      thisCardIsRenderedInTheContextStack,
      !thisCardIsRenderedInTheContextStack
    )
  }

  refocusAll() {
    api.refocusPile(this.props.task.taskId)
  }

  async dropToCard(move: CardPlay) {
    if (!move.from.taskId) {
      return
    }
    const cardFrom = aoStore.hashMap.get(move.from.taskId)
    if (!cardFrom) {
      return
    }
    const nameFrom = cardFrom.name

    const cardTo = aoStore.cardByName.get(move.to.taskId)
    if (!cardTo) {
      return
    }

    const nameTo = cardTo && cardTo.name ? cardTo.name : undefined

    return new Promise((resolve, reject) => {
      if (move.to.taskId === nameTo) {
        api.passCard(move.from.taskId, move.to.taskId)
      } else {
        api.findOrCreateCardInCard(nameFrom, move.to.taskId, true).then(resolve)
      }
    })
  }

  @computed get applyClassIfCurrentSearchResult() {
    if (this.props.noFindOnPage) {
      return ''
    }
    if (
      aoStore.searchResults &&
      aoStore.searchResults.hasOwnProperty('all') &&
      aoStore.searchResults.all.some(task => {
        return task.taskId === this.props.task.taskId
      })
    ) {
      return ' searchedOnPage'
    }
    return ''
  }
  
  copyCardToClipboard(event, content: string) {
    event.stopPropagation()
    if (this.state.showCopied){
        if(aoStore.currentCard !== this.props.task.taskId) {
          this.goInCard()
        }
        return
    }
    navigator.clipboard.writeText(content)
      .then(() => {
          this.setState({showCopied: true})
      })
      .catch(err => {
          console.log(err, 'copy attempt failed, printing to console:')
          console.log(content)
      })
 }
 
  onSwitchTab(newTab?) {
    if(!newTab) {
      const newTimer = setTimeout(() => this.setState({ closingDrawerTimeout: null, currentTab: null }), 650)
      this.setState({ closingDrawerTimeout: newTimer })
      return
    }
    if(this.state.closingDrawerTimeout) {
      clearTimeout(this.state.closingDrawerTimeout)
      this.setState({ currentTab: newTab, closingDrawerTimeout: null })
      return
    }
    this.setState({currentTab: newTab}) 
  }

  renderCardContent(content: string, hideIframes = false, alternateOnClick = null) {
    // hideIframes doesn't  work. it's supposed to hide YouTube embeds in the mini card.
    const meme = aoStore.memeById.get(this.props.task.taskId)
    let memeContent
    if (meme) {
      memeContent =
        '<a href="' +
        '/memes/' +
        meme.filename +
        '" download >' +
        content +
        '</a>'
    }

    return (
      <div className='clipboardWrapper' onClick={alternateOnClick ? alternateOnClick : this.props.cardStyle !== 'context' && this.props.cardStyle !== 'index' ? (event) => this.copyCardToClipboard(event, content) : undefined}>
        <Markdown
          options={{
            forceBlock: false,
            overrides: {
              a: {
                props: {
                  target: '_blank',
                },
              },
              iframe: {
                props: {
                  display: hideIframes ? 'inherit' : 'none',
                },
              },
            },
          }}>
          {memeContent ? memeContent : content}
        </Markdown>
        {alternateOnClick ? null : this.props.cardStyle !== 'context' && this.props.cardStyle !== 'index' && this.state.showCopied && <img className='clippy' src={Clipboard} />}
      </div>
    )
  }

  @computed get priorityCards() {
    const card = this.props.task
    if (card.priorities && card.priorities.length >= 1) {
      return card.priorities
        .map(tId => aoStore.hashMap.get(tId))
        .filter(t => t?.deck?.length >= 1)
    }
    return null
  }
  
	@computed get completedCards() {
		const card = this.props.task

		if (!card || !card.completed || card.completed.length < 1) {
			return null
		}

		let completedCards: Task[] = card.completed
			.map(tId => aoStore.hashMap.get(tId))
			.filter(t => t?.deck?.length >= 1)
		completedCards.reverse()

		return completedCards
	}

  @computed get renderedUpboats() {
    const card = this.props.task
    const upboats = {}
    this.priorityCards?.forEach((priority, i) => {
      let allocatedHere = 0
      if (Array.isArray(card.allocations)) {
        card.allocations.some(allocation => {
          if (allocation.allocatedId === priority.taskId) {
            allocatedHere = allocation.amount
          }
        })
      }
      const totalAllocatedHere = priority.boost + allocatedHere
      upboats[priority.taskId] = (
        <div
          onClick={() => api.allocatePriority(card.taskId, priority.taskId)}
          className="allocate">
          <img src={Boat} />
          {totalAllocatedHere > 0 && (
            <div className="allocation">{totalAllocatedHere}</div>
          )}
        </div>
      )
      if (i === this.priorityCards.length - 1) {
        upboats[priority.taskId] = (
          <div>
            <AoMetric taskId={priority.taskId} inId={card.taskId} />
            {upboats[priority.taskId]}
          </div>
        )
      }
    })

    return upboats
  }

  render = () => {
    const card = this.props.task
    if (!card) {
      return (
        <div className={'card ' + this.props.cardStyle + ' loading'}>
          <div className="content">
            <div className="spinner" />
          </div>
        </div>
      )
    }

    const taskId = card.taskId
    let member
    let content = card.name

    if (taskId === content) {
      member = aoStore.memberById.get(taskId)
      if (member) {
        content = member.name
      } else {
        const resource = aoStore.resourceById.get(taskId)
        if (resource) {
          content = resource.name
        }
      }
    }

    let priorityCards: Task[] = this.priorityCards

    let subTaskCards: Task[]
    if (card.subTasks && card.subTasks.length >= 1) {
      subTaskCards = card.subTasks
        .map(tId => aoStore.hashMap.get(tId))
        .filter(t => t?.deck?.length >= 1)
    }

    const contentClass = "content" + (this.state.showCopied ? ' crosshair' : '')
    const cardStyle = this.props.cardStyle ? this.props.cardStyle : 'face'
    // console.log('AO: components/contextCard.tsx: render: ', {
    //   taskId,
    //   cardStyle,
    // })

    switch (cardStyle) {
      case 'context':
        return (
          <div
            className={
              'card context ' +
              card?.color +
              'Card' +
              this.applyClassIfCurrentSearchResult
            }
            id={'card-' + taskId}
            onClick={this.goInCard}
            onMouseOut={this.clearPendingPromise}
            style={this.props.inlineStyle ? this.props.inlineStyle : null}>
            <AoPaper taskId={taskId} color={card?.color} />
            <AoCardHud taskId={taskId} hudStyle="context" />
            <div className={contentClass}>
              {member && <AoMemberIcon memberId={taskId} />}
              {this.renderCardContent(content)}
            </div>
          </div>
        )
      case 'member':
        const isGrabbed1 = card.deck.indexOf(aoStore.member.memberId) >= 0
        return (
          <AoDropZone
            taskId={taskId}
            onDrop={this.dropToCard}
            zoneStyle="panel"
            dropHoverMessage="drop to give card to this member">
            <div
              id={'card-' + taskId}
              className={
                'card member ' +
                card?.color +
                'Card' +
                this.applyClassIfCurrentSearchResult +
                (this.state.showPriorities ? ' padbottom' : '')
              }
              onClick={this.goInCard}>
              <AoPaper taskId={taskId} color={card?.color} />
              <AoCardHud
                taskId={taskId}
                hudStyle="collapsed-member"
                prioritiesShown={this.state.showPriorities}
                onTogglePriorities={this.togglePriorities}
              />
              <div className={contentClass}>
                {isGrabbed1 && card.taskId !== card.name ? (
                  <AoBird taskId={taskId} noPopups={this.props.noPopups} />
                ) : (
                  <AoCoin taskId={taskId} noPopups={this.props.noPopups} />
                )}
                {member && <AoMemberIcon memberId={taskId} />}
                {this.renderCardContent(content)}
              </div>
              {this.state.showPriorities ? (
                <AoStack
                  inId={taskId}
                  cards={priorityCards}
                  cardStyle="priority"
                  zone="priorities"
                />
              ) : null}
            </div>
          </AoDropZone>
        )
        break
      case 'priority':
        const isGrabbed = card.deck.indexOf(aoStore.member.memberId) >= 0
        return (
          <div
            id={'card-' + taskId}
            className={
              'card priority ' +
              card?.color +
              'Card' +
              this.applyClassIfCurrentSearchResult +
              (this.state.showPriorities ? ' padbottom' : '')
            }
            onClick={this.goInCard}
            onMouseOut={this.clearPendingPromise}>
            <AoPaper taskId={taskId} color={card?.color} />
            <AoCardHud
              taskId={taskId}
              hudStyle="collapsed"
              prioritiesShown={this.state.showPriorities}
              onTogglePriorities={this.togglePriorities}
            />
            <div className={contentClass}>
              {isGrabbed && card.taskId !== card.name ? (
                <AoBird taskId={taskId} noPopups={this.props.noPopups} />
              ) : (
                <AoCoin taskId={taskId} noPopups={this.props.noPopups} />
              )}
              {member && <AoMemberIcon memberId={taskId} />}
              <AoAttachment taskId={taskId} inId={this.props.inId} />
              {this.renderCardContent(content)}
            </div>
            {this.state.showPriorities ? (
              <AoStack
                inId={taskId}
                cards={priorityCards}
                cardStyle="priority"
                zone="priorities"
              />
            ) : null}
          </div>
        )
      case 'face':
      case 'compact':
        return (
          <div
            id={'card-' + taskId}
            className={
              'card ' +
              card?.color +
              'Card ' +
              this.props.cardStyle +
              this.applyClassIfCurrentSearchResult
            }
            onClick={this.goInCard}
            onMouseOut={this.clearPendingPromise}>
            <AoPaper taskId={taskId} color={card?.color} />
            <AoCardHud
              taskId={taskId}
              hudStyle="face before"
              inId={this.props.inId}
            />
            <div
              className={
                'content' + (card.priorities.length < 1 ? ' padBefore' : '')
              }>
              <AoMission taskId={taskId} hudStyle="face before" />
              {member && <AoMemberIcon memberId={taskId} />}
              <AoAttachment taskId={taskId} inId={this.props.inId} />
              {this.renderCardContent(content)}
              {card.priorities && card.priorities.length >= 1 ? (
                <>
                  <div className="action" onClick={this.togglePriorities}>
                    {card.priorities.length}{' '}
                    {card.priorities.length > 1 ? 'priorities' : 'priority'}{' '}
                    {this.state.showPriorities ? (
                      <React.Fragment>&#8963;</React.Fragment>
                    ) : (
                      <React.Fragment>&#8964;</React.Fragment>
                    )}
                  </div>
                  {this.state.showPriorities ? (
                    <AoStack
                      inId={taskId}
                      cards={priorityCards}
                      showAdd={false}
                      hideAddWhenCards={true}
                      addButtonText="+priority"
                      cardStyle="priority"
                      onNewCard={this.newPriority}
                      onDrop={prioritizeCard}
                      zone="priorities"
                    />
                  ) : null}
                </>
              ) : null}
            </div>
            <AoCardHud
              taskId={taskId}
              hudStyle="face after"
              noPopups={this.props.noPopups}
            />
          </div>
        )
      case 'full':
        const onDropToPrioritiesTab = (from: CardLocation) => {
          if(from.zone === 'grid') {
            api.unpinCardFromGrid(from.coords.x, from.coords.y, from.inId).then(() =>  api.prioritizeCard(from.taskId, taskId))
            return
          }
          api.prioritizeCard(from.taskId, taskId)
        }
        
        const completedCards = this.completedCards
        const showCompleted = () => this.setState({ showCompleted: true })
        const hideCompleted = () => this.setState({ showCompleted: false})
        const prioritiesSummary = priorityCards?.length >= 1 ? <div>{priorityCards.length} task{priorityCards.length >= 2 ? 's' : ''}</div> : null
        const recurrenceSummary = card?.claimInterval > 0 ? <div>{card.claimInterval} hrs</div> : null
        const completedSummary = completedCards?.length >= 1 ? <div className='fitContent'>{completedCards.length} <object type="image/svg+xml" data={Star} /></div> : null
        
        const countdownSummary = <AoCountdown taskId={taskId} hudStyle='badge' />
        const bonus = card.boost || 0
        const hasPoints = bonus > 0
        const pointsSummary = hasPoints ? <div>{bonus} pt{bonus >= 2 ? 's' : ''}</div> : null
    
        const goal = card.hasOwnProperty('goal') && card.goal >= 0 ? card.goal : 0
        const hasGoal = goal > 0
        const goalSummary = hasGoal ? <div>{goal} goal</div> : null
        
        let totalStashedCards = 0
				if (card.stash) {
					Object.entries<[number, string[]]>(card.stash).forEach(
						([level, tIds]) => {
							//if (myLevel >= parseInt(level, 10)) {
								totalStashedCards += tIds.length
							//}
						}
					)
				}
				const stashSummary = totalStashedCards > 0 ? <div>{totalStashedCards} stashed</div> : null
				
        const tabs: CardTab[] = [
            {
              id: CardTabId.priorities,
              icon: Checkbox,
              tooltip: 'Priorities',
              content: [(prioritiesSummary || recurrenceSummary) ? <React.Fragment>{prioritiesSummary}{recurrenceSummary}</React.Fragment> : null, completedSummary],
              onDrop: onDropToPrioritiesTab
            },
            {
              id: CardTabId.timecube,
              icon: Timecube,
              tooltip: 'Calendar',
              content: countdownSummary
            },
            {
              id: CardTabId.lightning,
              icon: Chest,
              tooltip: 'Points',
              content: (pointsSummary || goalSummary) ? <React.Fragment>{pointsSummary}{goalSummary}</React.Fragment> : null
            },
          ]
        
        let onDropToStashTab
        if(card.showStash) {
          onDropToStashTab = (from: CardLocation) => {
        		if (!from.taskId) {
        			return
        		}
        		const cardFrom = aoStore.hashMap.get(from.taskId)
        		if (!cardFrom) {
        			return
        		}
        		const nameFrom = cardFrom.name
        
        		const cardTo = card
        		const nameTo = cardTo && cardTo.name ? cardTo.name : undefined
        
        		let numLevel: number = 1
        		if (typeof numLevel === 'string') {
        			numLevel = parseInt(numLevel, 10)
        		}
        		switch (from.zone) {
        			case 'discard':
        				aoStore.popDiscardHistory()
        			case 'card':
        			case 'priorities':
        			case 'grid':
        			case 'subTasks':
        			case 'completed':
        			case 'context':
        			case 'panel':
        			default:
        				api.stashCard(from.taskId, from.inId, numLevel)
        		}
        	}
          tabs.push({
            id: CardTabId.stash,
            icon: Stash,
            tooltip: 'Stash',
            content: stashSummary,
            onDrop: onDropToStashTab
          })
        }
        
        tabs.push({
          id: CardTabId.menu,
          icon: Controls,
          tooltip: 'Card Controls',
        })
        
        const renderedCompletedTab = completedCards && completedCards.length >=1 ?
          <div className={'prioritiesTab' + (this.state.showCompleted ? ' selected' : '')} onClick={this.state.showCompleted ? hideCompleted : showCompleted}>{completedCards.length} <object type="image/svg+xml" data={Star} /></div> : null
                
        let cardDrawerContent
        switch(this.state.currentTab) {
          case CardTabId.priorities:
            cardDrawerContent = 
              <React.Fragment>
                {!this.state.showCompleted ? 
                  <AoDropZoneSimple onDrop={onDropToPrioritiesTab} dropHoverMessage='Drop to prioritize'>
                    <div className='spreadCenteredFlex'>
                      <h2>Priorities</h2>
                      {renderedCompletedTab}
                    </div>
                    {priorityCards && priorityCards.length >= 1 ? <AoStack
                      inId={taskId}
                      cards={priorityCards}
                      showAdd={false}
                      hideAddWhenCards={true}
                      cardStyle="priority"
                      onNewCard={this.newPriority}
                      noDrop={true}
                      zone="priorities"
                      decorators={this.renderedUpboats}
                      alwaysShowAll={true}
                    /> : <p>No priorities. Drop card here to prioritize.</p>}
                    <AoHiddenFieldset heading={recurrenceSummary ? 'Repeats every ' + card.claimInterval + ' hours' : 'Repeat'} className="intervalFieldset">
                      <AoInterval taskId={taskId} hudStyle='menu' />
                    </AoHiddenFieldset>
                  </AoDropZoneSimple> :
                  <React.Fragment>
                    <div className='spreadCenteredFlex'>
                      <h2>Accomplished</h2>
                      {renderedCompletedTab}
                    </div>
                    {completedCards && completedCards.length >= 1 ? <AoStack
                      inId={taskId}
                      cards={completedCards}
                      showAdd={false}
                      hideAddWhenCards={true}
                      cardStyle="checkmark"
                      noDrop={true}
                      zone="completed"
                      alwaysShowAll={true}
                    /> : <p>No accomplishments here. Check off a card and discard it to move it here.</p>}
                  </React.Fragment>
                }
              </React.Fragment>
            break
          case CardTabId.timecube:
            cardDrawerContent = <React.Fragment>
              <h2>Calendar</h2>
              <AoCountdown taskId={taskId} hudStyle='menu' />
            </React.Fragment>
            break
          case CardTabId.lightning:
            cardDrawerContent = <React.Fragment>
              <AoFund taskId={taskId} />
              <AoCrowdfund taskId={taskId} hudStyle='menu' />
              <AoHiddenFieldset heading='Autopricer'>
                <AoPrice taskId={taskId} />
              </AoHiddenFieldset>
            </React.Fragment>
            break
          case CardTabId.stash:
            cardDrawerContent = <React.Fragment>
              <AoDropZoneSimple onDrop={onDropToStashTab} dropHoverMessage='Drop to stash'>
                <AoStash taskId={taskId} hudStyle='full before' />
              </AoDropZoneSimple>
            </React.Fragment>
            break
          case CardTabId.menu:
            cardDrawerContent = <React.Fragment>
              <AoCardHud taskId={taskId} hudStyle='menu' />
              <AoGridResizer taskId={taskId} gridStyle={card.gridStyle} />
            </React.Fragment>
            break
        }
        
        return (
          <React.Fragment>
            {this.props.noContextOnFull ? (
              ''
            ) : (
              <div
                id="context"
                style={{
                  marginTop: this.props.padTop ? '4em' : 'inherit',
                }}>
                <Observer>
                  {() => {
                    return (
                      <AoStack
                        cards={aoStore.contextCards}
                        cardStyle="context"
                        alwaysShowAll={true}
                        zone="context"
                        doNotReverseList={true}
                      />
                    )
                  }}
                </Observer>
              </div>
            )}
            <div
              id={'card-' + taskId}
              className={
                'card full ' +
                card?.color +
                'Card' +
                this.applyClassIfCurrentSearchResult
              }
              onDrop={e => {
                e.preventDefault()
                e.stopPropagation()
              }}
              onMouseOut={this.clearPendingPromise}>
              { cardDrawerContent &&
                <div id='cardDrawer'
                  className={(this.state.closingDrawerTimeout ? 'slideOut' : 'slideIn') + (this.state.currentTab ? ' ' + CardTabId[this.state.currentTab] : '')}
                  style={this.state.currentTab !== CardTabId.menu ? {top: 3.8 + ((this.state.currentTab as number - 1) * 5.4) + 'em'} : undefined}>
                  {cardDrawerContent}
                </div>
              }
              <Observer>
                {() => {
                  return (
                    <AoDragZone
                      taskId={taskId}
                      dragContext={{
                        zone: 'card',
                        inId: null,
                        y: 0,
                      }}>
                      <AoPaper taskId={taskId} color={card?.color} />
                    </AoDragZone>
                  )
                }}
              </Observer>
              <Observer>
                {() => <AoCardHud taskId={taskId} hudStyle="full before" />}
              </Observer>
              <Observer>
                {() => {
                  return (
                    <div
                      className={
                        'content' +
                        (card.priorities.length < 1 &&
                        (!card.grid ||
                          (card.grid && card.grid.height < 1) ||
                          card.grid.width < 1)
                          ? ' padBefore'
                          : '')
                      }>
                      <AoMission taskId={taskId} hudStyle="full before" />
                      <AoAttachment taskId={taskId} inId={this.props.inId} />
                      {member && <AoMemberIcon memberId={taskId} />}
                      {this.renderCardContent(content)}
                    </div>
                  )
                }}
              </Observer>
              {/*<Observer>
                {() => {
                  return (
                    <AoStack
                      inId={taskId}
                      cards={priorityCards}
                      showAdd={false}
                      hideAddWhenCards={true}
                      addButtonText="+priority"
                      cardStyle="priority"
                      onNewCard={this.newPriority}
                      onDrop={prioritizeCard}
                      zone="priorities"
                      decorators={this.renderedUpboats}
                    />
                  )
                }}
              </Observer>*/}
              <Observer>
                {() => {
                  if (priorityCards && priorityCards.length > 6) {
                    return (
                      <div className="refocusAll">
                        <button className="action" onClick={this.refocusAll}>
                          refocus
                        </button>
                      </div>
                    )
                  } else {
                    return <div />
                  }
                }}
              </Observer>
              <Observer>
                {() => (
                  <AoGrid
                    taskId={taskId}
                    height={card.grid?.height}
                    width={card.grid?.width}
                    size={card.grid?.size || 9}
                    gridStyle={card.gridStyle}
                  />
                )}
              </Observer>
              <Observer>
                {() => {
                  return (
                    <AoStack
                      inId={taskId}
                      cards={subTaskCards}
                      showAdd={false}
                      cardStyle="face"
                      onNewCard={this.newSubTask}
                      onDrop={subTaskCard}
                      zone="subTasks"
                    />
                  )
                }}
              </Observer>
              <Observer>
                {() => {
                  return <AoCardHud taskId={taskId} hudStyle="full after">
                    <AoCardTabs tabs={tabs} onTabShown={this.onSwitchTab} onTabClosed={this.onSwitchTab} />
                  </AoCardHud>
                }}
              </Observer>
            </div>
          </React.Fragment>
        )
      case 'checkmark':
        return (
          <div
            id={'card-' + taskId}
            className={
              'card checkmark ' +
              card?.color +
              'Card' +
              this.applyClassIfCurrentSearchResult
            }
            onMouseOut={this.clearPendingPromise}>
            <AoCheckmark color={card.color} onGoIn={this.goInCard} />
            <div className={contentClass}>{this.renderCardContent(content)}</div>
          </div>
        )
      case 'mission':
        // A format that emphasizes the mission and projects (sub-missions), for the Missions Index
        const projectCards = this.projectCards
        return (
          <div
            className={
              'card mission ' +
              card?.color +
              'Card' +
              (this.state.showPriorities ? ' padbottom' : '') +
              this.applyClassIfCurrentSearchResult
            }
            id={'card-' + taskId}
            onClick={this.goInCard}
            onMouseOut={this.clearPendingPromise}>
            <AoPaper taskId={taskId} color={card?.color} />
            <AoCardHud taskId={taskId} hudStyle="collapsed-mission" />
            <div className={contentClass}>
              <AoMission taskId={taskId} hudStyle="collapsed" />
              <AoPreview
                taskId={taskId}
                hudStyle="collapsed"
                prioritiesShown={this.state.showPriorities}
                onTogglePriorities={this.togglePriorities}
                projectsShown={this.state.showProjects}
                onToggleProjects={this.toggleProjects}
                hideSubcardCountOnCollapsed={true}
              />
            </div>
            {this.state.showProjects ? (
              <AoStack
                inId={taskId}
                cards={projectCards}
                cardStyle="mission"
                zone="panel"
              />
            ) : null}
            {this.state.showPriorities ? (
              <AoStack
                inId={taskId}
                cards={priorityCards}
                cardStyle="priority"
                zone="panel"
              />
            ) : null}
            <div style={{ clear: 'both', height: '1px' }} />
          </div>
        )
      case 'index':
        const indexCards = this.projectCards
        if(indexCards?.length && indexCards.length >= 1) {
          content = card.guild + ' (' + indexCards.length + ')'
        }
        const youAreHere = this.props.isCurrentCard
        return  <div>
              <div className={'indexLink' + (youAreHere ? ' youAreHere' : '') + (card.color ? ' ' + card.color + 'Text' : '') +
              this.applyClassIfCurrentSearchResult }>
                {indexCards && indexCards.length >= 1 ? (this.state.showProjects ? (
                  <span className="triangle" onClick={this.toggleProjects}>&#9660;</span>
                ) : (
                  <span className="triangle"  onClick={this.toggleProjects}>&#9654;</span> )) : (  <span className="triangle nohover">&#8226;</span> )}
                  <AoDropZone
                    taskId={taskId}
                    onDrop={this.dropToCard}
                    zoneStyle="panel"
                    dropHoverMessage="drop to categorize here">
                      {this.renderCardContent(content, true, !youAreHere ? this.goInCard : undefined)}
                  </AoDropZone>
              </div>
              {this.state.showProjects ? (
                <AoStack
                  inId={taskId}
                  cards={indexCards}
                  cardStyle={cardStyle}
                  alwaysShowAll={true}
                  zone="panel"
                  noDrop={true}
                />
              ) : null}
            </div>
      case 'envelope':
        const openGift = () => {
          api.prioritizeCard(taskId, aoStore.memberCard.taskId)
        }

        const fromMemberId = card.passed.find(
          pass => (pass[1] = aoStore.member.memberId)
        )[0]
        const fromMemberName = aoStore.state.members.find(
          member => member.memberId === fromMemberId
        ).name

        return (
          <Tippy
            zIndex={4}
            theme="translucent"
            content={
              <span>
                <p>
                  Gift from <AoMemberIcon memberId={fromMemberId} />
                  {fromMemberName}
                </p>
                <p>
                  <small>Click to open and place in your priorities.</small>
                </p>
              </span>
            }
            delay={[625, 200]}
            placement="left-start">
            <div
              id={'card-' + taskId}
              className={
                'card envelope ' +
                card?.color +
                'Card' +
                this.applyClassIfCurrentSearchResult
              }
              onMouseOut={this.clearPendingPromise}>
              <AoPaper taskId={taskId} color={card?.color} />
              <img src={Gift} onClick={openGift} />
            </div>
          </Tippy>
        )
      case 'notification':
        return (
          <div
            id={'card-' + taskId}
            className={
              'card notification ' +
              card?.color +
              'Card' +
              this.applyClassIfCurrentSearchResult
            }
            onClick={this.goInCard}>
            <AoPaper taskId={taskId} color={card?.color} />
            <AoCardHud taskId={taskId} hudStyle="notification" />
            <div className={contentClass}>
              {member && <AoMemberIcon memberId={taskId} />}
              <AoAttachment taskId={taskId} inId={this.props.inId} />
              {this.renderCardContent(content, true)}
  						  <AoCountdown taskId={taskId} hudStyle='notification' />
            </div>
          </div>
        )
        break
      case 'mini':
      case 'badge':
      default:
        let shortened = content
        if (shortened.length > 32) {
          shortened = shortened.substr(0, shortened.lastIndexOf(' ', 32))
        }

        return (
          <div
            id={'card-' + taskId}
            className={
              'card mini ' +
              card?.color +
              'Card' +
              this.applyClassIfCurrentSearchResult
            }
            onClick={this.goInCard}
            onMouseOut={this.clearPendingPromise}>
            <AoPaper taskId={taskId} color={card?.color} />
            <AoCardHud taskId={taskId} hudStyle="mini before" />
            <div className={contentClass}>
              {member && <AoMemberIcon memberId={taskId} />}
              <AoAttachment taskId={taskId} inId={this.props.inId} />
              {this.renderCardContent(content, true)}
            </div>
            <AoCardHud
              taskId={taskId}
              hudStyle="mini after"
              priorPriors={this.props.priorPriors}
            />
          </div>
        )
    }
  }
}
