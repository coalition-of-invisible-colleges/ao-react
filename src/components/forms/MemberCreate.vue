<template lang='pug'>

#newmember
	h1 Add new
	form-box(btntxt="Register New Doge"  event='member-created' v-bind:data='memberReq')
		fancy-input(labelText='new hackername')
			input.input-effect(v-model='member.name' type='text' )
		fancy-input(labelText='fob')
			input.input-effect(v-model='member.fob' type='text')
		ul
			li The new accounts initial password is the name
			li Instruct the new member to log in.
			li Also tell them all the important stuff.
</template>

<script>
import cryptoUtils from '../../crypto'
import SharedTitle from '../slotUtils/SharedTitle'
import FormBox from '../slotUtils/FormBox'
import FancyInput from '../slotUtils/FancyInput'

export default {
  data() {
    return {
      member: {
        name: '',
        pass: '',
        fob: '',
      }
    }
  },
	mounted(){
		let name = this.$router.currentRoute.path.split('/')[2]
		this.member.name = name
	},
	computed: {
		memberReq(){
			let name, secret
			name = this.member.name
			if (name){
					secret = cryptoUtils.createHash(name)
			}
			return {
					type: "member-created",
					name,
					secret,
					fob: this.member.fob,
			}
		}
	},
	methods: {
		reset() {
			this.member.name = ''
		}
	},
  components: {
    SharedTitle, FormBox, FancyInput
  }
}
</script>

<style lang='stylus' scoped>

@import '../../styles/colours'
@import '../../styles/skeleton'

#projects
    color:accent1
    font-family: 'Open Sans', light, sans-serif;

li
  color:white
  font-size:18px
  font-family: 'Open Sans', light, sans-serif;

h3
  font-family: 'Open Sans', light, sans-serif;
  font-size:1.6em

a, input
		margin-top: .5em


</style>
