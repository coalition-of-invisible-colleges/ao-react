import * as React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore, { Task } from '../client/store'
import AoStack from './stack'
import AoPopupPanel from './popupPanel'

interface State {}

@observer
export default class AoChanges extends React.Component<{}, State> {
  constructor(props) {
    super(props)
    makeObservable(this)
    this.state = {
      sort: 'age',
    }
  }
}
