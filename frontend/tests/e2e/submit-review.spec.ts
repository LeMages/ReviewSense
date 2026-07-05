import { test, expect } from '@playwright/test'

const FAKE_USER = {
  id: 'user-1',
  email: 'jane.doe@example.com',
  name: 'Jane Doe',
  role: 'user',
}

test('submit a review and see the result', async ({ page }) => {
  // Mock authentication so the app never needs a real backend.
  await page.route('**/auth/me', async (route) => {
    await route.fulfill({ json: FAKE_USER })
  })

  // The dashboard fires GraphQL queries on mount; stub them out so the
  // intermediate redirect there doesn't hit a real (absent) server.
  await page.route('**/graphql', async (route) => {
    await route.fulfill({
      json: {
        data: {
          reviewStats: { positive: 0, negative: 0, neutral: 0, total: 0 },
          sentimentDistribution: [],
        },
      },
    })
  })

  await page.route('**/api/v1/reviews', async (route) => {
    await route.fulfill({
      json: {
        review: {
          id: 'review-1',
          userId: FAKE_USER.id,
          text: 'This product is absolutely amazing, best purchase ever!',
          predictedSentiment: 'positive',
          confidence: 0.95,
          language: 'en',
          createdAt: new Date().toISOString(),
        },
      },
    })
  })

  // Log in via the OAuth callback route, which is the only entry point
  // that populates the (non-persisted) auth state.
  await page.goto('/auth/callback?token=fake-token')
  await expect(page).toHaveURL(/\/dashboard$/)

  await page.getByRole('link', { name: 'Submit Review' }).click()
  await expect(page).toHaveURL(/\/submit$/)

  await page
    .getByPlaceholder('Paste a product review...')
    .fill('This product is absolutely amazing, best purchase ever!')
  await page.getByRole('button', { name: 'Analyze Sentiment' }).click()

  await expect(page.getByText('positive', { exact: true })).toBeVisible()
  await expect(page.getByText(/95(\.0)?%/)).toBeVisible()
})
