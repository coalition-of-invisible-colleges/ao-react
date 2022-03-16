import * as React from 'react'
import AoDropZoneSimple from './dropZoneSimple'
import { CardLocation } from '../cardTypes'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'
  
interface Props {
  tabs: CardTab[]
  onTabShown: (tab: CardTabId, wasClosed: boolean) => void
  onTabClosed?: () => void
}

export enum CardTabId {
  priorities = 1,
  timecube,
  lightning,
}

export interface CardTab {
  id: CardTabId
  icon: string
  tooltip: string
  content?: JSX.Element | Array<JSX.Element>
	onDrop?: (from: CardLocation) => void
}
  
export default function AoCardTabs(props: Props) {
  let [currentTab, setCurrentTab] = React.useState<CardTabId>()
  
  function showTab(tab: CardTabId) {
    const wasClosed = currentTab === null
    setCurrentTab(tab)
    props.onTabShown(tab, wasClosed)
  }
  
  function closeTab() {
    setCurrentTab(null);
    props.onTabClosed()
  }

  const renderedTabs = props.tabs.map((cardTab, i) => {
    const tab: CardTabId = cardTab.id
    const icon = cardTab.icon
    const tooltip = cardTab.tooltip
    let content = cardTab.content
    let contentAfter
    if(Array.isArray(content)) {
      contentAfter = content[1]
      content = content[0]
    }
    const onDrop = cardTab.onDrop
    const renderedTab =
      <div className={"cardTab" + (tab === currentTab ? ' selected' : '')}
          onClick={tab === currentTab ? closeTab : () => showTab(tab) }>
        {content && <div className='tabSummary'>{content}</div>}
        <object type="image/svg+xml" data={icon} />
        {contentAfter && <div className='tabSummary'>{contentAfter}</div>}
      </div>
    return <Tippy
      zIndex={4}
      theme="translucent"
      content={tooltip}
      delay={[625, 200]}
      placement='left'>
        <div>
          {onDrop ? <AoDropZoneSimple onDrop={onDrop} dropHoverMessage='Drop to prioritize'>{renderedTab}</AoDropZoneSimple> : renderedTab}
        </div>
      </Tippy>
  })
  
  return <div className="cardTabs">
          {renderedTabs}
        </div>
}