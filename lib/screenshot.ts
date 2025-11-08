import puppeteer from 'puppeteer-core'
import { Browser } from 'puppeteer-core'

let browser: Browser | null = null

export async function getBrowser(): Promise<Browser> {
  if (browser) {
    return browser
  }

  // Try to find Chrome executable
  const chromeExecutablePath = process.env.CHROME_EXECUTABLE_PATH ||
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' // Windows default
  
  browser = await puppeteer.launch({
    headless: true,
    executablePath: chromeExecutablePath,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  })

  return browser
}

export async function capturePageScreenshot(
  pageUrl: string,
  outputPath?: string
): Promise<Buffer> {
  const browser = await getBrowser()
  const page = await browser.newPage()
  
  try {
    await page.setViewport({ width: 1200, height: 800 })
    await page.goto(pageUrl, { waitUntil: 'networkidle0', timeout: 30000 })
    
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: false,
    })
    
    await page.close()
    
    return screenshot as Buffer
  } catch (error) {
    await page.close()
    throw error
  }
}

export async function captureHTMLScreenshot(
  htmlContent: string
): Promise<Buffer> {
  const browser = await getBrowser()
  const page = await browser.newPage()
  
  try {
    await page.setViewport({ width: 1200, height: 800 })
    await page.setContent(htmlContent, { waitUntil: 'networkidle0', timeout: 30000 })
    
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: false,
    })
    
    await page.close()
    
    return screenshot as Buffer
  } catch (error) {
    await page.close()
    throw error
  }
}

export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close()
    browser = null
  }
}
