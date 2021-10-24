import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'
import Boat from '../assets/images/boat.svg'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'

interface Props {
  taskId: string
  inId: string
}

@observer
export default class AoBoat extends React.PureComponent<Props> {
  constructor(props) {
    super(props)
    this.upboat = this.upboat.bind(this)
  }

  upboat(event) {
    event.stopPropagation()
    const card = aoStore.hashMap.get(this.props.taskId)
    if (!card) {
      return
    }

    if (!card.deck.find(tId => tId === this.props.taskId)) {
      api.grabCard(this.props.taskId).then(res => {})
    }

    api.prioritizeCard(this.props.taskId, this.props.inId)
  }

  render() {
    return (
      <Tippy
        zIndex={4}
        theme="translucent"
        content="Prioritize card"
        delay={[625, 200]}
        placement="left-start">
        <div className="boat" onClick={this.upboat}>
          <img src={Boat} />
        </div>
      </Tippy>
    )
  }
}
