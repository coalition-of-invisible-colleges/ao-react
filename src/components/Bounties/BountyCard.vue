<template lang='pug'>

.task
  .row
    .mainColumn.columns.name(:class='cardInputSty')
        label() {{b.name}}
        br
        .instructions(v-if='!editMode') {{ b.instructions }}
        div(v-else)
            p.input-instructions The instructions on how to do the task properly.
            .editBox
                textarea(v-model='newInstructions')
            button(@click='submitChange') update instructions
    .secondaryColumn.columns
        button.halfsize()
        button.halfsize(v-if='!editMode', @click='edit')
          img.pencil(src='../../assets/images/pen-solid.svg')
        button.halfsize(v-else,  @click='edit')
          img.pencil.cancel(src='../../assets/images/times-solid.svg')
        button.primary(@click='claim')
         h4 Complete
         h5 {{currentValue.toLocaleString()}}
        p(v-if="b.lastClaimedBy") Last done by
            current(:memberId="b.lastClaimedBy")


</template>

<script>

import request from 'superagent'
import calculations from '../../calculations'
import Current from '../Resources/Current'

export default {
    props: ['b'],
    data() {
        return {
            currentValue: parseFloat( calculations.calculateTaskPayout(this.b).toFixed(2) ),
            editMode: false,
            newInstructions: '',
            newBoost: 0,
            newRate: this.b.monthlyValue,
            newCap: this.b.cap
        }
    },
    components: { Current },
    mounted(){
        setInterval( ()=>{
            this.currentValue = calculations.calculateTaskPayout(this.b)
        },7777)
    },
    methods: {
        history(){
          this.$router.push(this.historyLocation)
        },
        edit(){
            console.log('edit called')
            if (!this.editMode){
                this.editMode = true
                this.newInstructions = this.b.instructions
            } else {
                this.editMode = false
            }
        },
        claim(){
            request
                .post('/events')
                .set('Authorization', this.$store.state.loader.token)
                .send({
                    type: 'task-claimed',
                    taskId: this.b.taskId,
                    memberId: this.$store.getters.member.memberId,
                    inId: this.b.taskId,
                    notes: "",
                })
                .end((err,res)=>{
                    console.log({err,res})
                })
        },
        submitChange(){
            console.log('submit change called')
            this.editMode = false
            request
                .post('/events')
                .set('Authorization', this.$store.state.loader.token)
                .send({
                    type: 'task-instructions-updated',
                    newInstructions: this.newInstructions,
                    taskId: this.b.taskId
                })
                .end((err,res)=>{
                    if (err) return console.log(err);
                    console.log('createPayRec:', res.body)
                })
        },
        submitRate(){
            this.editMode = false
            request
                .post('/events')
                .set('Authorization', this.$store.state.loader.token)
                .send({
                    taskId: this.b.taskId,
                    type: 'task-rate-updated',
                    amount: this.newRate,
                })
                .end((err,res)=>{
                    if (err) return console.log(err);
                    console.log('createPayRec:', res.body)
                })
        },
        submitCap(){
            this.editMode = false
            request
                .post('/events')
                .set('Authorization', this.$store.state.loader.token)
                .send({
                    taskId: this.b.taskId,
                    type: 'task-cap-updated',
                    amount: this.newCap,
                })
                .end((err,res)=>{
                    if (err) return console.log(err);
                    console.log('createPayRec:', res.body)
                })
        },
        submitBoost(){
          this.editMode = false
          request
                .post('/events')
                .set('Authorization', this.$store.state.loader.token)
                .send({
                    taskId: this.b.taskId,
                    type: 'task-boosted',
                    amount: this.newBoost,
                })
                .end((err,res)=>{
                    if (err) return console.log(err);
                    console.log('createPayRec:', res.body)
                })
        },
        submitRemove(){
          this.editMode = false
          request
                .post('/events')
                .set('Authorization', this.$store.state.loader.token)
                .send({
                    taskId: this.b.taskId,
                    type: 'task-removed',
                })
                .end((err,res)=>{
                    if (err) return console.log(err);
                    console.log('createPayRec:', res.body)
                })
        }
    },
    computed: {
        sats(){
            return parseInt( calculations.cadToSats(this.currentValue, this.$store.state.cash.spot) )
        },
        claimLocation(){
            return '/TASK_CLAIM/' + this.b.taskId
        },
        historyLocation(){
            return '/TASK/' + this.b.taskId
        },
        cardInputSty(){
            return {
                redwx : this.b.color == 'red',
                bluewx : this.b.color == 'blue',
                greenwx : this.b.color == 'green',
                yellowwx : this.b.color == 'yellow',
                purplewx : this.b.color == 'purple',
                blackwx : this.b.color == 'black',
            }
        }
    },
}

</script>

<style lang="stylus" scoped>

@import '../../styles/colours';
@import '../../styles/skeleton';
@import '../../styles/button';

.task
    color: white
    margin:10px 0
    padding:20px

.name
    content-align: left
    text-align: left

.name>label
        font-size: 1.4em
        text-align: left

.instructions
    min-height: 4em
    font-size: 1em
    padding-top: 0.8em
    vertical-align: bottom
    margin-top: 1.5em
    text-align: left

.editBox
    label
        color: white
        text-align: left
    textarea
        width: calc(100% - 42px)
        height: 8em
        padding: 20px

img.cancel
    width:30%

.row
    width: 100%
    .mainColumn
      width:calc(100% - 150px - 4%)
      border-style: solid
      border-width: thick
      padding: 1em
    .secondaryColumn
      width:150px
      button
        height:75px

.satsSpan
    display: block
    font-size:0.8em
    font-style: italic
    font-weight:lighter

.purge
    background-color: warning
    border-color: warning

</style>
