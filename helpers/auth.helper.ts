import { APIRequestContext, expect } from '@playwright/test'

export const useLogin = async (request: APIRequestContext, role: string) => {
    let email: string | null = null
    let password: string | null = null

    if (role === "user") {
        email = process.env.USER_EMAIL || ""
        password = process.env.USER_PASSWORD || ""
    } else if (role === "admin") {
        email = process.env.ADMIN_EMAIL || ""
        password = process.env.ADMIN_PASSWORD || ""
    } else if (role === "user_no_family") {
        email = process.env.USER_NO_FAMILY_EMAIL || ""
        password = process.env.USER_NO_FAMILY_PASSWORD || ""
    }

    const response = await request.post('/api/v1/auths/login', {
        data: { email, password },
    })

    const body = await response.json()

    expect(response.status()).toBe(200)
    expect(body.data.token).toBeDefined()

    return body.data.token
}
