import React from 'react'
import { observer } from 'mobx-react'
import Tippy, { TippyProps } from '@tippyjs/react'

export type LazyTippyProps = TippyProps

interface State {
  mounted?: boolean
}

const LazyTippy: React.FunctionComponent<LazyTippyProps> = props => {
  const [mounted, setMounted] = React.useState(false)

  const lazyPlugin = {
    fn: () => ({
      onShow: () => setMounted(true),
      onHidden: () => setMounted(false)
    })
  }

  const computedProps = { ...props }

  computedProps.plugins = [lazyPlugin, ...(props.plugins || [])]

  if (props.render) {
    const render = props.render // let TypeScript safely derive that render is not undefined
    computedProps.render = (...args) => (mounted ? render(...args) : '')
  } else {
    computedProps.content = mounted ? props.content : ''
  }

  return <Tippy {...computedProps} />
}

export default LazyTippy
