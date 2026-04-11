export type ServiceId =
  | 'chatgpt'
  | 'claude'
  | 'gemini'
  | 'aistudio'
  | 'labs'
  | 'qwen'
  | 'deepseek'
  | 'kimi'
  | 'grok'
  | 'perplexity'
  | 'mistral'
  | 'copilot'
  | 'metaai'
  | 'character'

export interface Service {
  id: ServiceId
  label: string
  accent: string
  homeUrl: string
}

export const SERVICES: Service[] = [
  { id: 'chatgpt', label: 'ChatGPT', accent: '#10A37F', homeUrl: 'https://chatgpt.com' },
  { id: 'claude', label: 'Claude', accent: '#F97316', homeUrl: 'https://claude.ai' },
  { id: 'gemini', label: 'Gemini', accent: '#6366F1', homeUrl: 'https://gemini.google.com' },
  { id: 'aistudio', label: 'AI Studio', accent: '#8B5CF6', homeUrl: 'https://aistudio.google.com' },
  { id: 'labs', label: 'Google Labs', accent: '#EC4899', homeUrl: 'https://labs.google/' },
  { id: 'qwen', label: 'Qwen', accent: '#9333EA', homeUrl: 'https://chat.qwen.ai' },
  { id: 'deepseek', label: 'DeepSeek', accent: '#38BDF8', homeUrl: 'https://chat.deepseek.com' },
  { id: 'kimi', label: 'Kimi', accent: '#A78BFA', homeUrl: 'https://kimi.moonshot.cn' },
  { id: 'grok', label: 'Grok', accent: '#94A3B8', homeUrl: 'https://grok.com' },
  { id: 'perplexity', label: 'Perplexity', accent: '#2563EB', homeUrl: 'https://www.perplexity.ai' },
  { id: 'mistral', label: 'Mistral', accent: '#EF4444', homeUrl: 'https://chat.mistral.ai' },
  { id: 'copilot', label: 'Copilot', accent: '#0EA5E9', homeUrl: 'https://copilot.microsoft.com' },
  { id: 'metaai', label: 'Meta AI', accent: '#1877F2', homeUrl: 'https://www.meta.ai' },
  { id: 'character', label: 'Character.AI', accent: '#22C55E', homeUrl: 'https://character.ai' }
]

const IDS = new Set<ServiceId>(SERVICES.map((s) => s.id))

export function isServiceId(id: string): id is ServiceId {
  return IDS.has(id as ServiceId)
}

export function getService(id: ServiceId): Service {
  const s = SERVICES.find((x) => x.id === id)
  if (!s) throw new Error(`Unknown service: ${id}`)
  return s
}
