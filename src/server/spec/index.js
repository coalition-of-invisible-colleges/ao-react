const express = require( 'express')
const { serverState } = require( '../state')

const membersSpec = require( './membersSpec')
const tasksSpec = require( './tasksSpec')
const cashSpec = require( './cashSpec')
const resourcesSpec = require( './resourcesSpec')
const invoicesSpec = require( './invoicesSpec')
const sessionsSpec = require( './sessionsSpec')

const router = express.Router()

router.post('/events', (req, res, next) => {
    serverState.sessions.forEach(s => {
        if (s.token === req.headers.authorization){
            req.body.blame = s.ownerId
        }
    })
    next()
})

router.post('/events', membersSpec)
router.post('/events', cashSpec)
router.post('/events', tasksSpec)
router.post('/events', resourcesSpec)
router.post('/events', invoicesSpec)
router.post('/events', sessionsSpec)

module.exports = router
