<template lang='pug'>

.totop(v-if='this.$store.state.context.action === this.b.taskId')
    .six.grid
        button.accept(@click='claim')
            img.arrow.fr(src='../../assets/images/buddadoge.svg')
            span complete
    .six.grid
        button.dontaccept(@click='refocus')
            img.arrow.fl(src='../../assets/images/buddadoge.svg')
            span refocus
    .clearboth
</template>

<script>

import request from 'superagent'
import Current from '../Resources/Current'
import SoundFX from '../../utils/sounds'

export default {
    props: ['b', 'inId'],
    components: { Current },
    methods: {
        claim(){
            SoundFX.playTickMark()
            this.$store.dispatch("makeEvent", {
                type: 'task-claimed',
                taskId: this.b.taskId,
                memberId: this.$store.getters.member.memberId,
                notes: ''
            })
            this.$store.commit('setAction', false)
        },
        refocus(){
            SoundFX.playBoatCapsize()
            this.$store.dispatch("makeEvent", {
                type: 'task-refocused',
                inId: this.inId,
                taskId: this.b.taskId,
            })
            this.$store.commit('setAction', false)
        }
    },
}

</script>

<style lang='stylus'>

@import '../../styles/grid';
@import '../../styles/colours';

.row
    width: 100%

.send
    height: 1.5em

.accept, .dontaccept
    width: 100%
    background: accent5
    padding: .789em
    border-style: none
    img
        background: white
        padding: .1em
        border-radius: 3px

.arrow
    height: 3.35em

.fl
    float: left
.fr
    float: right

.totop
    z-index: 1000
    clear: both
    
.pad
    margin-top: 1em
    margin-bottom: 1em

.centered
    text-align: center

.clearboth
    clear: both
</style>
