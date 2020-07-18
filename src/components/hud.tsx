import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore, { AoState } from '../client/store'
import api from '../client/api'
import AoMembers from './members'
import AoHub from './hub'
import AoCalendar from './calendar'
import AoMissions from './missions'
import AoSearch from './search'
import AoScore from './score'
import AoStatus from './status'
import AoServerName from './serverName'
import AoUsername from './username'
import AoPassword from './password'
import AoVolume from './volume'
import AoPopupPanel from './popupPanel'
import AoReturnPile from './returnPile'
import MemberIcon from '../assets/images/loggedWhite.svg'
import Badge from '../assets/images/badge.svg'
import Timecube from '../assets/images/timecube.svg'
import MagnifyingGlass from '../assets/images/search.svg'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'

const MainMenu: React.FunctionComponent<{}> = () => {
  const [theme, setTheme] = React.useState(1)

  const changeTheme = () => {
    if (theme == 3) {
      setTheme(1)
      document.body.className = 'theme-1'
    } else {
      const newTheme = theme + 1
      document.body.className = 'theme-' + newTheme
      setTheme(newTheme)
    }
  }

  const onLogout = () => {
    api.logout()
    console.log('logged out', aoStore.state.loggedIn)
  }

  return (
    <div id={'mainMenu'}>
      <AoServerName />
      <AoUsername />
      <AoPassword />
      <AoVolume />
      <div onClick={changeTheme} id={'themer'} className={'action'}>
        Next Theme
      </div>
      <div onClick={onLogout} id="logout" className={'action'}>
        Log Out
      </div>
    </div>
  )
}

@observer
export default class AoHud extends React.Component<{}, undefined> {
  private searchRef = React.createRef<AoSearch>()

  constructor(props) {
    super(props)
  }

  render() {
    return (
      <React.Fragment>
        <Tippy
          content={<MainMenu />}
          interactive={true}
          trigger={'click'}
          placement={'top-end'}>
          <div id={'mainMenuButton'}>&#x22EE;</div>
        </Tippy>
        <AoHub />
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
        <div id={'calendar'}>
          <AoPopupPanel
            iconSrc={Timecube}
            tooltipText={'Calendar'}
            tooltipPlacement={'right'}
            panelPlacement={'right'}>
            <AoCalendar />
          </AoPopupPanel>
        </div>
        <div id={'search'}>
          <AoPopupPanel
            iconSrc={MagnifyingGlass}
            tooltipText={'Search'}
            tooltipPlacement={'right-end'}
            panelPlacement={'right-end'}
            onShown={() => this.searchRef.current.focus()}>
            <AoSearch ref={this.searchRef} />
          </AoPopupPanel>
        </div>
        <AoReturnPile />
        <AoScore />
      </React.Fragment>
    )
  }
}
