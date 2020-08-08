import React, { FunctionComponent } from 'react'
import { Link } from 'react-router-dom'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore, { Task } from '../client/store'
import { TaskContext } from './taskContext'
import { HudStyle } from './cardHud'
import FileViewer from 'react-file-viewer'
import path from 'path'

interface AoAttachmentProps {
  hudStyle: HudStyle
}

const testfile = '../assets/images/buddadoge.svg'
const testtype = 'png'

const AoAttachment: FunctionComponent<AoAttachmentProps> = observer(
  ({ hudStyle }) => {
    const card: Task = React.useContext(TaskContext)

    let meme = aoStore.memeById.get(card.taskId)
    if (!meme) {
      return null
    }
    console.log('aoAttachment meme is ', meme)
    // if it's an image, display it
    // otherwise, display a download button
    return (
      <div>
        <Link to={'/meme/' + meme.hash}>Attachment</Link>
        <FileViewer fileType={'jpg'} filePath={'/meme/' + meme.hash} />
      </div>
    )
  }
)

export default AoAttachment
