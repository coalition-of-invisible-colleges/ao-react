<template lang='pug'>

.scroll
    div(v-if='inId'  @click='rollsafeIt')
        img.scrolly(src='../../assets/images/scroll.svg')
    div(v-else @click='canIt')
        img(v-if='!isCared'  src='../../assets/images/garbage.svg').scrolly
</template>

<script>

import calculations from '../../calculations'
import FormBox from '../slotUtils/FormBox'
import request from 'superagent'

export default {
    props: ['b', 'inId'],
    computed: {
        isCared(){
            return this.b.deck.length > 0 || this.b.guild || calculations.calculateTaskPayout(this.b) > 0.1
        }
    },
    methods: {
        rollsafeIt(){
            request
                .post('/events')
                .set('Authorization', this.$store.state.loader.token)
                .send({
                  type: 'task-de-sub-tasked',
                  taskId: this.inId,
                  subTask: this.b.taskId,
                })
                .end((err,res)=>{

                })
        },
        canIt(){
            request
                .post('/events')
                .set('Authorization', this.$store.state.loader.token)
                .send({
                    type: 'task-removed',
                    taskId: this.b.taskId,
                })
                .end((err,res)=>{

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
    clear: left
    float: left
    height: 1.3em

</style>
