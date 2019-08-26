import express from 'express'
import path from 'path'
import bodyParser from 'body-parser'
import state from './state'
import spec from './spec'
import fobtap from './fobtap'
import { serverAuth } from './auth'
import { lightningRouter } from './lightning'
import publicAccess from './publicAccess'

module.exports = function applyRouter(app){

    app.use(express.static(path.join(__dirname, '../../dist')))
    app.use(express.static(path.join(__dirname, '../../public')))

    app.get('/*', (req, res) => {
        res.sendFile(path.join(__dirname, '../../dist/index.html'))
    })

    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({
        extended: true
    }))

    app.use(publicAccess)

    app.use(serverAuth) // below here requires auth token

    app.use(lightningRouter)
    app.use(spec)   // handles event creation
    app.use(fobtap) // handles rfid scan devices

    app.post('/state', (req, res) => {
        res.json(state.pubState)
    })
}
