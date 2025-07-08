import { defineNuxtPlugin } from '#app'
import { RecycleScroller, DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('RecycleScroller', RecycleScroller)
  nuxtApp.vueApp.component('DynamicScroller', DynamicScroller)
  nuxtApp.vueApp.component('DynamicScrollerItem', DynamicScrollerItem)
})