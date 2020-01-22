<template lang='pug'>

#newresource
    form-box.centerform(btntxt="set time"  event='resource-booked' v-bind:data='resource')
        label select day
        input(v-model='ymd' type='date')
        label select hour
        .row.padd
            select.eight.grid(v-model='hour')
                option(value='1') 1
                option(value='2') 2
                option(value='3') 3
                option(value='4') 4
                option(value='5') 5
                option(value='6') 6
                option(value='7') 7
                option(value='8') 8
                option(value='9') 9
                option(value='10') 10
                option(value='11') 11
                option(value='12') 12
            select.four.grid(v-model='meridiem')
                option(value='am') am
                option(value='pm') pm
        //- input.input-effect(v-model='duration' type='number')
</template>

<script>
import SharedTitle from './SharedTitle'
import FormBox from './FormBox'
import FancyInput from './FancyInput'

const HOUR = 1000 * 60 * 60
const HALFDAY = HOUR * 12

export default {
    props:['tId'],
    components: {
        SharedTitle, FormBox, FancyInput
    },
    mounted(){
        let i = this.$router.currentRoute.path.split('/')[2]
        if (i){
            this.urlId = i
        }
    },
    data(){
        let d = new Date()
        return {
            ymd: '',
            hour: 1,
            meridiem : 'pm',
            duration : 3,
            urlId: '',
        }
    },
    computed: {
        resource() {
            return {
                eventType: 'resource-booked',
                resourceId: this.tId,
                memberId: this.$store.getters.member.memberId,
                taskId: '',
                charge: '',
                notes: '',
                startTs: this.calcTime.start,
                endTs: this.calcTime.end,
                type:'resource-booked',
            }
        },
        calcTime(){
            const HOUR = 60 * 60 * 1000
            let d = new Date(this.ymd)

            let pmAmOffset
            switch (this.meridiem) {
                case 'am':
                    pmAmOffset = 0
                    break
                case 'pm':
                    pmAmOffset = 12 * HOUR
                    break
            }

            let tzOffset = d.getTimezoneOffset()
            let timezoneOffset = ( tzOffset / 60 ) * HOUR

            let durationOffset = parseInt(this.duration) * HOUR
            let hourOffset = parseInt(this.hour) * HOUR

            let start = d.getTime() + pmAmOffset + hourOffset + timezoneOffset

            return {
                start,
                end: start + durationOffset
            }
        }
    }
}

</script>

<style lang='stylus' scoped>

@import '../styles/colours'
@import '../styles/grid'

#newresource
    position: relative
    top: 2em
    margin-bottom: 1em
    
.br
  padding-top: 1.9em

// TODO: fix strange style stuff going on padding/margin on label not having effect
label
    padding-top: 1em
    margin-top: 1em

.padd
    padding-bottom: 1.1em

.centerform
    margin: 0 auto 1em auto
</style>
