import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'
import { CardLocation } from '../cardTypes'
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
      return null
    }

    const fromLocation: CardLocation = { 
      taskId: this.props.taskId,
      inId: this.props.inId,
      zone: 'subTasks' // todo: make into callback or pass correct fromLocation down
    }
    const toLocation: CardLocation = {
      taskId: this.props.taskId,
      inId: this.props.inId,
      zone: 'priorities',
    }
    api.playCard(fromLocation, toLocation)
  }

  render() {
    return (<Tippy
        zIndex={4}
        theme="translucent"
        content="Prioritize card"
        delay={[625, 200]}
        placement="left-start">
        <div className="boat" onClick={this.upboat}>
          <img src={Boat} />
        </div>
      </Tippy>);
  }
}
