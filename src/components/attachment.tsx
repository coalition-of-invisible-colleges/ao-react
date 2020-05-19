import React, { FunctionComponent } from 'react'
import { Link } from 'react-router-dom'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import { HudStyle } from './cardHud'
import FileViewer from 'react-file-viewer'
import path from 'path'

interface AoAttachmentProps {
  taskId?: string
  hudStyle: HudStyle
}

const testfile = '../assets/images/buddadoge.svg'
const testtype = 'png'

const AoAttachment: FunctionComponent<AoAttachmentProps> = observer(
  ({ taskId, hudStyle }) => {
    let meme = aoStore.memeById.get(taskId)
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
