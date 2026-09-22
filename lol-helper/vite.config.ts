import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const merakiProxy = {
  '/api/meraki': {
    target: 'https://cdn.merakianalytics.com',
    changeOrigin: true,
    rewrite: (path: string) =>
      path.replace(/^\/api\/meraki/, '/riot/lol/resources/latest/en-US'),
  },
} as const

export default defineConfig({
  plugins: [react()],
  server: { proxy: { ...merakiProxy } },
  preview: { proxy: { ...merakiProxy } },
})
