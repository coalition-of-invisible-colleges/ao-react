import express from 'express'
import { serverState } from '../state'

import membersSpec from './membersSpec'
import tasksSpec from './tasksSpec'
import cashSpec from './cashSpec'
import resourcesSpec from './resourcesSpec'
import invoicesSpec from './invoicesSpec'
import sessionsSpec from './sessionsSpec'

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
