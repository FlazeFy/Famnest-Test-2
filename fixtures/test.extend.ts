import { test as base } from '@playwright/test'
import { useLogin } from '../helpers/auth.helper'

export const test = base.extend<{ userToken: string}>({
    userToken: async ({ request }, use) => {
        const token = await useLogin(request, 'user')
        await use(token)
    },
})

export { expect } from '@playwright/test'
