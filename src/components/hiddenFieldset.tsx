import * as React from 'react'

interface Props {
	heading: string
	startOpen?: boolean
	className?: string
	children?: React.ReactElement<any, any> | React.ReactElement<any, any>[]
}

export default function AoHiddenFieldset(props: Props) {
	let [open, setOpen] = React.useState(props.startOpen)
	
	function toggleOpen() {
    setOpen(!open)
  }
  
	if(!open) {
		return <div className={"legendAction" + (props.className ? ' ' + props.className : '')} onClick={toggleOpen}>{props.heading} &#8964;</div>
	}
	
	return <fieldset className={props.className ? props.className : undefined}>
      <legend className='clickable' onClick={toggleOpen}>{props.heading} &#8963;</legend>
      {props.children}
    </fieldset>
}