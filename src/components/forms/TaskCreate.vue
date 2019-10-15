<template lang='pug'>

#createtask(ref="closeable")
    transition(name="slide-fade")
      .cc(v-show='showCreate')
          textarea#card.fwi(v-model='task.name' type='text'  :class='cardInputSty'  placeholder="idea here"  @keyup.enter.exact='createOrFindTask'  @keydown.enter.exact.prevent  @keyup.esc='closeCreate'  @input='exploring = false').paperwrapper
          img.specialoverlay
          button(@click='createOrFindTask').fwi create card
    .label
      .row.btnpanel
          div(:class='{ opaque : showCreate, btnwrapper : !showCreate }')
            button.lit(@click='switchColor("red")'  :class='{ currentColor : showCreate && task.color === "red" }').redwx.paperwrapper
              img.agedbackground
            button.lit(@click='switchColor("yellow")'  :class='{ currentColor : showCreate && task.color === "yellow" }').yellowwx.paperwrapper
              img.agedbackground
            button.lit(@click='switchColor("green")'  :class='{ currentColor : showCreate && task.color === "green" }').greenwx.paperwrapper
              img.agedbackground
            button.lit(@click='switchColor("purple")'  :class='{ currentColor : showCreate && task.color === "purple" }').purplewx.paperwrapper
              img.agedbackground
            button.lit(@click='switchColor("blue")'  :class='{ currentColor : showCreate && task.color === "blue" }').bluewx.paperwrapper
              img.agedbackground
    .scrollbarwrapper(v-show='showCreate && task.name.length >= 2 && matchCards.length > 0')
        .searchresults
            .result(v-for='t in matchCards'  @click='loadResult(t)'  :class='resultInputSty(t)') {{ t.name }}
</template>

<script>

import SharedTitle from '../slotUtils/SharedTitle'
import FormBox from '../slotUtils/FormBox'
import request from "superagent"
import SoundFX from '../../modules/sounds'

export default {
    data(){
        return {
            // currentColor: '',
            showCreate: false,
            task: {
                name: '',
                color: 'green',
            },
            swipeTimeout: 0,
            searchResults: [],
            exploring: false,
        }
    },
    components: {
        SharedTitle, FormBox
    },
    mounted() {
        var el = document.getElementById('createtask')
        var mc = new Hammer.Manager(el)

        var Swipe = new Hammer.Swipe()
        mc.add(Swipe)
        mc.on('swipeleft', (e) => {
            if(Date.now() - this.swipeTimeout > 100) {
                this.previousColor()
                this.swipeTimeout = Date.now()
            }
        });

        mc.on('swiperight', (e) => {
            if(Date.now() - this.swipeTimeout > 100) {
                this.nextColor()
                this.swipeTimeout = Date.now()
            }
        });

        mc.on('swipedown', (e) => {
            if(Date.now() - this.swipeTimeout > 100) {
                this.closeCreate()
                this.swipeTimeout = Date.now()
            }
        });

        mc.on('swipeup', (e) => {
            if(Date.now() - this.swipeTimeout > 100) {
                this.openCreate()
                this.swipeTimeout = Date.now()
            }
        });

        // terrible hack--swipes are not detected on a textarea unless this specific gesture detector is added directly on the element. then, it does a double event for some reason on this element (not the parent element). a timeout prevents the double event.
        var ca = document.getElementById('card')
        var mc2 = new Hammer.Manager(ca)
        var Swipe2 = new Hammer.Swipe()
        mc2.add(Swipe2)
        mc2.on('swipeleft', (e) => {
            if(Date.now() - this.swipeTimeout > 100) {
                this.previousColor()
                this.swipeTimeout = Date.now()
            }
        });

        mc2.on('swiperight', (e) => {
            if(Date.now() - this.swipeTimeout > 100) {
                this.nextColor()
                this.swipeTimeout = Date.now()
            }
        });

        mc2.on('swipedown', (e) => {
            if(Date.now() - this.swipeTimeout > 100) {
                this.closeCreate()
                this.swipeTimeout = Date.now()
            }
        });

        mc2.on('swipeup', (e) => {
            if(Date.now() - this.swipeTimeout > 100) {
                this.openCreate()
                this.swipeTimeout = Date.now()
            }
        });
    },
    methods: {
        switchColor(color, refocus = true){
            if (this.task.color === color){
                this.showCreate = !this.showCreate
            } else if (this.showCreate) {
                // don't close, switch
            } else {
                this.showCreate = !this.showCreate
            }
            this.task.color = color
            if(refocus) {
                setTimeout(()=>{
                    document.getElementById('card').focus()
                }, 1)
            }
        },
        resetCard(){
            console.log("resetCard, task.name is ", this.task.name)
            this.task.name = ''
            console.log("post, task.name is ", this.task.name)
        },
        subTaskTask(taskId) {
            if(this.matchCard && !this.isGrabbed(taskId)) {
              this.$store.dispatch("makeEvent", {
                  type: 'task-grabbed',
                  taskId: taskId,
                  memberId: this.$store.getters.member.memberId,
              })
            }
            this.$store.dispatch("makeEvent", {
                type: 'task-sub-tasked',
                taskId: this.taskId,
                subTask: taskId,
            })
        },
        createOrFindTask(){
            SoundFX.playPageTurn()
            let foundId = this.matchCard
            let potentialCard = this.task.name.trim()
            console.log("potentialCard is ", potentialCard)
            if(!foundId) {
                request
                    .post('/events')
                    .set('Authorization', this.$store.state.loader.token)
                    .send({
                        type: 'task-created',
                        name: potentialCard,
                        color: this.task.color,
                        deck: [this.$store.getters.member.memberId],
                        inId: this.taskId,
                    })
                    .end((err,res)=>{
                        if (err) return console.log(err);
                        console.log('created and subtasked 1shot')
                    })
            } else {
                this.subTaskTask(foundId)
            }
            this.resetCard()
        },
        // hasSubTask(taskId){
        //     return this.$store.getters.hashMap[this.taskId].subTasks.indexOf(taskId) > -1
        // },
        isGrabbed(taskId){
            return this.$store.getters.hashMap[taskId].deck.indexOf( this.$store.getters.member.memberId ) > -1
        },
        nextColor() {
            let colors = ['red', 'yellow', 'green', 'purple', 'blue']
            let color = colors.indexOf(this.task.color)
            color++
            this.switchColor(colors[color > 4 ? 0 : color], false)
        },
        previousColor() {
            let colors = ['red', 'yellow', 'green', 'purple', 'blue']
            let color = colors.indexOf(this.task.color)
            color--
            this.switchColor(colors[color < 0 ? 4 : color], false)
        },
        openCreate() {
            this.showCreate = !this.showCreate
        },
        closeCreate() {
            this.showCreate = false
        },
        resultInputSty(card) {
          return {
              redtx : card.color == 'red',
              bluetx : card.color == 'blue',
              greentx : card.color == 'green',
              yellowtx : card.color == 'yellow',
              purpletx : card.color == 'purple',
              blacktx : card.color == 'black',
          }
        },
        loadResult(t) {
            this.exploring = true
            this.task.name = t.name.trim()
            this.task.color = t.color
        }
    },
    computed: {
        taskId(){
            return this.$store.getters.contextCard.taskId
        },
        matchCard(){
            let foundId
            this.$store.state.tasks.filter(t => {
                if(t.name === this.task.name.trim()) {
                    foundId = t.taskId
                }
            })
            return foundId
        },
        matchCards() {
            // if(!this.task) return []
            // if(!this.task.name) return []
            if(this.task.name.length < 1) return []
            if(this.exploring) return this.searchResults
            let regex = new RegExp(this.task.name)
            let matches = []
            this.$store.getters.localTasks.forEach(t => {
                if(t.name === this.task.name) {
                } else if(regex.test(t.name)) {
                    matches.push(t)
                } else if(t.guild && regex.test(t.guild)) {
                    matches.push(t)
                }
            })
            this.searchResults = matches
            return matches
        },
        colorWord(){
            switch (this.task.color) {
                case "blue": return 'info'
                case "red": return 'challenge'
                case "green": return 'do'
                case "purple": return 'dream'
                case "yellow": return 'align'
                case "black": return 'bark'
            }
        },
        cardInputSty(){
            return {
                redwx : this.task.color == 'red',
                bluewx : this.task.color == 'blue',
                greenwx : this.task.color == 'green',
                yellowwx : this.task.color == 'yellow',
                purplewx : this.task.color == 'purple',
                blackwx : this.task.color == 'black',
            }
        },
    }
}

</script>

<style lang='stylus' scoped>

@import '../../styles/colours'
@import '../../styles/grid'
@import '../../styles/skeleton'
@import '../../styles/button'
@import '../../styles/breakpoints'

#card
    margin-bottom: 0

#createtask
  width: fit-content
  background-color: rgba(51, 51, 51, 0.3)
  color: accent1
  margin: 0 auto 0 auto
  text-align: center
  padding: 0.5em
  position: relative
  left: 1em
  z-index: 149

button
    background: green
    border-color: rgba(0, 0, 0, 0.4)
    margin-bottom: 0.5em
    margin-top: 0.2em

.lit
    opacity: 0.69

.btnwrapper:hover > .lit
    opacity: 0.83

.btnwrapper:hover > .lit:hover
    opacity: 1

.opaque > button.lit
    opacity: 1

.onetime
    display: inline

.color
    height: 2.5em
    color: white
    padding: 1em

.colorlabel
    font-size: 1.6em
    color: white
    align-content: center;
    text-align: center

@media (max-width: breakpoint)
    .colorlabel
        span
            display: none

#bark
    float: right
    height: 3em

.fwi
    width: 100%
    text-align: center
    color: white
    max-width: 20.225425em

.specialoverlay
    background-image: url('../../assets/images/paper.jpg')
    background-repeat: no-repeat
    background-position: center center
    background-size: cover
    top: 0
    left: 0
    right: 0
    bottom: 0
    width: 20.225425em
    pointer-events: none
    height: 12.5em
    z-index: 10
    position: absolute
    opacity: 0.13

.tealbk
    background: green

.cc
    position: relative

p
    font-size: 1.3em
    color: accent1

.upgradeimg
   height: 3em

.btnpanel
    button
        cursor: pointer
        min-height: 2.5em
        width: 4.045085em
        margin: 0

.btnwrapper
    width: 100%
    display: block
    text-align: center

.slide-fade-enter-active {
  transition: all .6s ease;
}
.slide-fade-leave-active {
  transition: all .4s ease;
}
.slide-fade-enter {
  // transform: translateY(-400px);
  opacity: 0;
}
.slide-fade-leave-to {
 // transform: translateY(-400px);
  opacity: 0;
}

.label
    color: white
    font-weight: bolder

textarea
    padding-top: 1em
    border-color: rgba(0, 0, 0, 0.4)
    height: 12.5em
    padding-top: 5.5em

.centr
    text-align: center

.paperwrapper
    position: relative

.agedbackground
    background-image: url('../../assets/images/paper.jpg')
    background-repeat: no-repeat
    background-position: center center
    background-size: cover
    top: 0
    left: 0
    bottom: 0
    right: 0
    position: absolute
    width: 100%
    height: 100%
    pointer-events: none
    opacity: 0.2

.currentColor
    opacity: 1

.closeit
    position: fixed
    width: 100%
    height: 90%
    background-color: rgba(22, 22, 22, 0.2)
    z-index: 148
    top: 0
    left: 0
    margin: 0
    padding: 0

.scrollbarwrapper
    width: 20em
    height: calc(100% - 2em)
    position: fixed
    top: 0
    left: 22em
    background: rgba(22, 22, 22, 0.8)
    padding: 1em 0
    border-radius: 20px

.searchresults
    overflow: auto
    color: white
    font-size: 1.1em
    height: 100%
    padding: 0 1em
    word-wrap: break-word

::-webkit-scrollbar
    background-color: rgba(22, 22, 22, 0.4)

::-webkit-scrollbar-thumb
    background-color: rgba(89, 89, 89, 0.4)

::-webkit-scrollbar-thumb:hover
    background-color: rgba(255, 255, 255, 0.75)

.result
    margin-bottom: 0.15em
    cursor: pointer
</style>
