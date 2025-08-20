/* eslint-env node */
/* global process */
import { test } from '@playwright/test'
import fs from 'fs'

const ensureDir = () => {
  fs.mkdirSync('screenshots', { recursive: true })
}

test('landing and dashboard screenshots', async ({ page }) => {
  ensureDir()
  await page.goto('/')
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.screenshot({ path: 'screenshots/landing-desktop.png', fullPage: true })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({ path: 'screenshots/landing-mobile.png', fullPage: true })

  await page.goto('/auth')
  await page.fill('input[name="employeeId"]', process.env.TEST_USER || 'AD0001')
  await page.fill('input[name="password"]', process.env.TEST_PASS || 'Admin@123')
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {}),
    page.click('button[type="submit"]')
  ])
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.screenshot({ path: 'screenshots/dashboard-overview-desktop.png', fullPage: true })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({ path: 'screenshots/dashboard-overview-mobile.png', fullPage: true })
})
