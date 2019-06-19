
<template lang='pug'>

div.totop
   template(v-for='n in b.passed')
       .row(v-if='n[0] === $store.getters.member.memberId')
           .ten.grid
               img.send(src='../../assets/images/wbirds.svg')
           .two.grid
               current.fr(:memberId='n[1]')
       .row(v-if='n[1] === $store.getters.member.memberId')
           .row
               .two.grid
                   current.fr(:memberId='n[0]')
               .ten.grid
                   img.send(src='../../assets/images/wbirds.svg')
           .row
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

                request
                .post('/events')
                .set('Authorization', this.$store.state.loader.token)
                .send({
                  type: 'task-grabbed',
                  taskId: this.b.taskId,
                  memberId: this.$store.getters.member.memberId,
                })
                .end((err,res)=>{

                })
          })

        },
        refuse(){
            request
                .post('/events')
                .set('Authorization', this.$store.state.loader.token)
                .send({
                    type: 'task-dropped',
                    taskId: this.b.taskId,
                    memberId: this.$store.getters.member.memberId,
                })
                .end((err,res)=>{

                })
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
    width: 100%

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


</style>
