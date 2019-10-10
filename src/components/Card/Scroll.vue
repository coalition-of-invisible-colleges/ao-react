<template lang='pug'>

.scroll(v-if='!($store.state.upgrades.mode === "doge" && this.$router.currentRoute.path === "/front")')
    div(v-if='inId'  :id='uuid')
        img.scrolly(src='../../assets/images/downboatwhite.svg'  class='upboat')
    div(v-else)
        img(v-if='!isCared'  src='../../assets/images/garbage.svg').scrolly
</template>

<script>

import calculations from '../../calculations'
import FormBox from '../slotUtils/FormBox'
import SoundFX from '../../modules/sounds'
import uuidv1 from 'uuid/v1'
import Hammer from 'hammerjs'
import Propagating from 'propagating-hammerjs'

export default {
    props: ['b', 'inId'],
    data(){
        return {
            uuid: uuidv1(),
        }
    },
    mounted() {
        console.log("this.uuid is", this.uuid)
        let el = document.getElementById(this.uuid)
        if(!el) return
        console.log("el is", el)
        let mc = Propagating(new Hammer.Manager(el))

        let Tap = new Hammer.Tap({ time: 400 })
        mc.add(Tap)
        mc.on('tap', (e) => {
            if(this.inId) {
                this.canIt()
            } else {
                rollsafeIt()
            }
            e.stopPropagation()
        })

        let Press = new Hammer.Press({ time: 400 })
        mc.add(Press)
        mc.on('press', (e) => {
            SoundFX.playBoatCapsize()
            this.$router.push('/archive')
            window.scrollTo(0, 0)
            e.stopPropagation()
        })

        console.log("refs is", this.$refs)
    },
    computed: {
        isCared(){
            return this.b.deck.length > 0 || this.b.guild || calculations.calculateTaskPayout(this.b) > 0.1
        }
    },
    methods: {
        rollsafeIt(){
            SoundFX.playBoatCapsize()
            this.$store.dispatch("makeEvent", {
                type: 'task-de-sub-tasked',
                taskId: this.inId,
                subTask: this.b.taskId,
            })
        },
        canIt(){
            SoundFX.playBoatCapsize()
            this.$store.dispatch("makeEvent", {
                type: 'task-removed',
                taskId: this.b.taskId,
            })
        }
    },
}

</script>

<style lang="stylus" scoped>

@import '../../styles/colours';
@import '../../styles/skeleton';
@import '../../styles/grid';
@import '../../styles/button';

.count
    float: right

.activated
    border-style: solid
    border-width: thick
    border-color: white

.upgrade
    height: 3em

.task
    color: white
    margin:10px 0
    padding:20px

.row
    width: 100%
    .mainColumn
      width:calc(100% - 75px - 4%)
    .secondaryColumn
      width:75px
      button
        height:75px

.btn
    width:100%
    margin-top: 2em
    max-height: 3em

select
    background-color: lightteal

select.form-control
    color: black

.curs
    cursor: pointer;

label
    color: black
    text-align: center
    padding: 0
    margin-bottom: -50px

.scrolly
    position: absolute
    left: 0.5em
    bottom: 0.5em
    height: 1.3em
    cursor: pointer

</style>
