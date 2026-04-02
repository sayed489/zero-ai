export interface Intent {
  isImageGen: boolean
  isSearch: boolean
  isAppFactory: boolean
  isAgentTask: boolean
  isCodeRun: boolean
  isImageAnalysis: boolean
  isVoice: boolean
  isCompare: boolean
  imagePrompt: string
  searchQuery: string
  appDescription: string
}

export function detectIntent(message: string): Intent {
  const m = message.toLowerCase()

  const imageGenWords =
    /(generate|create|draw|make|show|design|paint)\s.*(image|photo|picture|logo|illustration|art|poster|banner|avatar)/
  const searchWords =
    /\b(today|latest|news|current|2024|2025|2026|yesterday|just announced|recently|live|now|trending|stock price|weather)\b/
  const appWords =
    /(build|create|make|generate|code)\s.*(app|website|tool|dashboard|landing page|portfolio|saas|game|calculator|timer)/
  const agentWords =
    /(take over|do my work|handle|automate|control|run|manage|complete my|work for me|i need you to do|finish my)/
  const codeRunWords =
    /(run|execute|test|compile|debug)\s.*(this|the|my)?\s*(code|script|function|program)/
  const visionWords =
    /(what('s| is) in|analyze|describe|read|ocr|extract text from|look at)\s.*(this|the)?\s*(image|photo|picture|screenshot)/
  const compareWords = /\b(compare|vs|versus|which is better|benchmark)\b/

  const isImageGen = imageGenWords.test(m)
  const isSearch = searchWords.test(m)
  const isAppFactory = appWords.test(m)
  const isAgentTask = agentWords.test(m)
  const isCodeRun = codeRunWords.test(m)
  const isImageAnalysis = visionWords.test(m)
  const isCompare = compareWords.test(m)
  const isVoice = /\b(read (aloud|out|to me)|speak|say this|voice)\b/.test(m)

  const imagePrompt = isImageGen
    ? message.replace(/generate|create|draw|make|show|an?|the/gi, "").trim()
    : ""
  const searchQuery = isSearch ? message : ""
  const appDescription = isAppFactory
    ? message.replace(/build|create|make|generate|code|me|an?|a/gi, "").trim()
    : ""

  return {
    isImageGen,
    isSearch,
    isAppFactory,
    isAgentTask,
    isCodeRun,
    isImageAnalysis,
    isVoice,
    isCompare,
    imagePrompt,
    searchQuery,
    appDescription,
  }
}
