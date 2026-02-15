import { test, expect } from '@playwright/test'
import { expectDefaultResponseProps, expectKeyExist } from 'helpers/assertions.helper'

test.describe('Auth API - POST Login', () => {
    // Test Data
    const url = '/api/v1/auths/login'
    const userData = {
        email: process.env.USER_EMAIL,
        password: process.env.USER_PASSWORD,
    }
    const adminData = {
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
    }

    test.describe('Success cases', () => {
        test('should login successfully with user account', async ({ request }) => {
            // Exec the API
            const res = await request.post(url, {
                data: {
                    email: userData.email,
                    password: userData.password,
                },
            })
            const body = await res.json()

            // Validate message and data
            expectDefaultResponseProps(res, 200, 'Login successful')
            expect(body.data.role).toBe('user')
            expectKeyExist(body.data, ["token", "name", "email", "role"])
        })

        test('should login successfully with admin account', async ({ request }) => {
            // Exec the API
            const res = await request.post(url, {
                data: {
                    email: adminData.email,
                    password: adminData.password,
                },
            })
            const body = await res.json()

            // Validate message and data
            expectDefaultResponseProps(res, 200, 'Login successful')
            expect(body.data.role).toBe('admin')
            expectKeyExist(body.data, ["token", "name", "email", "role"])
        })
    })

    test.describe('Failed cases', () => {
        test('should fail with wrong password', async ({ request }) => {
            // Exec the API
            const res = await request.post(url, {
                data: {
                    email: userData.email,
                    password: 'wrongpassword',
                },
            })

            // Validate message and data
            expectDefaultResponseProps(res, 401, 'Invalid email or password')
        })

        test('should fail with failed validation : payload character length less than minimum', async ({ request }) => {
            // Exec the API
            const res = await request.post(url, {
                data: {
                    email: userData.email,
                    password: 'nopas',
                },
            })
            const body = await res.json()

            // Validate message and data
            expectDefaultResponseProps(res, 422, 'Validation error')
            expectKeyExist(body.data, ["password"])
            expect(body.data.password).toBe('password must be at least 6 characters')
        })

        test('should fail with failed validation : required payload is empty', async ({ request }) => {
            // Exec the API
            const res = await request.post(url, {
                data: {
                    email: userData.email,
                },
            })
            const body = await res.json()

            // Validate message and data
            expectDefaultResponseProps(res, 422, 'Validation error')
            expectKeyExist(body.data, ["password"])
            expect(body.data.password).toBe('password is required')
        })

        test('should fail with failed validation : empty request body', async ({ request }) => {
            // Exec the API
            const res = await request.post(url)
            const body = await res.json()

            // Validate message and data
            expectDefaultResponseProps(res, 422, 'Validation error')
            expectKeyExist(body.data, ["body"])
            expect(body.data.body).toBe('Request body is required')
        })
    })
})
