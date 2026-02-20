import { expect, test } from '@playwright/test'
import { expectDefaultResponseProps, expectKeyExist } from 'helpers/assertions.helper'
import { useLogin } from 'helpers/auth.helper'

test.describe('Dictionary API - DELETE Dictionary By ID', () => {
    // Test Data
    const id = process.env.DICTIONARY_ID
    const not_found_id = process.env.NOT_FOUND_ID
    const not_valid_id = process.env.NOT_VALID_ID
    const url = '/api/v1/dictionaries'
    let userToken: string
    let adminToken: string

    test.beforeAll(async ({ request }) => {
        userToken = await useLogin(request, 'user')
        adminToken = await useLogin(request, 'admin')
    })

    test.describe('Success cases', () => {
        test('should delete dictionary successfully with valid id', async ({ request }) => {
            // Exec the API
            const res = await request.delete(`${url}/${id}`, {
                headers: {
                    Authorization: `Bearer ${adminToken}`,
                }
            })

            // Validate message and data
            expectDefaultResponseProps(res, 200, 'Delete dictionary successful')
        })
    })

    test.describe('Failed cases', () => {
        test('should fail if the dictionary is deleted by user', async ({ request }) => {
            // Exec the API
            const res = await request.delete(`${url}/${id}`, {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                }
            })

            // Validate message and data
            expectDefaultResponseProps(res, 403, 'Your role is not authorized')
        })

        test('should fail if the dictionary not found', async ({ request }) => {
            // Exec the API
            const res = await request.delete(`${url}/${not_found_id}`, {
                headers: {
                    Authorization: `Bearer ${adminToken}`,
                }
            })

            // Validate message and data
            expectDefaultResponseProps(res, 404, 'Dictionary not found')
        })

        test('should fail with failed validation : id is not valid uuid', async ({ request }) => {
            // Exec the API
            const res = await request.delete(`${url}/${not_valid_id}`, {
                headers: {
                    Authorization: `Bearer ${adminToken}`,
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
