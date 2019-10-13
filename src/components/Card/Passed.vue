
<template lang='pug'>

div.totop(v-if='b.passed.length > 0')
    div(@click='toggleBird')
        .singlebird(v-if='!$store.state.upgrades.bird')
            .row.pad.centered
                img.send(src='../../assets/images/birdbtn.svg')
                span {{ b.passed.length}}
        template(v-else   v-for='n in b.passed'  @click='toggleBird')
            .row.pad.centered
                current(:memberId='n[0]')
                img.send(src='../../assets/images/birdbtn.svg')
                current(:memberId='n[1]')
    .row.pad(v-if='toMe.length > 0')
       .six.grid
           button.accept(@click='accept')
               img.arrow.fr(src='../../assets/images/buddadoge.svg')
               span I Accept
       .six.grid
           button.dontaccept(@click='refuse')
               img.arrow.fl(src='../../assets/images/buddadoge.svg')
               span I Do Not Accept
</template>

<script>

import request from 'superagent'
import Current from '../Resources/Current'

export default {
    props: ['b'],
    components: { Current },
    methods:{
        toggleBird(){
            console.log('toggle trig')
            this.$store.commit('toggleBird')
        },
        accept(){
          let sending = {
              type: 'task-sub-tasked',
              taskId: this.$store.getters.member.memberId,
              subTask: this.b.taskId,
          }

          request
              .post('/events')
              .set('Authorization', this.$store.state.loader.token)
              .send(sending)
              .end((err,res)=>{
                  this.$store.dispatch("makeEvent", {
                    type: 'task-grabbed',
                    taskId: this.b.taskId,
                    memberId: this.$store.getters.member.memberId,
                  })
          })

        },
        refuse(){
            this.$store.dispatch("makeEvent", {
                type: 'task-dropped',
                taskId: this.b.taskId,
                memberId: this.$store.getters.member.memberId,
            })
        }
    },
    computed: {
        toMe(){
            let m = []
            if (this.b && this.b.passed.length > 0){
                m = this.b.passed.filter(p => p[1] === this.$store.getters.member.memberId)
            }
            return m
        }
    }
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

.pad
    margin-top: 1em
    margin-bottom: 1em

.centered
    text-align: center
</style>
