import React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'

import FileType from 'file-type/browser'

async function fetchMeme(hash) {
  const blob = await api.fetchMeme(hash)
  const fileType = await FileType.fromBlob(blob)

  return { fileType, data: blob }
}

interface Props {
  taskId: string
  inId?: string
  onNextTrack?: (taskId: string) => void
}

interface State {
  data?
  fileType?
  blob?
  mimeType?: string
  downloadPath?: string
}

@observer
export default class AoAttachment extends React.Component<Props, State> {
  private audioRef = React.createRef<HTMLAudioElement>()

  constructor(props) {
    super(props)
    this.state = {}
    this.loadMeme = this.loadMeme.bind(this)

    const meme = aoStore.memeById.get(props.taskId)
    if (meme) {
      this.loadMeme()
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.taskId !== prevProps.taskId) {
      this.loadMeme()
    }
    const taskId = this.props.taskId
    const inId = this.props.inId
    if (this.audioRef.current) {
      if (this.props.inId) {
        this.audioRef.current.addEventListener('play', function () {
          console.log('track started playing: ', taskId)
          aoStore.startedPlaying(inId, taskId)
        })

        this.audioRef.current.addEventListener('ended', function () {
          console.log('track finished playing. this taskId is ', taskId)
          const nextTaskId = aoStore.nextCardWithMediaAttachment
          console.log('next taskId is', nextTaskId)
          if (nextTaskId) {
            const nextCard = aoStore.hashMap.get(nextTaskId)
            if (nextCard) {
              console.log('next track is', nextCard.name)
              const nextElement: HTMLMediaElement = document.getElementById(
                'playable-' + nextTaskId
              ) as HTMLMediaElement
              console.log('nextElement is', nextElement)
              if (!nextElement) {
                // advance play head and try again
              } else {
                nextElement.play() //dispatchEvent(new Event('play'))
              }
            }
          }
        })
      }
    }
  }

  async loadMeme() {
    const meme = aoStore.memeById.get(this.props.taskId)
    if (meme) {
      const { fileType, data } = await fetchMeme(meme.hash)
      if (fileType) {
        var urlCreator = window.URL || window.webkitURL
        var imageUrl = urlCreator.createObjectURL(data)
        this.setState({ fileType, data: imageUrl })
      }
    }
  }

  download(e) {
    const card = aoStore.hashMap.get(this.props.taskId)
    if (!card) {
      return null
    }

    let meme = aoStore.memeById.get(card.taskId)
    if (!meme) {
      return null
    }
    api.downloadMeme(meme.hash)
  }

  render() {
    if (!this.props.taskId) {
      return null
    }

    const meme = aoStore.memeById.get(this.props.taskId)
    if (!meme || !this.state.fileType || !this.state.data) {
      return null
    }

    if (this.state.fileType.mime.includes('audio')) {
      return (
        <div className="attachment">
          <audio
            src={this.state.data}
            ref={this.audioRef}
            id={'playable-' + this.props.taskId}
            controls
          />
        </div>
      )
    } else if (this.state.fileType.mime.includes('video')) {
      return (
        <div className="attachment">
          <video
            src={this.state.data}
            id={'playable-' + this.props.taskId}
            controls
          />
        </div>
      )
    } else {
      return (
        <div className="attachment">
          <img src={this.state.data} alt="attachment" />
        </div>
      )
    }
  }
}
