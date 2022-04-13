import * as React from 'react'
import { Redirect } from 'react-router-dom'
import { observer, Observer } from 'mobx-react'
import aoStore, { RightSidebarTab } from '../client/store'
import api from '../client/api'
import AoDoing from './doing'
import AoHub from './hub'
import AoDock from './dock'
import AoMissions from './missions'
import AoMembers from './members'
import AoCalendar from './calendar'
import AoSearch from './search'
import AoTickerHud, { AoTicker } from './tickerHud'
import AoScore from './score'
import AoUsername from './username'
import AoPassword from './password'
import AoPhone from './phone'
import AoFob from './fob'
import AoVolume from './volume'
import AoReactivator from './reactivator'
import AoTour from './tour'
import AoManual from './manual'
import AoSidebarButton from './sidebarButton'
import AoChatroom from './chatroom'
import AoStatus from './status'
import AoEventReminders from './eventReminders'
import AoResources from './resources'
import AoConnect from './connect'
import AoLightning from './lightning'
import AoRent from './rent'
import Sun from '../assets/images/sun.svg'
import Bird from '../assets/images/mailbox.svg'
import Badge from '../assets/images/bulletin.svg'
import Timecube from '../assets/images/timecube.svg'
import Chest from '../assets/images/chest.svg'
import Manual from '../assets/images/manual.svg'
import MemberIcon from '../assets/images/heartnet.svg'
import MagnifyingGlass from '../assets/images/search.svg'
import MoonBag from '../assets/images/moonbag.svg'
import Scroll from '../assets/images/scroll.svg'
import Bull from '../assets/images/bull.svg'
import Dolphins from '../assets/images/fobtap.svg'
import RedBoat from '../assets/images/nodes.svg'
import LightningBolt from '../assets/images/lightning.svg'
import GoldenDoge from '../assets/images/goldendoge.svg'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import { gloss } from '../semantics'
import config from '../../configuration'
import AoDeck from './deck'

interface State {
  theme: number
  redirect?: string
}

const themeCount = config?.themes?.length

@observer
class MainMenu extends React.Component<{}, State> {
  constructor(props) {
    super(props)
    this.state = { theme: 0 }
    if (this.state.theme !== 0) {
      document.body.className = config.themes[this.state.theme]
    }
  }

  changeTheme = () => {
    let newTheme = this.state.theme + 1
    if (newTheme >= themeCount) {
      newTheme = 0
    }
    this.setState({ theme: newTheme })
    document.body.className = config.themes[newTheme]
    console.log(
      'setting theme to',
      newTheme,
      'which is',
      config.themes[newTheme],
      'and themeCount is',
      themeCount
    )
  }

  onLogout = () => {
    console.log('calling api logout')
    api.logout().then(() => {
      this.setState({ redirect: '/login' })
    })
    console.log('logged out', aoStore.state.loggedIn)
  }

  render() {
    if (this.state.redirect !== undefined) {
      return <Redirect to={this.state.redirect} />
    }

    return (
      <div id="mainMenu">
        <AoUsername />
        <AoPassword />
        <AoPhone />
        <AoFob />
        <AoReactivator />
        <AoVolume />
        {themeCount >= 2 && (
          <div onClick={this.changeTheme} id="themer" className="action">
            Theme: {config.themes[this.state.theme]}
          </div>
        )}
        <AoTicker
          ticker={null}
          index={aoStore.member?.tickers ? aoStore.member.tickers.length : 0}
        />
        <AoTour />
        <div onClick={this.onLogout} id="logout" className="action">
          Log Out
        </div>
      </div>
    )
  }
}

interface HudState {
  proposals?: number
}

@observer
export default class AoHud extends React.Component<{}, HudState> {
  private searchRef = React.createRef<typeof AoSearch>()
  private deckSearchRef = React.createRef<AoDeck>()
  private counter = 0
  private dragEnterTarget
  private lastDragAction = ''

  constructor(props) {
    super(props)
    this.state = {}
    this.focusSearchbox = this.focusSearchbox.bind(this)
    this.updateProposalCount = this.updateProposalCount.bind(this)
    this.renderLeftSidebar = this.renderLeftSidebar.bind(this)
    this.toggleRightSidebar = this.toggleRightSidebar.bind(this)
    this.renderRightSidebar = this.renderRightSidebar.bind(this)
    this.focusDeckSearchbox = this.focusDeckSearchbox.bind(this)
  }

  focusSearchbox() {
    /* this.searchRef.current.focus() */
    // Buggy, out of scope
    console.log('not focusing search box, see hud.tsx:133')
  }

  focusDeckSearchbox() {
    // this.deckSearchRef.current.focus()
  }

  updateProposalCount(proposals: number) {
    this.setState({ proposals })
  }

  renderLeftSidebar() {
    if (!aoStore.leftSidebar) {
      return null
    }

    switch (aoStore.leftSidebar) {
      case 'members':
        return <AoMembers />
      case 'guilds':
        return <AoMissions />
      case 'calendar':
        return <AoCalendar />
      case 'search':
        return <AoSearch ref={this.searchRef} />
      case 'deck':
        return <AoDeck ref={this.deckSearchRef} />
      case 'manual':
      default:
        return <AoManual />
    }
  }
  
  toggleRightSidebar() {
    if (aoStore.rightSidebar) {
      aoStore.closeRightSidebar()
      return
    }
    aoStore.openRightSidebar()
  } 
  
  renderRightSidebar() {
    if (!aoStore.rightSidebar) {
      return null
    }
  
    let rendered
    
    function goToPage(event) {
      const page = event.currentTarget.getAttribute('data-page')
      if (aoStore.rightSidebar === page) {
        return
      }
      aoStore.setRightSidebar(page)
    }
  
    function renderPageButton(page: RightSidebarTab, label: string, imgSrc?: string) {
      if (aoStore.rightSidebar === page) {
        return (
          <p className="action selected">
            {imgSrc && <img src={imgSrc} />}
            {label}
          </p>
        )
      } else {
        return (
          <p onClick={goToPage} data-page={page} className="action">
            {imgSrc && <img src={imgSrc} />}
            {label}
          </p>
        )
      }
    }
  
    switch (aoStore.rightSidebar) {
      case 'p2p':
        rendered = <AoConnect />
        break
      case 'crypto':
        rendered = <AoLightning />
        break
      case 'membership':
        rendered = <AoRent />
        break
      case 'resources':
      default:
        rendered = <AoResources />
    }
    
    return <React.Fragment>
      <div className="toolbar">
        {renderPageButton('resources', 'Hardware', Dolphins)}
        {renderPageButton('p2p', 'AO p2p', RedBoat)}
        {renderPageButton('crypto', 'Crypto', LightningBolt)}
        {renderPageButton('membership', 'Membership', GoldenDoge)}
      </div>
      {rendered}
    </React.Fragment>
  }

  render() {
    let { now, today, tomorrow, overdue } = aoStore.eventsAsAgenda
    const eventCount =
      now.length + today.length + tomorrow.length + overdue.length
    const renderedCalendarBadge =
      eventCount >= 1 ? <React.Fragment>{eventCount}</React.Fragment> : null

    // const renderedProposalsBadge =
    //   this.state.proposals && this.state.proposals >= 1 ? (
    //     <React.Fragment>{this.state.proposals}</React.Fragment>
    //   ) : null

    const giftsPercentChanged = Math.min(
      Math.floor(aoStore.allChanges.length / 10),
      10
    )
    const giftsButtonClass = 'red' + giftsPercentChanged.toString()
    const giftsRenderedBadge = aoStore.myGifts.length >= 1 && (
      <React.Fragment>{aoStore.myGifts.length}</React.Fragment>
    )

    const guildsPercentChanged = Math.floor(
      (10 * aoStore.changedMissions.length) / aoStore.myMissions.length
    )
    const guildsButtonClass = 'red' + guildsPercentChanged.toString()
    return (
      <div id="hud">
        <div id="mainMenu-tour">
          <Tippy
            content={<MainMenu />}
            interactive={true}
            trigger="click"
            placement="top-end"
            theme="white"
            appendTo={() => document.body}>
            <div id="mainMenuButton">&#x22EE;</div>
          </Tippy>
        </div>
        <AoDoing />
        <AoHub />
        <div
          id="leftSidebar"
          className={aoStore.leftSidebar}
          onDragLeave={ev => {
            console.log('LEAVE', this.dragEnterTarget)
            if (
              ev.target === this.dragEnterTarget &&
              !(aoStore.leftSidebar === 'deck' && aoStore.deckTab === 'archive')
            ) {
              this.dragEnterTarget = null
              aoStore.closeLeftSidebar()
            }
          }}
          onDragEnter={ev => {
            console.log(
              'ENTER ev.target is',
              ev.target,
              ' and this.dragEnterTarget is',
              this.dragEnterTarget
            )
            if (
              ev.currentTarget.id === 'leftSidebar' ||
              ev.currentTarget.id === 'tour-members'
            ) {
              this.dragEnterTarget = ev.target
            }
          }}>
          <div className="leftBorder" />
          {this.renderLeftSidebar()}
          <AoSidebarButton
            sidebarTab="deck"
            iconSrc={MoonBag}
            tooltipText={gloss('My Deck')}
            tooltipPlacement="right"
            id="tour-deck"
          />
          {/*{onShown={this.focusDeckSearchbox}}*/}
          <AoSidebarButton
            sidebarTab="members"
            iconSrc={MemberIcon}
            tooltipText={gloss('Members')}
            tooltipPlacement="right"
            id="tour-members"
            openOnDragOver={true}
          />
          <AoSidebarButton
            sidebarTab="guilds"
            iconSrc={Badge}
            tooltipText={gloss('Guilds')}
            tooltipPlacement="right"
            id="tour-missions"
            buttonClass={guildsButtonClass}
            openOnDragOver={true}
          />
          <AoSidebarButton
            sidebarTab="calendar"
            iconSrc={Timecube}
            tooltipText={gloss('Calendar')}
            badge={renderedCalendarBadge}
            tooltipPlacement="right"
            id="tour-calendar"
          />
          <AoSidebarButton
            sidebarTab="search"
            iconSrc={MagnifyingGlass}
            tooltipText={gloss('Search')}
            tooltipPlacement="top"
            onShown={this.focusSearchbox}
            id="tour-search"
          />
          <AoSidebarButton
            sidebarTab="manual"
            iconSrc={Manual}
            tooltipText={gloss('Manual')}
            tooltipPlacement="right"
            id="tour-manual"
          />
        </div>
        <Observer>
          {() => {
            return <AoDock />
          }}
        </Observer>
        {aoStore.member?.tutorial || <AoTour />}
        <AoTickerHud />
        {/*        <div id="proposals">
            <AoPopupPanel
              iconSrc={Scroll}
              tooltipText="Proposals"
              badge={renderedBadge}
              tooltipPlacement="right"
              panelPlacement="right"
              id="tour-proposals">
              <AoProposals updateBadge={this.updateProposalCount} />
            </AoPopupPanel>
          </div>
          */}
        <AoChatroom taskId={aoStore.currentChatroom} />
        <AoEventReminders />
        {aoStore.rightSidebar && 
          <div
            id="rightSidebar"
            className={aoStore.rightSidebar}>
            {this.renderRightSidebar()}
          </div>
        }
        <Tippy
					zIndex={4}
					theme="translucent"
					content='Server Controls'
					placement='left'>
					<div
					 id="controls"
						className={
							!!aoStore.rightSidebar
								? 'popupButton actionCircle open'
								: 'popupButton actionCircle'
						}
						onClick={this.toggleRightSidebar}>
						<object type="image/svg+xml" data={Bull} />
					</div>
				</Tippy>
        {
          //<AoScore prefix={<span>Points: </span>} />
        }
        {
          //<AoStatus />
        }
      </div>
    )
  }
}
