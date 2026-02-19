import { test, expect } from '@playwright/test'
import { expectDefaultResponseProps, expectKeyExist } from 'helpers/assertions.helper'
import { useLogin } from 'helpers/auth.helper'

test.describe('Dictionary API - POST Create Dictionary', () => {
    // Test Data
    const loremData = {
        short: process.env.LOREM_SHORT,
        medium: process.env.LOREM_MEDIUM,
    }
    const url = '/api/v1/dictionaries'
    let userToken: string
    let adminToken: string

    test.beforeAll(async ({ request }) => {
        userToken = await useLogin(request, 'user')
        adminToken = await useLogin(request, 'admin')
    })

    test.describe('Success cases', () => {
        test('should send dictionary successfully with valid payload', async ({ request }) => {
            // Exec the API
            const res = await request.post(url, {
                headers: {
                    Authorization: `Bearer ${adminToken}`,
                },
                data: {
                    dictionary_name: loremData.short,
                    dictionary_desc: loremData.short,
                    dictionary_type: 'event_category',
                },
            })

            // Validate message and data
            expectDefaultResponseProps(res, 201, 'Dictionary created')
        })
    })

    test.describe('Failed cases', () => {
        test('should fail if the dictionary is sent by user', async ({ request }) => {
            // Exec the API
            const res = await request.post(url, {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
                data: {
                    dictionary_name: loremData.short,
                    dictionary_desc: loremData.short,
                    dictionary_type: 'event_category',
                },
            })

            // Validate message and data
            expectDefaultResponseProps(res, 403, 'Your role is not authorized')
        })

        test('should fail if the dictionary is already exist', async ({ request }) => {
            // Exec the API
            const res = await request.post(url, {
                headers: {
                    Authorization: `Bearer ${adminToken}`,
                },
                data: {
                    dictionary_name: 'birthday',
                    dictionary_desc: loremData.short,
                    dictionary_type: 'event_category',
                },
            })

            // Validate message and data
            expectDefaultResponseProps(res, 409, 'Dictionary is already exist')
        })

        test("should fail with failed validation : payload's character length is more than maximum requirement", async ({ request }) => {
            // Exec the API
            const res = await request.post(url, {
                headers: {
                    Authorization: `Bearer ${adminToken}`,
                },
                data: {
                    dictionary_name: loremData.short,
                    dictionary_desc: loremData.medium,
                    dictionary_type: 'event_category',
                },
            })
            const body = await res.json()

            // Validate message and data
            expectDefaultResponseProps(res, 422, 'Validation error')
            expectKeyExist(body.data, ['dictionary_desc'])
            expect(body.data.dictionary_desc).toBe('dictionary_desc must be at most 255 characters')
        })

        test("should fail with failed validation : required payload's is empty", async ({ request }) => {
            // Exec the API
            const res = await request.post(url, {
                headers: {
                    Authorization: `Bearer ${adminToken}`,
                },
                data: {
                    dictionary_desc: loremData.medium,
                    dictionary_type: 'event_category',
                },
            })
            const body = await res.json()

            // Validate message and data
            expectDefaultResponseProps(res, 422, 'Validation error')
            expectKeyExist(body.data, ['dictionary_name'])
            expect(body.data.dictionary_name).toBe('dictionary_name is required')
        })

        test('should fail with failed validation : empty request body', async ({ request }) => {
            // Exec the API
            const res = await request.post(url, {
                headers: {
                    Authorization: `Bearer ${adminToken}`,
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
