import { expect, type Locator, type Page, type TestInfo } from '@playwright/test'

export const tabsDocsPath = 'components/navigation/tabs/'

export function tabsPath(info: TestInfo) {
  return info.project.name === 'docs' ? tabsDocsPath : 'Tabs'
}

export function tabsDemo(page: Page, info: TestInfo, id: string) {
  return page.locator(info.project.name === 'docs'
    ? `[data-demo="tabs/${id}"]`
    : `[data-tabs-demo="${id}"]`)
}

export async function gotoTabs(page: Page, info: TestInfo, id: string) {
  await page.goto(tabsPath(info))
  const demo = tabsDemo(page, info, id)
  await expect(demo.getByRole('tab').first()).toBeVisible()
  return demo
}

export function tab(demo: Locator, name: string) {
  return demo.getByRole('tab', { name, exact: true })
}
