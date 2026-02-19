import { test, expect } from '@playwright/test'
import { expectDefaultResponseProps, expectKeyExist } from 'helpers/assertions.helper'
import { useLogin } from 'helpers/auth.helper'

test.describe('Family Sleep Time API - POST Create Family Sleep Time', () => {
    // Test Data
    const url = '/api/v1/family_sleep_time'
    const hour_start: string = "00:30"
    const hour_end: string = "04:00"
    let userToken: string
    let adminToken: string

    test.beforeAll(async ({ request }) => {
        userToken = await useLogin(request, 'user')
        adminToken = await useLogin(request, 'admin')
    })

    test.describe('Success cases', () => {
        test('should create family sleep time successfully with user account, have family, and valid payload', async ({ request }) => {
            // Exec the API
            const res = await request.post(url, {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
                data: { hour_start, hour_end }
            })
            const body = await res.json()

            // Validate message and data
            expectDefaultResponseProps(res, 201, `Sleep time created, start from ${hour_start} until ${hour_end}`)
        })
    })

    test.describe('Failed cases', () => {
        test('should fail if the feedback is sent by admin', async ({ request }) => {
            // Exec the API
            const res = await request.post(url, {
                headers: {
                    Authorization: `Bearer ${adminToken}`,
                },
                data: { hour_start, hour_end }
            })

            // Validate message and data
            expectDefaultResponseProps(res, 403, 'Your role is not authorized')
        })
        
        test('should fail with failed validation : time is no valid', async ({ request }) => {
            // Exec the API
            const res = await request.post(url, {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
                data: { hour_start: "00:64", hour_end } ,
            })

            // Validate message and data
            expectDefaultResponseProps(res, 422, 'Time is not valid')
        })

        test('should fail with failed validation : payload character length less than minimum', async ({ request }) => {
            // Exec the API
            const res = await request.post(url, {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
                data: { hour_start: "00:3", hour_end },
            })
            const body = await res.json()

            // Validate message and data
            expectDefaultResponseProps(res, 422, 'Validation error')
            expectKeyExist(body.data, ["hour_start"])
            expect(body.data.hour_start).toBe('hour_start must be at least 5 characters')
        })

        test('should fail with failed validation : required payload is empty', async ({ request }) => {
            // Exec the API
            const res = await request.post(url, {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
                data: { hour_start },
            })
            const body = await res.json()

            // Validate message and data
            expectDefaultResponseProps(res, 422, 'Validation error')
            expectKeyExist(body.data, ["hour_end"])
            expect(body.data.hour_end).toBe('hour_end is required')
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
            expectKeyExist(body.data, ["body"])
            expect(body.data.body).toBe('Request body is required')
        })
    })
})
