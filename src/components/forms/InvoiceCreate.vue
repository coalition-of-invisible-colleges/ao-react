<template lang='pug'>
#invoicecreate
	shared-title(title='Create lightning invoice')
	form-box(btntxt="create invoice"  event='invoice-created' v-bind:data='invoice')
			label memo
			input(v-model='invoice.memo' type='text')
			label value
					span
							select(v-model='invoice.currency')
									option CAD
									option BTC
			input(v-model='invoice.value' type='text')

</template>

<script>

import SharedTitle from '../slotUtils/SharedTitle'
import FormBox from '../slotUtils/FormBox'

export default {
  data() {
    return {
      invoice: {
				taskId: '',
				memo: '',
				value: '',
				currency: 'CAD',
      }
    }
  },
	mounted(){
			let ownerId = this.$router.currentRoute.path.split('/')[2]
			if (ownerId){
					this.invoice.ownerId = ownerId
			}
	},
  components: {
    SharedTitle, FormBox
  }
}
</script>

<style lang='stylus' scoped>
@import '../../styles/colours'

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

</style>
