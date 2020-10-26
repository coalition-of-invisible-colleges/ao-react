import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'
import AoHub from './hub'
import AoControls from './controls'
import AoDock from './dock'
import AoGifts from './gifts'
import AoMissions from './missions'
import AoMembers from './members'
import AoCalendar from './calendar'
import AoProposals from './proposals'
import AoSearch from './search'
import AoTickerHud from './tickerHud'
import AoScore from './score'
import AoUsername from './username'
import AoPassword from './password'
import AoFob from './fob'
import AoVolume from './volume'
import AoPopupPanel from './popupPanel'
import AoShitposts from './shitposts'
import MemberIcon from '../assets/images/loggedWhite.svg'
import Badge from '../assets/images/badge.svg'
import MagnifyingGlass from '../assets/images/search.svg'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'

interface State {
  theme: number
}

@observer
class MainMenu extends React.PureComponent<{}, State> {
  constructor(props) {
    super(props)
    this.state = { theme: 1 }
  }

  changeTheme = () => {
    if (this.state.theme == 3) {
      this.setState({ theme: 1 })
      document.body.className = 'theme-1'
    } else {
      const newTheme = this.state.theme + 1
      document.body.className = 'theme-' + newTheme
      this.setState({ theme: newTheme })
    }
  }

  onLogout = () => {
    api.logout()
    console.log('logged out', aoStore.state.loggedIn)
  }

  render() {
    return (
      <div id={'mainMenu'}>
        <AoUsername />
        <AoPassword />
        <AoFob />
        <AoVolume />
        <div onClick={this.changeTheme} id={'themer'} className={'action'}>
          Next Theme
        </div>
        <div onClick={this.onLogout} id="logout" className={'action'}>
          Log Out
        </div>
      </div>
    )
  }
}

@observer
export default class AoHud extends React.Component<{}, undefined> {
  private searchRef = React.createRef<AoSearch>()

  constructor(props) {
    super(props)
    this.focusSearchbox = this.focusSearchbox.bind(this)
  }

  focusSearchbox() {
    this.searchRef.current.focus()
  }

  render() {
    return (
      <div id="hud">
        <Tippy
          content={<MainMenu />}
          interactive={true}
          trigger={'click'}
          placement={'top-end'}>
          <div id={'mainMenuButton'}>&#x22EE;</div>
        </Tippy>
        <AoHub />
        <AoControls />
        <AoDock />
        <AoGifts />
        <div id="missions">
          <AoPopupPanel
            iconSrc={Badge}
            tooltipText={'Missions Index'}
            tooltipPlacement={'right'}
            panelPlacement={'right'}>
            <AoMissions />
          </AoPopupPanel>
        </div>
        <div id={'members'}>
          <AoPopupPanel
            iconSrc={MemberIcon}
            tooltipText={'Members'}
            tooltipPlacement={'right'}
            panelPlacement={'right'}>
            <AoMembers />
          </AoPopupPanel>
        </div>
        <AoCalendar />
        <AoProposals />
        <div id={'search'}>
          <AoPopupPanel
            iconSrc={MagnifyingGlass}
            tooltipText={'Search'}
            tooltipPlacement={'top'}
            panelPlacement={'top'}
            onShown={this.focusSearchbox}>
            <AoSearch ref={this.searchRef} />
          </AoPopupPanel>
        </div>
        <AoTickerHud />
        <AoShitposts />
        <AoScore prefix={<span>Score: </span>} />
      </div>
    )
  }
}
