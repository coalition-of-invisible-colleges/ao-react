<template lang='pug'>
#newresource
	shared-title(title='Space Uses')
	form-box(btntxt="Create Resource"  event='resource-created' v-bind:data='resource')
			label name
			input(v-model='resource.name' type='text')
			label charged
			input(v-model='resource.charged' type='number')
			label Track Stock?
			input(v-model='resource.trackStock' type='checkbox')
</template>

<script>
import SharedTitle from '../slotUtils/SharedTitle'
import FormBox from '../slotUtils/FormBox'
import uuidV1 from 'uuid/v1'

export default {
  data() {
    return {
      resource: {
				resourceId: uuidV1(),
				name: '',
				charged: 0,
				trackStock: false,
				secret: '1235'
      }
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
