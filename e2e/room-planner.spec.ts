import { expect, test, type Page } from '@playwright/test'

async function openRenderedRoom(page: Page) {
  await page.goto('/')
  const canvas = page.locator('canvas')
  await expect(canvas).toBeVisible({ timeout: 15_000 })
  await expect
    .poll(() =>
      canvas.evaluate((element) => {
        const bounds = element.getBoundingClientRect()
        return Math.abs(
          element.width / element.height - bounds.width / bounds.height,
        )
      }),
      { timeout: 15_000 },
    )
    .toBeLessThan(0.02)
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const element = document.querySelector('canvas')
          if (!(element instanceof HTMLCanvasElement)) return 0
          const context =
            element.getContext('webgl2') ?? element.getContext('webgl')
          if (!context) return 0

          const colors = new Set<string>()
          const points = [
            [0.15, 0.2],
            [0.5, 0.2],
            [0.85, 0.2],
            [0.2, 0.5],
            [0.5, 0.5],
            [0.8, 0.5],
            [0.2, 0.8],
            [0.5, 0.8],
            [0.8, 0.8],
          ]
          const pixel = new Uint8Array(4)
          for (const [x, y] of points) {
            context.readPixels(
              Math.floor(context.drawingBufferWidth * x),
              Math.floor(context.drawingBufferHeight * y),
              1,
              1,
              context.RGBA,
              context.UNSIGNED_BYTE,
              pixel,
            )
            colors.add([...pixel].join(','))
          }
          return colors.size
        }),
      { timeout: 15_000 },
    )
    .toBeGreaterThan(3)
}

test('renders a nonblank room and completes the planning workflow', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  await openRenderedRoom(page)

  await page.screenshot({
    path: testInfo.outputPath('afterglow-desktop-room.png'),
  })

  await page.getByRole('button', { name: 'Select Low platform bed' }).click()
  const positionX = page.getByRole('spinbutton', { name: 'Position X' })
  await expect(positionX).toHaveValue('0.9')

  await page.keyboard.press('ArrowRight')
  await expect(positionX).toHaveValue('0.95')

  await page.getByRole('button', { name: 'Plan view' }).click()
  await expect(page.getByRole('button', { name: 'Plan view' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page.waitForTimeout(1300)
  await page.screenshot({
    path: testInfo.outputPath('afterglow-desktop-plan.png'),
  })

  await page.getByRole('button', { name: 'Play room tour' }).click()
  await page.waitForTimeout(500)
  await expect(page.getByRole('button', { name: 'Stop room tour' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page.getByRole('button', { name: 'Plan view' }).click()
  await expect(page.getByRole('button', { name: 'Play room tour' })).toHaveAttribute(
    'aria-pressed',
    'false',
  )

  await page.getByRole('button', { name: 'Undo' }).click()
  await expect(positionX).toHaveValue('0.9')
  await page.getByRole('button', { name: 'Reset layout' }).click()

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export image' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('afterglow-layout.png')
  expect(pageErrors).toEqual([])
})

test('supports direct furniture dragging', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await openRenderedRoom(page)
  const canvas = page.locator('canvas')
  const bounds = await canvas.boundingBox()
  if (!bounds) throw new Error('Room canvas has no bounds')
  await page.evaluate(() => {
    document.documentElement.removeAttribute('data-e2e-camera-position')
    window.addEventListener(
      'afterglow:camera-change',
      (event) => {
        document.documentElement.dataset.e2eCameraPosition = (
          event as CustomEvent<string>
        ).detail
      },
      { once: true },
    )
  })

  const bedCenter = {
    x: bounds.x + bounds.width * 0.52,
    y: bounds.y + bounds.height * 0.58,
  }
  await page.mouse.move(bedCenter.x, bedCenter.y)
  await page.mouse.down()
  await page.mouse.move(bedCenter.x + 55, bedCenter.y + 18, { steps: 8 })
  await page.mouse.up()

  await expect(
    page.getByRole('heading', { name: 'Low platform bed' }),
  ).toBeVisible()
  const position = await Promise.all([
    page.getByRole('spinbutton', { name: 'Position X' }).inputValue(),
    page.getByRole('spinbutton', { name: 'Position Z' }).inputValue(),
  ])
  expect(position.join(':')).not.toBe('0.9:0.35')
  await page.waitForTimeout(250)
  await expect(
    page.locator('html'),
    'dragging furniture must not move the camera',
  ).not.toHaveAttribute('data-e2e-camera-position')
})

test('supports camera orbiting', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await openRenderedRoom(page)
  const canvas = page.locator('canvas')
  const bounds = await canvas.boundingBox()
  if (!bounds) throw new Error('Room canvas has no bounds')
  await page.evaluate(() => {
    document.documentElement.removeAttribute('data-e2e-camera-position')
    window.addEventListener(
      'afterglow:camera-change',
      (event) => {
        document.documentElement.dataset.e2eCameraPosition = (
          event as CustomEvent<string>
        ).detail
      },
      { once: true },
    )
  })
  await page.mouse.move(bounds.x + bounds.width * 0.76, bounds.y + bounds.height * 0.34)
  await page.mouse.down({ button: 'left' })
  await page.mouse.move(
    bounds.x + bounds.width * 0.61,
    bounds.y + bounds.height * 0.28,
    { steps: 12 },
  )
  await page.mouse.up({ button: 'left' })
  await expect
    .poll(() =>
      page.locator('html').getAttribute('data-e2e-camera-position'),
    )
    .not.toBeNull()
})

const responsiveViewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 1024, height: 768 },
  { name: 'mobile', width: 390, height: 844 },
]

for (const viewport of responsiveViewports) {
  test(`keeps controls inside the ${viewport.name} viewport`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(viewport)
    await openRenderedRoom(page)
    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    )
    expect(hasOverflow, `${viewport.name} has horizontal overflow`).toBe(false)

    if (viewport.name === 'mobile') {
      await page
        .getByRole('button', { name: 'Select Low platform bed' })
        .click()
      await expect(page.getByLabel('Furniture in room')).toBeHidden()
      await expect(page.getByLabel('Low platform bed inspector')).toBeVisible()
      await page.screenshot({
        path: testInfo.outputPath('afterglow-mobile-selected.png'),
      })
    } else {
      await page.screenshot({
        path: testInfo.outputPath(`afterglow-${viewport.name}.png`),
      })
    }
  })
}

test('honors reduced motion while switching views', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 1024, height: 768 })
  await openRenderedRoom(page)

  const workspace = page.getByRole('region', { name: 'Room workspace' })
  await page.getByRole('button', { name: 'Plan view' }).click()
  await expect(page.getByRole('button', { name: 'Plan view' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect(workspace).toHaveAttribute('data-view-mode', 'plan')
  await expect(workspace).toHaveCSS(
    'animation-name',
    'reduced-plan-crossfade',
  )
  await expect(workspace).toHaveCSS('animation-duration', '0.16s')
  await expect(page.locator('canvas')).toBeVisible()
  await page.screenshot({
    path: testInfo.outputPath('afterglow-reduced-motion-plan.png'),
  })
})
