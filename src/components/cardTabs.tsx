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
  stash,
  menu
}

type CardEdge =
  | 'top'
  | 'right'
  | 'bottom'
  | 'left'

export interface CardTab {
  id?: CardTabId
  icon: string
  tooltip: string
  content?: JSX.Element | Array<JSX.Element>
  onClick?: (event) => void
	onDrop?: (from: CardLocation) => void
	isSelected?: boolean
	edge?: CardEdge
}

export function AoCardTab(props: CardTab) {
  const tab = props.id
  const icon = props.icon
  const tooltip = props.tooltip
  
  let showGhostly = !props.content && tab !== CardTabId.menu
  if(Array.isArray(props.content) && !props.content.some(content => !!content)) {
    showGhostly = true
  }
  let content = props.content
  let contentAfter
  if(Array.isArray(content)) {
    contentAfter = content[1]
    content = content[0]
  }
  const onDrop = props.onDrop
  const renderedTab =
    <div className={"cardTab" + (props.isSelected ? ' selected' : '') + (tab !== undefined ? ' ' + CardTabId[tab].toString() + 'TabButton' : '') + (showGhostly ? ' ghostly' : '')}
        onClick={props.onClick}>
      {content && <div className='tabSummary'>{content}</div>}
      <object type="image/svg+xml" data={icon} />
      {contentAfter && <div className='tabSummary'>{contentAfter}</div>}
    </div>
  return <Tippy
    zIndex={4}
    theme="translucent"
    content={tooltip}
    delay={[625, 200]}
    placement={props.edge === 'left' ? 'right' : 'left'}>
      <div className={props.edge ? ' ' + props.edge + 'Edge' : ''}>
        {onDrop ? <AoDropZoneSimple onDrop={onDrop} dropHoverMessage='Drop to prioritize'>{renderedTab}</AoDropZoneSimple> : renderedTab}
      </div>
    </Tippy>
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
  
  function toggleTab(tab: CardTabId) {
    if(tab === currentTab) {
      closeTab()
    } else {
      showTab(tab)
    } 
  }
  
  const renderedTabs = props.tabs.map((cardTab, i) => {
    const tab = cardTab.id
    const isSelected = cardTab.isSelected || tab === currentTab
    return <AoCardTab id={cardTab.id} icon={cardTab.icon} tooltip={cardTab.tooltip} content={cardTab.content} onDrop={cardTab.onDrop} isSelected={isSelected} onClick={() => toggleTab(tab)}/>
  })
  
  return <div className="cardTabs">
          {renderedTabs}
        </div>
}