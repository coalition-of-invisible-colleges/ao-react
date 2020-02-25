<template lang='pug'>

#newmember
	h1 Add new
	form-box(btntxt="Register New Doge"  event='member-created' v-bind:data='memberReq')
		.input-container
				input.input-effect(v-model='member.name' type='text'  :class='{"has-content":!!member.name}')
				label new account
				span.focus-border
		.input-container
				input.input-effect(v-model='member.fob' type='text'  :class='{"has-content":!!member.fob}')
				label fob
				span.focus-border
		ul
			li initial password is chosen name
			li tell them the important stuff
</template>

<script>
import cryptoUtils from '../crypto'
import FormBox from './FormBox'

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
     FormBox
  }
}
</script>

<style lang='stylus' scoped>

@import '../styles/colours'
@import '../styles/skeleton'
@import '../styles/input'

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
