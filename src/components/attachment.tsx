import React from 'react'
import { Link } from 'react-router-dom'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore, { Task } from '../client/store'
import { HudStyle } from './cardHud'
import FileViewer from 'react-file-viewer'
import path from 'path'
import api from '../client/api'
import render from 'render-media'
import From from 'from2'
import dataUriToBuffer from 'data-uri-to-buffer'
import mime from 'mime-types'

interface Props {
  taskId: string
  hudStyle: HudStyle
}

interface State {
  blob?
  mimeType?: string
  downloadPath?: string
}

@observer
export default class AoAttachment extends React.Component<Props, State> {
  // private attachmentRef = React.createRef<HTMLImageElement>()

  constructor(props) {
    super(props)
    this.state = {}
    // this.loadMeme = this.loadMeme.bind(this)
    // this.setFile = this.setFile.bind(this)
    // this.download = this.download.bind(this)

    const meme = aoStore.memeById.get(props.taskId)
    if (meme) {
      let mimeType = mime.lookup(meme.filetype)

      console.log(
        'looked up filetype ',
        meme.filetype,
        ' and got MIME type: ',
        mimeType
      )
      this.state = { mimeType }
    }
  }

  // componentDidMount() {
  //   this.loadMeme()
  // }

  componentDidUpdate(prevProps) {
    if (this.props.taskId !== prevProps.taskId) {
      const meme = aoStore.memeById.get(this.props.taskId)
      if (meme) {
        let mimeType = mime.lookup(meme.filetype)

        console.log(
          'looked up filetype ',
          meme.filetype,
          ' and got MIME type: ',
          mimeType
        )
        this.setState({ mimeType })
      }
    }
  }

  // loadMeme() {
  //   const card = aoStore.hashMap.get(this.props.taskId)
  //   if (!card) {
  //     this.setState({ blob: null })
  //     return
  //   }

  //   const meme = aoStore.memeById.get(card.taskId)
  //   if (!meme) {
  //     this.setState({ blob: null })
  //     return
  //   }
  //   const mimeType = mime.lookup(meme.filetype)

  //   this.setState({
  //     mimeType
  //     // blob: res.body
  //   })

  //   api.fetchMeme(meme.hash).then(res => {
  //     console.log('res is ', res, ' and typeof res is ', typeof res)
  //     console.log('type is ', res.body.type)
  //     console.log(
  //       'res as blob is ',
  //       res.body,
  //       ' and typeof blob is ',
  //       typeof res.body
  //     )
  //     this.setState({
  //       downloadPath: '/download/' + meme.hash

  //       // blob: res.body
  //     })
  //     let blob = res.body
  //     blob = blob.slice(0, blob.size, mimeType)
  //     var objectURL = URL.createObjectURL(res.body)
  //     console.log('blob is now', blob)
  //     this.attachmentRef.current.src = objectURL
  //     // this.attachmentRef.current.src = imageUrl
  //     // var reader = new FileReader()
  //     // reader.onload = this.setFile
  //     // reader.readAsDataURL(res.body)
  //   })
  // }

  // setFile(e) {
  //   // convert base64 to raw binary data held in a string
  //   // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  //   // let dataURI = e.target.result
  //   // var byteString = atob(dataURI.split(',')[1])

  //   // // separate out the mime component
  //   // var mimeString = dataURI
  //   //   .split(',')[0]
  //   //   .split(':')[1]
  //   //   .split(';')[0]
  //   // console.log('mimeString is ', mimeString)
  //   // // write the bytes of the string to an ArrayBuffer
  //   // var ab = new ArrayBuffer(byteString.length)

  //   // // create a view into the buffer
  //   // var ia = new Uint8Array(ab)

  //   // // set the bytes of the buffer to the correct values
  //   // for (var i = 0; i < byteString.length; i++) {
  //   //   ia[i] = byteString.charCodeAt(i)
  //   // }

  //   // // write the ArrayBuffer to a blob, and you're done
  //   // var blob = new Blob([ab], { type: this.state.mimeType })
  //   // console.log('blob is ', blob)
  //   // var urlCreator = window.URL || window.webkitURL
  //   // console.log('urlCreator is ', urlCreator)
  //   // var imageUrl = urlCreator.createObjectURL(blob)
  //   // console.log('imageUrl is ', imageUrl)
  //   // this.attachmentRef.current.src = imageUrl
  //   // this.setState({ blob })
  //   // return blob

  //   console.log('DataURI:', e.target.result)
  //   console.log('type is, ', e.target.result.type)
  //   const base64Content = e.target.result

  //   // base64 encoded data doesn't contain commas
  //   let base64ContentArray = base64Content.split(',')

  //   // base64 content cannot contain whitespaces but nevertheless skip if there are!
  //   let mimeType = base64ContentArray[0].match(
  //     /[^:\s*]\w+\/[\w-+\d.]+(?=[;| ])/
  //   )[0]

  //   // base64 encoded data - pure
  //   let base64Data = base64ContentArray[1]

  //   // Inject our hardcoded MIME type from the card, since nginx doesn't forward it correctly
  //   const newDataURI = 'data:' + this.state.mimeType + ';base64,' + base64Data
  //   console.log('newDataURI:', newDataURI)

  //   this.setState({
  //     blob: newDataURI
  //   })
  //   // var buffer = dataUriToBuffer(e.target.result)

  //   // var file = {
  //   //   name: 'attachment.jpg',
  //   //   createReadStream: function(opts) {
  //   //     if (!opts) opts = {}
  //   //     return From([
  //   //       buffer.slice(opts.start || 0, opts.end || buffer.length - 1)
  //   //     ])
  //   //   }
  //   // }

  //   // render.append(file, this.attachmentRef.current, function(err, elem) {
  //   //   if (err) return console.error(err.message)

  //   //   console.log(elem) // new element
  //   // })
  // }

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
    // element only attaches when meme downloads
    // return <div ref={this.attachmentRef} />

    if (!this.props.taskId || !this.state.mimeType) {
      return null
    }

    const meme = aoStore.memeById.get(this.props.taskId)
    if (!meme) {
      return null
    }

    switch (this.state.mimeType) {
      case 'video/mp4':
      case 'video/ogg':
      case 'video/webm':
        return <video src={'/memes/' + meme.filename} controls />
      case 'image/jpeg':
      case 'image/jpg':
      case 'image/png':
      case 'image/gif':
      default:
        return (
          <img
            src={'/memes/' + meme.filename}
            // ref={this.attachmentRef}
            alt="attachment"
          />
        )
    }
  }
}
