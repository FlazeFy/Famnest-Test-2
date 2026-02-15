import { expect } from '@playwright/test'

export const expectKeyExist = (target: any, keys: string[]) => {
    keys.forEach((key) => {
        expect(target).toHaveProperty(key)
    })
}

export const expectDefaultResponseProps = async (response: any, code: number, message: string) => {
    const body = await response.json()

    expect(response.status()).toBe(code)
    expect(body.message).toBe(message)
}
