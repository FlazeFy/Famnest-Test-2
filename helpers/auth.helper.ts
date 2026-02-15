import { APIRequestContext, expect } from '@playwright/test'

export const useLogin = async (request: APIRequestContext, role: 'user' | 'admin' = 'user') => {
    const email = role === 'admin' ? process.env.ADMIN_EMAIL : process.env.USER_EMAIL
    const password = role === 'admin' ? process.env.ADMIN_PASSWORD : process.env.USER_PASSWORD

    const response = await request.post('/api/v1/auths/login', {
        data: { email, password },
    })

    const body = await response.json()

    expect(response.status()).toBe(200)
    expect(body.data.token).toBeDefined()

    return body.data.token
}
