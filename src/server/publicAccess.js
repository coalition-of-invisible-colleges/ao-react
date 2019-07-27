import express from 'express'
import _ from 'lodash'
import state from './state'
import events from './events'
import utils from './spec/utils'

const router = express.Router()

let redwx = [248,104,95]
let greenwx = [76,175,80]
let bluewx = [49,169,169]
let purplewx = [168,124,223]
let yellowwx = [247,164,0]

const shows = require("./opc_controllers/shows.js");
const robShows = require("./opc_controllers/robshows.js");
const writer = require("./opc_controllers/alphabet.js");

let show = null
let stopper = null

const magenta = [232,33,124]
const blue = [93,225,255]
const purple = [177,38,255]
const green = [65,230,20]
const yellow = [223,230,0]
const white = [255,255,255]

const liiloo = [magenta,blue,purple, white]

const rootGuilds = [{
    taskId: 'a1',
    guild: "D",
    subTasks: [ ],
    deck: [ ],
    name: " ",
    book: {},
    color: 'green'
}, {
    taskId: 'a2',
    guild: "C",
    subTasks: [ ],
    deck: [ ],
    name: " ",
    book: {},
    color: 'yellow'
},{
    taskId: 'a3',
    guild: "T",
    subTasks: [ ],
    deck: [ ],
    name: " ",
    book: {},
    color: 'red'
},{
    taskId: 'a4',
    guild: "R",
    subTasks: [ ],
    deck: [ ],
    name: " ",
    book: {},
    color: 'purple'
},{
    taskId: 'a5',
    guild: "L",
    subTasks: [ ],
    deck: [ ],
    name: " ",
    book: {},
    color: 'blue'
}]

const rootState = {
  recent: [],
  sessions: [],
  members: [],
  tasks: rootGuilds.slice(),
  resources: [],
  cash: {
    currency: 'CAD',
    cash: 0,
    spot: 0,
    rent: 0,
    variable: 0,
    cap: 75,
    pay_index: 0,
    usedTxIds: [],
    outputs: [],
    channels: [],
    info: {},
  },
}

function setStop(){
    stopper = setTimeout( ()=> {
      if (show){
          try {
              clearInterval(show)
              show = shows.rainbowShow(liiloo, .69, 1111)
          } catch (err) {

          }
      }
    }, 29000)
}


let dctrlState = _.clone(rootState)
let pubGuilds = ["D", "C", "T", "R", "L"]
function getDctrlState(){
    // let
    let dctrlState = _.clone(rootState)
    let careAbout = []

    state.pubState.tasks.slice().forEach(t => {
        let index = pubGuilds.indexOf(t.guild)
        if (index > -1){
            t.subTasks.forEach(n => careAbout.push(n))
            t.priorities.forEach(n => careAbout.push(n))
            t.completed.forEach(n => careAbout.push(n))
            t.deck = []
            dctrlState.tasks[index] = t
        }
    })


    state.pubState.tasks.slice().forEach(t => {
        if (careAbout.indexOf(t.taskId) > -1){
            t.subTasks.forEach(n => careAbout.push(n))
            t.priorities.forEach(n => careAbout.push(n))
            t.completed.forEach(n => careAbout.push(n))
        }
    })

    state.pubState.tasks.slice().forEach(t => {
        if (careAbout.indexOf(t.taskId) > -1){
            let newT = _.clone(t)
            newT.deck = []
            dctrlState.tasks.push(newT)
        }
    })

    console.log("now care about", careAbout.length)
}

setInterval(getDctrlState, 450000)

setTimeout(getDctrlState, 5555)

router.put('/dctrl', (req, res) => {
    console.log('serving pubstate from dctrl', dctrlState.tasks.length)
    res.json(dctrlState)

})

router.put('/sidewalk',(req, res) => {
    if (stopper){
        clearInterval(show)
    }

    if (show){
        clearInterval(show)
    }

    switch( req.body.show ) {
        case 'rainbow':
            show = robShows.grad_long()
            break
        case 'banner':
            show = writer.longBanner(req.body.banner.toUpperCase(), liiloo)
            setStop()
            break
        case 'chill':
            show = shows.rainbowShow(liiloo, .69, 1111)
            break
        case 'dna':
            show = shows.sinShow(liiloo)
            setStop()
            break
        case 'color':
            switch (req.body.color){
                case 'red':
                    shows.fullFillWrite(redwx, 0.837)
                    break
                case 'blue':
                    shows.fullFillWrite(bluewx, 0.837)
                    break
                case 'green':
                    shows.fullFillWrite(greenwx, 0.837)
                    break
                case 'yellow':
                    shows.fullFillWrite(yellowwx, 0.837)
                    break
                case 'purple':
                    shows.fullFillWrite(purplewx, 0.837)
                    break
                case 'black':
                    shows.fullFillWrite([0,0,0], 0.837)
                    break
            }
            break
        case 'crazy':
            show = shows.flashShow(liiloo, .19, 111)
            setStop()
            break
    }
})


module.exports = router
