import 'core-js/stable'
import 'regenerator-runtime/runtime'
import { observable, computed, autorun } from 'mobx'
class MyStore {
  @observable data = 'foo'
}
const myStore = new MyStore()
autorun(() => {
  console.log(myStore.data)
  document.getElementById('log').innerHTML += myStore.data + '<br />'
})

myStore.data = 'bar'
