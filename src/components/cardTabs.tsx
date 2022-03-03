import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import Timecube from '../assets/images/timecube.svg'
import Chest from '../assets/images/chest.svg'
import Lilypad from '../assets/images/chatroom.svg'
import Checkbox from '../assets/images/completed.svg'
import Stash from '../assets/images/stash.svg'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'

interface Props {
  onTabShown: (tab: CardTab, wasClosed: boolean) => void
  onTabClosed?: () => void
}

export type CardTab = 
  | 'priorities'
  | 'timecube'
  | 'lightning'
  
export default function AoCardTabs(props: Props) {
  const tabs = [
    ['priorities', Checkbox, 'Priorities'],
    ['timecube', Timecube, 'Calendar'],
    ['lightning', Chest, 'Points']
  ]
  
  let [currentTab, setCurrentTab] = React.useState<CardTab>()
  
  function showTab(tab: CardTab) {
    const wasClosed = currentTab === null
    setCurrentTab(tab)
    props.onTabShown(tab, wasClosed)
  }
  
  function closeTab() {
    setCurrentTab(null);
    props.onTabClosed()
  }
  
  function renderTab(tab: CardTab, icon, tooltip: string) {
    return <Tippy
      zIndex={4}
      theme="translucent"
      content={tooltip}
      delay={[625, 200]}
      placement='left'>
        <div className={"cardTab" + (tab === currentTab ? ' selected' : '')} onClick={tab === currentTab ? closeTab : () => showTab(tab) }>
          <object type="image/svg+xml" data={icon} />
        </div>
      </Tippy>
  }
  
  const renderedTabs = tabs.map(tabInfo => {
    let [tab, icon, tooltip] = tabInfo
    let castedTab: CardTab = tab as CardTab
    return renderTab(castedTab, icon, tooltip)
  })
  
  return <div className="cardTabs">
          {renderedTabs}
        </div>
}