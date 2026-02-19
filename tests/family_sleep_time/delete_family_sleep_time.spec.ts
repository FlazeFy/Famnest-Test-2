import { test } from '@playwright/test'
import { expectDefaultResponseProps } from 'helpers/assertions.helper'
import { useLogin } from 'helpers/auth.helper'

test.describe('Family Sleep Time API - DELETE Family Sleep Time', () => {
    // Test Data
    const url = '/api/v1/family_sleep_time'
    let userToken: string
    let userNoFamilyToken: string
    let adminToken: string

    test.beforeAll(async ({ request }) => {
        userToken = await useLogin(request, 'user')
        userNoFamilyToken = await useLogin(request, 'user_no_family')
        adminToken = await useLogin(request, 'admin')
    })

    test.describe('Success cases', () => {
        test('should delete family sleep time successfully with user account, have family, and family sleep already set up before', async ({ request }) => {
            // Exec the API
            const res = await request.delete(url, {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                }
            })

            // Validate message and data
            expectDefaultResponseProps(res, 200, 'Delete sleep time successful')
        })
    })

    test.describe('Failed cases', () => {
        test('should fail if the family sleep time is deleted by admin', async ({ request }) => {
            // Exec the API
            const res = await request.delete(url, {
                headers: {
                    Authorization: `Bearer ${adminToken}`,
                }
            })

            // Validate message and data
            expectDefaultResponseProps(res, 403, 'Your role is not authorized')
        })

        test('should fail if the family sleep time is deleted by user who dont have family', async ({ request }) => {
            // Exec the API
            const res = await request.delete(url, {
                headers: {
                    Authorization: `Bearer ${userNoFamilyToken}`,
                }
            })

            // Validate message and data
            expectDefaultResponseProps(res, 404, 'Family not found')
        })

        test('should fail if the family sleep time is not exist', async ({ request }) => {
            // Exec the API
            const res = await request.delete(url, {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                }
            })

            // Validate message and data
            expectDefaultResponseProps(res, 404, 'Sleep time not found')
        })
    })
})
