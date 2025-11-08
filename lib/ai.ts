import OpenAI from 'openai'
import { decryptApiKey } from './encryption'

export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface LineEdit {
  lineStart: number
  lineEnd: number
  newContent: string
  explanation?: string
}

export interface AIResponse {
  type: 'create' | 'edit' | 'answer'
  content?: string
  edits?: LineEdit[]
  message?: string
}

export async function getOpenAIClient(apiKey?: string): Promise<OpenAI> {
  const key = apiKey || process.env.DEFAULT_OPENROUTER_API_KEY || ''
  
  return new OpenAI({
    apiKey: key,
    baseURL: 'https://openrouter.ai/api/v1',
  })
}

export async function generatePage(
  prompt: string,
  model: string = 'google/gemini-2.0-flash-lite-001',
  apiKey?: string
): Promise<string> {
  const client = await getOpenAIClient(apiKey)
  
  const systemPrompt = `You are an expert HTML/CSS/JavaScript developer. Create a complete, production-ready HTML page based on the user's request. 
Include all necessary HTML structure, inline CSS for styling, and JavaScript if needed. 
Make it visually appealing, responsive, and modern. 
Return ONLY the complete HTML code without any explanations or markdown.`

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
  })

  return response.choices[0]?.message?.content || ''
}

export async function agenticDecision(
  userMessage: string,
  currentPageContent: string | null,
  conversationHistory: AIMessage[],
  apiKey?: string
): Promise<AIResponse> {
  const client = await getOpenAIClient(apiKey)
  const agentModel = process.env.AGENT_MODEL || 'google/gemini-2.0-flash-thinking-exp:free'
  
  const systemPrompt = `You are an AI agent that decides what action to take based on user requests.
Analyze the user's message and current page state, then return a JSON response with one of these formats:

1. Create new page:
{
  "type": "create",
  "content": "<full HTML content>"
}

2. Edit existing page (line stitching):
{
  "type": "edit",
  "edits": [
    {
      "lineStart": 10,
      "lineEnd": 15,
      "newContent": "replacement code",
      "explanation": "what changed"
    }
  ]
}

3. Answer question:
{
  "type": "answer",
  "message": "response to user"
}

Current page content (with line numbers):
${currentPageContent ? addLineNumbers(currentPageContent) : 'No page exists yet'}

Return ONLY valid JSON, no markdown or explanations.`

  const messages: AIMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: userMessage }
  ]

  const response = await client.chat.completions.create({
    model: agentModel,
    messages: messages as any,
    temperature: 0.3,
    response_format: { type: 'json_object' }
  })

  const content = response.choices[0]?.message?.content || '{}'
  return JSON.parse(content) as AIResponse
}

export async function editPageWithAI(
  prompt: string,
  currentContent: string,
  model: string = 'google/gemini-2.0-flash-lite-001',
  apiKey?: string
): Promise<LineEdit[]> {
  const client = await getOpenAIClient(apiKey)
  
  const systemPrompt = `You are an expert code editor. Given the current HTML page content with line numbers, 
provide precise line-based edits to fulfill the user's request.

Return ONLY a JSON array of edits in this format:
[
  {
    "lineStart": 10,
    "lineEnd": 15,
    "newContent": "replacement code",
    "explanation": "what changed"
  }
]

Current page content:
${addLineNumbers(currentContent)}

Return ONLY valid JSON array, no markdown or explanations.`

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' }
  })

  const content = response.choices[0]?.message?.content || '{"edits": []}'
  const parsed = JSON.parse(content)
  return parsed.edits || []
}

export function addLineNumbers(content: string): string {
  const lines = content.split('\n')
  return lines.map((line, index) => `${index + 1} | ${line}`).join('\n')
}

export function applyLineEdits(content: string, edits: LineEdit[]): string {
  const lines = content.split('\n')
  
  // Sort edits by lineStart in descending order to avoid index issues
  const sortedEdits = [...edits].sort((a, b) => b.lineStart - a.lineStart)
  
  for (const edit of sortedEdits) {
    const { lineStart, lineEnd, newContent } = edit
    const newLines = newContent.split('\n')
    
    // Remove old lines and insert new ones (line numbers are 1-indexed)
    lines.splice(lineStart - 1, lineEnd - lineStart + 1, ...newLines)
  }
  
  return lines.join('\n')
}

export function getUserApiKey(userId: string, encryptedKeys: any[]): string | undefined {
  const userKey = encryptedKeys.find(k => k.provider === 'openrouter')
  return userKey ? decryptApiKey(userKey.key) : undefined
}
