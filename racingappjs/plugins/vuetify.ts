/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'

export default createVuetify({
  theme: {
    themes: {
      dark: {
        colors: {
          primary: '#00A3FF',
          secondary: '#1E2A3B',
          accent: '#2D3F59',
          surface: '#0A1929',
          background: '#050B13',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107'
        },
      },
    },
  },
})
