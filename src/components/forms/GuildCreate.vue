<template lang='pug'>

.guildcreate(:class='{ bumpup : editing }')
    span(v-if='b.guild && !editing') {{ b.guild }}
    input#titlebox(v-if='editing'  v-model='task.guild'  type='text'  placeholder='code name'  @keypress.enter='titleIt(false)')
    button(v-if='editing'  @click='titleIt') {{ detectRename }}

</template>

<script>

import SharedTitle from '../slotUtils/SharedTitle'
import FormBox from '../slotUtils/FormBox'
import SoundFX from '../../modules/sounds'

export default {
    props: ['b', 'editing'],
    data() {
        return {
            task: {
                guild: this.b.guild? this.b.guild : '',
            }
        }
    },
    methods: {
        titleIt(clear = true) {
            if(this.b.guild === this.task.guild) {
                if(!clear) {
                    this.$emit('closeit')
                    return
                }
                this.task.guild = ''
                this.$store.dispatch("makeEvent", {
                    type: 'task-guilded',
                    taskId: this.b.taskId,
                    guild: false,
                })
            }
            this.$emit('closeit')
            SoundFX.playBattleCry()
            this.$store.dispatch("makeEvent", {
                type: 'task-guilded',
                taskId: this.b.taskId,
                guild: this.task.guild,
            })
        }
    },
    computed: {
        detectRename(){
            if(this.b.guild === this.task.guild) {
                return "clear"
            } else if(this.b.guild && this.task.guild) {
                return "rename"
            }
            return "mission"
        }
    },
    components: {
        SharedTitle, FormBox
    },
}

</script>

<style lang='stylus' scoped>

@import '../../styles/button'

.guildcreate
    background: transparent
    padding: 0
    color: white
    margin: 0 2em 0 0

.guildcreate button
    width: 40%
    height: 2.2em
    padding: 0
    position: relative
    top: -0.16em
    
.guildcreate input
    border-color: rgba(22, 22, 22, 1)
    border-width: 1px
    background-color: rgba(22, 22, 22, 0.3)
    width: 60%

.guildcreate.bumpup
    top: 0.6em
    width: calc(100% - 7em)
</style>
