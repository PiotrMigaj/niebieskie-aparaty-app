import { defineNuxtPlugin } from '#app'
import PrimeVue from 'primevue/config'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Image from 'primevue/image'
import Galleria from 'primevue/galleria'
import Menubar from 'primevue/menubar'
import Toast from 'primevue/toast'
import ToastService from 'primevue/toastservice'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue, { ripple: true })
  nuxtApp.vueApp.use(ToastService)
  
  nuxtApp.vueApp.component('PrimeButton', Button)
  nuxtApp.vueApp.component('PrimeDialog', Dialog)
  nuxtApp.vueApp.component('PrimeImage', Image)
  nuxtApp.vueApp.component('PrimeGalleria', Galleria)
  nuxtApp.vueApp.component('PrimeMenubar', Menubar)
  nuxtApp.vueApp.component('PrimeToast', Toast)
})