import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import { Task } from '../interfaces'
import api from '../client/api'
import Gift from '../assets/images/gift.svg'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'

// Supply an onClick and isEditing externally to manage the component's isEditing status from without
// Otherwise the component self-manages (but multiple copies of the component can be editing at the same time)
interface Props {
  startingValue: string
  label: string
  onSet: (newValue: string) => void
  className?: string
  tooltip?
  children
  onClick?: (event) => void // overrides self-managed click function for starting editing
  isEditing?: boolean // overrides self-managed isEditing value
}

// This is a generalized clickable component to set a number or string property using a text input
// This component requires children; they will display as the clickable content (otherwise nothing to click)
// Click this component and it becomes a textbox with a "Set X" button
// Click the Set X button or press Enter to call the onSet callback set in props
// Press Escape to close the editing mode (this is buggy and also goes up a card level right now)
// The component self-manages its state for edit mode unless supplied an onClick and an isEditing in props
// If only one of these is supplied or their values don't make sense, the component will not make sense either
export default function AoParameterEditor(props: Props) {
  const [editing, setEditing] = React.useState(false)
  const [text, setText] = React.useState(props.startingValue)
  
  const stopEditing = () => {
    setEditing(false)  
  }
  
  React.useEffect(() => {
    aoStore.registerCloseable(stopEditing)
    return () => {
      aoStore.unregisterCloseable(stopEditing)
    }
  }, [])
  
  const startEditing = (event) => {
    event.stopPropagation()
    setEditing(true)
  }
  
  const handleFocus = (event) => event.target.select()
  
  const onChange = (event) => {
    event.stopPropagation()
    setText(event.target.value)
  }
  
  const setValue = (event) => {
    event.stopPropagation()
    props.onSet(text)
    setEditing(false)
  }
  
  const onKeyDown = (event) => {
    if (event.key === 'Enter') {
      setValue(event)
    } else if (event.key === 'Escape') {
      event.stopPropagation() // wishful thinking
      setEditing(false)
      setText('')
    }
  }
  
  const className='parameterEditor' + (props.className ? ' ' + props.className : '')
  
  if(props.isEditing || editing) {
    return (
        <div className={className}>
          {props.children}
          <input
            type="text"
            onChange={onChange}
            onKeyDownCapture={onKeyDown}
            value={text}
            size={1}
            autoFocus
            onFocus={handleFocus}
          />
          <button type="button" onClick={setValue}>
            Set {props.label}
          </button>
        </div>
      )
  }
  
  const render =  <div
      onClick={props.onClick || startEditing}
      className={className}>
      {props.children}
    </div>
      
  if(props.tooltip) {
    return <Tippy
    zIndex={4}
    theme="translucent"
    content={
      props.tooltip
    }
    delay={[450, 200]}>
     {render}
  </Tippy>
  }
  
  return render
}
