import { test, expect } from '@playwright/test'
import { expectDefaultResponseProps, expectKeyExist } from 'helpers/assertions.helper'

test.describe('Question API - POST Create Question', () => {
    // Test Data
    const loremData = {
        short: process.env.LOREM_SHORT,
        medium: process.env.LOREM_MEDIUM,
    }
    const userData = {
        email: process.env.USER_EMAIL,
    }
    const url = '/api/v1/questions'

    test.describe('Success cases', () => {
        test('should send question successfully with valid payload', async ({ request }) => {
            // Exec the API
            const res = await request.post(url, {
                data: {
                    question: loremData.short,
                    email: userData.email,
                },
            })

            // Validate message and data
            expectDefaultResponseProps(res, 201, 'Question sended')
        })
    })

    test.describe('Failed cases', () => {
        test('should fail with failed validation : payload character length is more than maximum requirement', async ({ request }) => {
            // Exec the API
            const res = await request.post(url, {
                data: {
                    question: loremData.medium,
                    email: userData.email,
                },
            })
            const body = await res.json()

            // Validate message and data
            expectDefaultResponseProps(res, 422, 'Validation error')
            expectKeyExist(body.data, ['question'])
            expect(body.data.question).toBe('question must be at most 255 characters')
        })

        test('should fail with failed validation : question email is not a valid email', async ({ request }) => {
            // Exec the API
            const res = await request.post(url, {
                data: {
                    question: loremData.short,
                    email: loremData.medium,
                },
            })
            const body = await res.json()

            // Validate message and data
            expectDefaultResponseProps(res, 422, 'Validation error')
            expectKeyExist(body.data, ['email'])
            expect(body.data.email).toBe('email must be a valid gmail address')
        })

        test('should fail with failed validation : required payload is empty', async ({ request }) => {
            // Exec the API
            const res = await request.post(url, {
                data: {
                    question: loremData.short,
                },
            })
            const body = await res.json()

            // Validate message and data
            expectDefaultResponseProps(res, 422, 'Validation error')
            expectKeyExist(body.data, ['email'])
            expect(body.data.email).toBe('email is required')
        })

        test('should fail with failed validation : empty request body', async ({ request }) => {
            // Exec the API
            const res = await request.post(url)
            const body = await res.json()

            // Validate message and data
            expectDefaultResponseProps(res, 422, 'Validation error')
            expectKeyExist(body.data, ['body'])
            expect(body.data.body).toBe('Request body is required')
        })
    })
})
