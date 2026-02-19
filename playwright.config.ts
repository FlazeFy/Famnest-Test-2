import { defineConfig } from '@playwright/test'
import dotenv from 'dotenv'

dotenv.config()

export default defineConfig({
    testDir: './tests',
    use: {
        baseURL: process.env.BASE_URL,
    },
    timeout: 100000,
    reporter: [['html', { open: 'always' }]]
})