import { test, expect } from '@playwright/test'
import { expectDefaultResponseProps, expectKeyExist } from 'helpers/assertions.helper'
import { useLogin } from 'helpers/auth.helper'

test.describe('Feedback API - POST Feedback', () => {
    // Test Data
    const loremData = {
        short: process.env.LOREM_SHORT,
        medium: process.env.LOREM_MEDIUM,
    }
    const url = '/api/v1/feedbacks'
    let userToken: string
    let adminToken: string

    test.beforeAll(async ({ request }) => {
        userToken = await useLogin(request, 'user')
        adminToken = await useLogin(request, 'admin')
    })

    test.describe('Success cases', () => {
        test('should send feedback successfully with valid payload', async ({ request }) => {
            // Exec the API
            const res = await request.post(url, {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
                data: {
                    feedback_rate: 9,
                    feedback_body: loremData.short,
                },
            })

            // Validate message and data
            expectDefaultResponseProps(res, 201, 'Feedback sended')
        })
    })

    test.describe('Failed cases', () => {
        test('should fail if the feedback is sent by admin', async ({ request }) => {
            // Exec the API
            const res = await request.post(url, {
                headers: {
                    Authorization: `Bearer ${adminToken}`,
                },
                data: {
                    feedback_rate: 9,
                    feedback_body: loremData.short,
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
                    feedback_rate: 9,
                    feedback_body: loremData.medium,
                },
            })
            const body = await res.json()

            // Validate message and data
            expectDefaultResponseProps(res, 422, 'Validation error')
            expectKeyExist(body.data, ['feedback_body'])
            expect(body.data.feedback_body).toBe('feedback_body must be at most 255 characters')
        })

        test('should fail with failed validation : required payload is empty', async ({ request }) => {
            // Exec the API
            const res = await request.post(url, {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
                data: {
                    feedback_rate: 9,
                },
            })
            const body = await res.json()

            // Validate message and data
            expectDefaultResponseProps(res, 422, 'Validation error')
            expectKeyExist(body.data, ['feedback_body'])
            expect(body.data.feedback_body).toBe('feedback_body is required')
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
