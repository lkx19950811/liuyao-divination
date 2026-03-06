import { v4 as uuidv4 } from 'uuid'
import type { PersonaType, ChatMessage, Session } from './personas'
import { PERSONA_PROMPTS, PERSONAS } from './personas'

/**
 * AI 会话管理器
 * 管理多轮对话和人格切换
 */
export class SessionManager {
  private currentSession: Session | null = null
  private currentPersona: PersonaType = 'mentor'
  private sessions: Map<string, Session> = new Map()

  /**
   * 获取所有可用的人格
   */
  getPersonas() {
    return PERSONAS
  }

  /**
   * 设置当前人格
   */
  setPersona(persona: PersonaType): void {
    this.currentPersona = persona
  }

  /**
   * 获取当前人格
   */
  getCurrentPersona(): PersonaType {
    return this.currentPersona
  }

  /**
   * 创建新会话
   */
  createSession(divinationId: string): Session {
    const sessionId = uuidv4()
    const now = Date.now()

    const session: Session = {
      id: sessionId,
      divinationId,
      persona: this.currentPersona,
      messages: [],
      createdAt: now,
      updatedAt: now
    }

    this.sessions.set(sessionId, session)
    this.currentSession = session

    return session
  }

  /**
   * 获取当前会话
   */
  getCurrentSession(): Session | null {
    return this.currentSession
  }

  /**
   * 获取会话
   */
  getSession(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId)
  }

  /**
   * 添加消息到当前会话
   */
  addMessage(content: string, role: 'user' | 'assistant'): ChatMessage {
    if (!this.currentSession) {
      throw new Error('No active session')
    }

    const message: ChatMessage = {
      role,
      content,
      timestamp: Date.now()
    }

    this.currentSession.messages.push(message)
    this.currentSession.updatedAt = Date.now()

    return message
  }

  /**
   * 获取会话历史
   */
  getSessionHistory(sessionId?: string): ChatMessage[] {
    const session = sessionId
      ? this.sessions.get(sessionId)
      : this.currentSession

    return session?.messages || []
  }

  /**
   * 删除会话
   */
  deleteSession(sessionId: string): boolean {
    if (this.currentSession?.id === sessionId) {
      this.currentSession = null
    }
    return this.sessions.delete(sessionId)
  }

  /**
   * 清除所有会话
   */
  clearAllSessions(): void {
    this.sessions.clear()
    this.currentSession = null
  }

  /**
   * 构建 AI Prompt（包含人格和上下文）
   */
  buildPrompt(
    hexagramContext: string,
    userMessage: string,
    session?: Session
  ): string {
    // 优先使用会话中保存的人格，确保同一会话风格一致
    const personaId = session?.persona || this.currentPersona
    const persona = PERSONA_PROMPTS[personaId]
    const history = session?.messages || []

    let prompt = `${persona}\n\n`

    // 添加卦象上下文
    prompt += `【卦象信息】\n${hexagramContext}\n\n`

    // 添加对话历史
    if (history.length > 0) {
      prompt += `【对话历史】\n`
      history.forEach(msg => {
        prompt += `${msg.role === 'user' ? '用户' : 'AI'}: ${msg.content}\n`
      })
      prompt += '\n'
    }

    // 添加当前问题
    prompt += `【用户问题】\n${userMessage}\n\n请回答：`

    return prompt
  }

  /**
   * 导出会话数据（用于保存到数据库）
   */
  exportSessionData(sessionId?: string): {
    id: string
    divinationId: string
    persona: PersonaType
    messages: string
    createdAt: number
    updatedAt: number
  } | null {
    const session = sessionId
      ? this.sessions.get(sessionId)
      : this.currentSession

    if (!session) return null

    return {
      id: session.id,
      divinationId: session.divinationId,
      persona: session.persona,
      messages: JSON.stringify(session.messages),
      createdAt: session.createdAt,
      updatedAt: session.updatedAt
    }
  }
}

// 导出单例
export const sessionManager = new SessionManager()