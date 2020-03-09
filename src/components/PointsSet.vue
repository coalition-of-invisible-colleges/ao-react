<template lang='pug'>

.pointsset
    input(v-model='task.points'  type='text'  placeholder='points'  @keypress.enter='setValue(false)')
    button(@click='setValue') {{ detectChange }}
</template>

<script>

export default {
    props: ['b'],
    data() {
        return {
            task: {
                points: this.b.completeValue? this.b.completeValue : 1,
            }
        }
    },
    methods: {
        setValue(clear = true) {
            if(this.b.completeValue === this.task.points) {
                if(!clear) {
                    this.$emit('closeit')
                    return
                }
                this.task.points = 0
                this.$store.dispatch("makeEvent", {
                    type: 'task-valued',
                    taskId: this.b.taskId,
                    value: 0,
                })

                this.$emit('closeit')
                return
            }
            this.$emit('closeit')

            this.$store.dispatch("makeEvent", {
                type: 'task-valued',
                taskId: this.b.taskId,
                value: Number(this.task.points),
            })
        }
    },
    computed: {
        detectChange(){
            if(this.b.completeValue === this.task.points) {
                return "clear"
            } else if(this.b.completeValue && this.task.points) {
                return "revalue"
            }
            return "value"
        }
    },
}

</script>

<style lang='stylus' scoped>

@import '../styles/button'
@import '../styles/input'

button
    width: 90%

.valueset
    background: transparent
    padding: 0
    color: white
    height: 2.2em

.pointsset button
    width: 20%
    height: 2.2em
    padding: 0

.pointsset input
    border-color: rgba(22, 22, 22, 1)
    border-width: 1px
    background-color: rgba(22, 22, 22, 0.3)
    height: 2.2em
    width: 30%
</style>
