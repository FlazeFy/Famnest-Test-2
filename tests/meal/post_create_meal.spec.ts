import { test, expect } from '@playwright/test'
import { expectDefaultResponseProps, expectKeyExist } from 'helpers/assertions.helper'
import { useLogin } from 'helpers/auth.helper'

test.describe('Meal API - POST Create Meal', () => {
    // Test Data
    const loremData = {
        short: process.env.LOREM_SHORT,
        medium: process.env.LOREM_MEDIUM,
    }
    const url = '/api/v1/meals'
    let userToken: string
    let userNoFamilyToken: string
    let adminToken: string

    test.beforeAll(async ({ request }) => {
        userToken = await useLogin(request, 'user')
        userNoFamilyToken = await useLogin(request, 'user_no_family')
        adminToken = await useLogin(request, 'admin')
    })

    test.describe('Success cases', () => {
        test('should create meal successfully with valid payload', async ({ request }) => {
            // Exec the API
            const res = await request.post(url, {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
                data: {
                    meal_name: loremData.short,
                    meal_desc: loremData.short,
                    meal_day: 'sun',
                    meal_time: 'lunch'
                },
            })

            // Validate message and data
            expectDefaultResponseProps(res, 201, 'Meal created')
        })
    })

    test.describe('Failed cases', () => {
        test('should fail if the user dont have a family', async ({ request }) => {
            // Exec the API
            const res = await request.post(url, {
                headers: {
                    Authorization: `Bearer ${userNoFamilyToken}`,
                },
                data: {
                    meal_name: loremData.short,
                    meal_desc: loremData.short,
                    meal_day: 'sun',
                    meal_time: 'lunch'
                },
            })

            // Validate message and data
            expectDefaultResponseProps(res, 404, 'Family not found')
        })

        test('should fail if the meal is already exist', async ({ request }) => {
            // Exec the API
            const res = await request.post(url, {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
                data: {
                    meal_name: loremData.short,
                    meal_desc: loremData.short,
                    meal_day: 'sun',
                    meal_time: 'lunch'
                },
            })
            const body = await res.json()

            // Validate message and data
            expectDefaultResponseProps(res, 409, 'Meal is already exist')
        })

        test('should fail if the feedback is sent by admin', async ({ request }) => {
            // Exec the API
            const res = await request.post(url, {
                headers: {
                    Authorization: `Bearer ${adminToken}`,
                },
                data: {
                    meal_name: loremData.short,
                    meal_desc: loremData.short,
                    meal_day: 'sun',
                    meal_time: 'lunch'
                },
            })

            // Validate message and data
            expectDefaultResponseProps(res, 403, 'Your role is not authorized')
        })

        test("should fail with failed validation : payload's character length is more than maximum requirement", async ({ request }) => {
            // Exec the API
            const res = await request.post(url, {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
                data: {
                    meal_name: loremData.short,
                    meal_desc: loremData.medium,
                    meal_day: 'fri',
                    meal_time: 'lunch'
                },
            })
            const body = await res.json()

            // Validate message and data
            expectDefaultResponseProps(res, 422, 'Validation error')
            expectKeyExist(body.data, ['meal_desc'])
            expect(body.data.meal_desc).toBe('meal_desc must be at most 255 characters')
        })

        test("should fail with failed validation : required payload's is empty", async ({ request }) => {
            // Exec the API
            const res = await request.post(url, {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
                data: {
                    meal_desc: loremData.short,
                    meal_day: 'fri',
                    meal_time: 'lunch'
                },
            })
            const body = await res.json()

            // Validate message and data
            expectDefaultResponseProps(res, 422, 'Validation error')
            expectKeyExist(body.data, ['meal_name'])
            expect(body.data.meal_name).toBe('meal_name is required')
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
