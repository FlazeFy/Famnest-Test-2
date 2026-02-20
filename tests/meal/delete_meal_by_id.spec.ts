import { expect, test } from '@playwright/test'
import { expectDefaultResponseProps, expectKeyExist } from 'helpers/assertions.helper'
import { useLogin } from 'helpers/auth.helper'

test.describe('Meal API - DELETE Meal By ID', () => {
    // Test Data
    const id = process.env.MEAL_ID
    const not_found_id = process.env.NOT_FOUND_ID
    const not_valid_id = process.env.NOT_VALID_ID
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
        test('should delete meal successfully with valid id', async ({ request }) => {
            // Exec the API
            const res = await request.delete(`${url}/${id}`, {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                }
            })

            // Validate message and data
            expectDefaultResponseProps(res, 200, 'Delete meal successful')
        })
    })

    test.describe('Failed cases', () => {
        test("should fail if the meal is deleted by admin", async ({ request }) => {
            // Exec the API
            const res = await request.delete(`${url}/${id}`, {
                headers: {
                    Authorization: `Bearer ${adminToken}`,
                }
            })

            // Validate message and data
            expectDefaultResponseProps(res, 403, 'Your role is not authorized')
        })

        test('should fail if the meal not found', async ({ request }) => {
            // Exec the API
            const res = await request.delete(`${url}/${not_found_id}`, {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                }
            })

            // Validate message and data
            expectDefaultResponseProps(res, 404, 'Meal not found')
        })

        test('should fail if the meal is deleted by user who dont have family', async ({ request }) => {
            // Exec the API
            const res = await request.delete(`${url}/${id}`, {
                headers: {
                    Authorization: `Bearer ${userNoFamilyToken}`,
                }
            })

            // Validate message and data
            expectDefaultResponseProps(res, 404, 'Family not found')
        })

        test('should fail with failed validation : id is not valid uuid', async ({ request }) => {
            // Exec the API
            const res = await request.delete(`${url}/${not_valid_id}`, {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                }
            })
            const body = await res.json()

            // Validate message and data
            expectDefaultResponseProps(res, 422, 'Validation error')
            expectKeyExist(body.data, ['id'])
            expect(body.data.id).toBe('id must be at least 36 characters')
        })
    })
})
