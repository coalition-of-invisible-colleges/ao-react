const express = require('express')
const router = express.Router()
const resourceCheck = require('./resourceCheck')

router.use('/fobtap', resourceCheck)

router.use('/fobtap', (req, res)=> {
    res.end('fobtap not handled')
})

module.exports = router
