import { test, expect } from '@playwright/test'
import { expectDefaultResponseProps, expectKeyExist } from 'helpers/assertions.helper'
import { useLogin } from 'helpers/auth.helper'

test.describe('Allergic API - Post Create Allergic', () => {
    // Test Data 
    const loremData = {
        short: process.env.LOREM_SHORT,
        medium: process.env.LOREM_MEDIUM
    }
    const url = '/api/v1/allergics'
    let userToken: string 
    let adminToken: string 

    test.beforeAll(async ({ request }) => {
        userToken = await useLogin(request, 'user')
        adminToken = await useLogin(request, 'admin')
    })

    test.describe('Success cases', () => {
        test('should send allergic successfully with valid payload', async ({ request }) => {
            // Exec the API
            const res = await request.post(url, {
                headers: {
                    Authorization: `Bearer ${userToken}`
                }, 
                data: {
                    allergic_context: loremData.short,
                    allergic_desc: loremData.short
                },
            })

            // Validate message and data
            expectDefaultResponseProps(res, 201, 'Allergic created')
        })
    })

    test.describe('Failed cases', () => {
        test('should fail if the allergic is already exist', async ({ request }) => {
            // Exec the API
            const res = await request.post(url, {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
                data: {
                    allergic_context: loremData.short,
                    allergic_desc: loremData.short 
                },
            })

            // Validate message and data
            expectDefaultResponseProps(res, 409, 'Allergic is already exist')
        })
        test('should fail if the allergic is sent by admin', async ({ request }) => {
            // Exec the API
            const res = await request.post(url, {
                headers: {
                    Authorization: `Bearer ${adminToken}`,
                },
                data: {
                    allergic_context: loremData.short,
                    allergic_desc: loremData.short 
                },
            })

            // Validate message and data
            expectDefaultResponseProps(res, 403, 'Your role is not authorized')
        })
        test('should fail with failed validation : payload character length is more than maximum requirement', async ({ request }) => {
            // Exec the API
            const res = await request.post(url, {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
                data: {
                    allergic_context: loremData.short,
                    allergic_desc: loremData.medium
                },
            })
            const body = await res.json()

            // Validate message and data
            expectDefaultResponseProps(res, 422, 'Validation error')
            expectKeyExist(body.data, ['allergic_desc'])
            expect(body.data.allergic_desc).toBe('allergic_desc must be at most 255 characters')
        })
        test('should fail with failed validation : required payload is empty', async ({ request }) => {
            // Exec the API
            const res = await request.post(url, {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
                data: {
                    allergic_desc: loremData.short
                },
            })
            const body = await res.json()

            // Validate message and data
            expectDefaultResponseProps(res, 422, 'Validation error')
            expectKeyExist(body.data, ["allergic_context"])
            expect(body.data.allergic_context).toBe('allergic_context is required')
        })
        test('should fail with failed validation : empty request body', async ({ request }) => {
            // Exec the API
            const res = await request.post(url, {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
            })
            const body = await res.json()

            // Validate message and data
            expectDefaultResponseProps(res, 422, 'Validation error')
            expectKeyExist(body.data, ['body'])
            expect(body.data.body).toBe('Request body is required')
        })
    })
})