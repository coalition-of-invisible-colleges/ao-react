const express = require( 'express')
const path = require( 'path')
const bodyParser = require( 'body-parser')
const state = require( './state')
const spec = require( './spec')
const fobtap = require( './fobtap')
const { serverAuth } = require( './auth')
const { lightningRouter } = require('./lightning')

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

    app.use(serverAuth) // below here requires auth token
    app.use(spec)   // handles event creation
    app.use(fobtap) // handles rfid scan devices
    app.use(lightningRouter)

    app.post('/state', (req, res) => {
        res.json(state.pubState)
    })


}
