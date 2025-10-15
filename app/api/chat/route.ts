import { NextRequest, NextResponse } from 'next/server'
import { getAdvancedRAGService } from '@/lib/rag/advancedRAG'

const advancedRAGService = getAdvancedRAGService()

const USE_ADVANCED_RAG = process.env.USE_ADVANCED_RAG === 'true'

export async function POST(request: NextRequest) {
  try {
    const { message, history = [] } = await request.json() as {
      message: string,
      history?: Array<{ role: 'user' | 'assistant'; content: string }>
    }

    const blockedKeywords = [
      'fuck','shit','drop table','씨발','ㅅㅂ','욕설','select * from','sql injection','delete from'
    ]
    const lowerMessage = (message || '').toLowerCase()
    const containsBlocked = blockedKeywords.some(k => lowerMessage.includes(k))
    if (containsBlocked) {
      return NextResponse.json({ reply: '죄송합니다. 부적절한 요청에는 답변드릴 수 없습니다.' })
    }

    const isSingleChar = typeof message === 'string' && message.trim().length === 1
    const isOnlyJamo = /^[ㄱ-ㅎㅏ-ㅣ]{2,}$/.test(message || '')
    const isSameCharRepeat = /(.)\1\1/.test(message || '')
    if (isSingleChar || isOnlyJamo || isSameCharRepeat) {
      return NextResponse.json({
        reply: '입력하신 내용을 이해하기 어려워요. 금·은·외환에 대해 궁금한 점을 말씀해 주세요!',
      })
    }

    if ((message || '').length > 1000) {
      return NextResponse.json({ reply: '입력 내용이 너무 길어요. 간단하게 질문해 주세요!' })
    }

    const RECENT_TURNS = 6
    const trimmedHistory = Array.isArray(history) ? history.slice(-RECENT_TURNS) : []

    try {
      if (USE_ADVANCED_RAG) {
        await advancedRAGService.initializeRAG()
      }
    } catch (initError) {
    }

    if (USE_ADVANCED_RAG) {
      return await advancedRAGService.generateAdvancedResponseStream(message, trimmedHistory)
    } 
  } catch (error) {
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    )
  }
}
