import { defineConfig } from '@playwright/test'
import dotenv from 'dotenv'

dotenv.config()

export default defineConfig({
    testDir: './tests',
    use: {
        baseURL: process.env.BASE_URL,
    },
    timeout: 30000,
    reporter: [['html', { open: 'always' }]]
})