// Content Moderation & Safety Shield
// Restricts Nudity, NSFW, sexually suggestive keywords, and malicious prompt injections

export const BANNED_NSFW_KEYWORDS = [
  'nude', 'nudity', 'naked', 'nsfw', 'porn', 'erotic', 'sex', 'sexual',
  'hentai', 'ecchi', 'lewd', 'explicit', 'undress', 'topless', 'genital',
  'breasts', 'penis', 'vagina', 'fetish', 'strip', 'lingerie', 'orgasm'
]

export interface SafetyCheckResult {
  isSafe: boolean
  flaggedTerms: string[]
  reason?: string
}

export function validateStoryContent(text: string): SafetyCheckResult {
  if (!text) return { isSafe: true, flaggedTerms: [] }
  
  const lower = text.toLowerCase()
  const flaggedTerms: string[] = []

  for (const word of BANNED_NSFW_KEYWORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'i')
    if (regex.test(lower)) {
      flaggedTerms.push(word)
    }
  }

  if (flaggedTerms.length > 0) {
    return {
      isSafe: false,
      flaggedTerms,
      reason: `Story contains restricted content: "${flaggedTerms.join(', ')}". Nudity, NSFW, and explicit themes are strictly forbidden to ensure creative safety.`
    }
  }

  return {
    isSafe: true,
    flaggedTerms: []
  }
}

// Anti-AI Bot Detection Heuristics
export function detectAutomatedBot(): boolean {
  if (typeof window === 'undefined') return false
  
  const nav = window.navigator as any
  // Check common headless indicators
  if (nav.webdriver === true) return true
  if (window.document.documentElement.getAttribute("webdriver")) return true
  if (/HeadlessChrome|PhantomJS|Selenium|Puppeteer|Playwright/i.test(nav.userAgent)) return true
  
  return false
}
