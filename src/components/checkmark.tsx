import React, { FunctionComponent } from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore, { Task } from '../client/store'
import { TaskContext } from './taskContext'
import AoContextCard from './contextCard'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'

interface AoCheckmarkProps {
  color?: string
  onGoIn?: (event) => void
}

const AoCheckmark: FunctionComponent<AoCheckmarkProps> = observer(
  ({ color, onGoIn }) => {
    const card: Task = React.useContext(TaskContext)
    if (!card) {
      console.log('missing card in completed')
      return null
    }

    const computed = observable({
      get cardColor() {
        if (color) {
          return color
        }
        const loadedColor = card.color
        switch (loadedColor) {
          case 'red':
          case 'yellow':
          case 'green':
          case 'blue':
          case 'purple':
          case 'black':
            return loadedColor
          default:
            return ''
        }
      }
    })

    return (
      <Tippy zIndex={4} content={<AoContextCard cardStyle={'compact'} />}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 12.96459 12.96459"
          width="12.96459mm"
          height="12.96459mm"
          version="1.1"
          className={'checkmark ' + computed.cardColor}
          onDoubleClick={onGoIn}>
          <g transform="translate(178.70974,-158.92981)">
            <path
              style={{ fillOpacity: 1, strokeWidth: 0.26458335 }}
              d="m -178.70974,165.41211 v -6.4823 h 6.4823 6.48229 v 6.4823 6.48229 h -6.48229 -6.4823 z m 12.43542,0 v -5.95313 h -5.95312 -5.95313 v 5.95313 5.95312 h 5.95313 5.95312 z m -11.19527,5.51758 c -0.1,-0.1 -0.18181,-2.66229 -0.18181,-5.69397 v -5.51216 h 5.42922 5.42922 l -0.0714,5.6224 -0.0714,5.62239 -5.17599,0.0716 c -2.8468,0.0394 -5.25782,-0.0102 -5.35782,-0.11024 z m 10.13694,-5.64988 v -5.02708 h -4.89479 -4.8948 v 5.02708 5.02709 h 4.8948 4.89479 z m -6.94644,3.94367 c -0.25529,-0.44852 -0.82429,-0.95142 -1.26445,-1.11756 -0.97785,-0.3691 -0.93219,-0.99526 0.099,-1.35792 0.57383,-0.20181 0.92198,-0.16185 1.50494,0.17272 l 0.75841,0.43527 0.2913,-0.88264 c 0.66134,-2.00388 3.57415,-5.42687 4.61803,-5.42687 0.27086,0 0.14743,1.02587 -0.1452,1.20672 -0.66692,0.41218 -2.85247,4.16929 -3.30594,5.68314 -0.36623,1.22263 -0.64587,1.69396 -1.10959,1.87026 -0.88714,0.3373 -0.93324,0.31872 -1.44653,-0.58312 z m 1.78445,-1.1792 c 0.17177,-0.57457 0.57247,-1.55069 0.89044,-2.16915 0.31797,-0.61847 0.50993,-1.12448 0.42657,-1.12448 -0.0834,0 -0.51373,0.7739 -0.95636,1.71979 -0.84137,1.79797 -1.02174,1.95782 -1.52493,1.35151 -0.25862,-0.31162 -1.34665,-0.77575 -1.34665,-0.57446 0,0.25003 1.76787,1.98229 1.9592,1.91973 0.13168,-0.043 0.37996,-0.54837 0.55173,-1.12294 z"
            />
          </g>
        </svg>
      </Tippy>
    )
  }
)

export default AoCheckmark
