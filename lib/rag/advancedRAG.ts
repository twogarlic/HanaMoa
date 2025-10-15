import { OpenAI } from "openai";
import { getVectorStoreManager } from "./vectorStore";
import { Document } from "@langchain/core/documents";
import { PriceService } from "./priceService";
import { getCrossEncoderService } from "./crossEncoder";
import https from 'https';
import http from 'http';

// HTTP/2 에이전트 설정 (연결 재사용 및 멀티플렉싱)
const httpAgent = new http.Agent({
  keepAlive: true,
  keepAliveMsecs: 30000,
  maxSockets: 10,
  maxFreeSockets: 5,
  timeout: 60000,
});

const httpsAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 30000,
  maxSockets: 10,
  maxFreeSockets: 5,
  timeout: 60000,
  rejectUnauthorized: true,
});

export class AdvancedRAGService {
  private client: OpenAI;
  private openaiClient: OpenAI;
  private vectorStoreManager: any;
  private model: string;
  private priceService: PriceService;
  private crossEncoderService: any;
  private connectionPool: OpenAI[] = [];
  private poolIndex: number = 0;

  constructor() {
    // HuggingFace Router API를 통해 Llama3 모델 사용
    this.client = new OpenAI({
      baseURL: "https://router.huggingface.co/v1",
      apiKey: process.env.HUGGINGFACE_API_KEY,
      // @ts-ignore - HTTP/2 최적화를 위한 에이전트 설정
      httpAgent: httpsAgent,
    });
    this.model = process.env.HUGGINGFACE_MODEL || "MLP-KTLim/llama-3-Korean-Bllossom-8B:featherless-ai";
    
    this.openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      // @ts-ignore
      httpAgent: httpsAgent,
    });
    
    this.vectorStoreManager = getVectorStoreManager();
    this.priceService = new PriceService();
    this.crossEncoderService = getCrossEncoderService();
    
    // 연결 풀링
    for (let i = 0; i < 3; i++) {
      this.connectionPool.push(new OpenAI({
        baseURL: "https://router.huggingface.co/v1",
        apiKey: process.env.HUGGINGFACE_API_KEY,
        // @ts-ignore
        httpAgent: httpsAgent,
      }));
    }
  }

  // 다음 클라이언트 가져오기 
  private getNextClient(): OpenAI {
    const client = this.connectionPool[this.poolIndex];
    this.poolIndex = (this.poolIndex + 1) % this.connectionPool.length;
    return client;
  }

  // HyDE
  async generateHyDEQuery(userMessage: string): Promise<string> {
    try {
      const hydePrompt = `당신은 하나모아 서비스에 대해 잘 알고 있는 금융 전문 컨설턴트입니다.
아래 질문에 대해 하나모아 서비스 정보를 바탕으로,
전문적이지만 이해하기 쉬운 설명형 문서(200~250자)를 작성해주세요.

요구사항:
1. 오직 하나모아의 서비스 정보만 포함할 것
2. 금, 은, 외환 투자 관련 실제 기능 중심으로 설명할 것
3. 실용적이며 고객이 참고할 만한 방식으로 구체적으로 서술할 것
4. 과장 없이, 사실에 기반한 중립적인 톤 유지
5. 문단으로 된 답변문 하나만 작성 (목차나 항목 없이)

질문: ${userMessage}

답변 문서:`;


      const response = await this.openaiClient.chat.completions.create({
        model: "gpt-4o-mini", 
        messages: [{ role: "user", content: hydePrompt }],
        max_tokens: 250, 
        temperature: 0.7
      });

      return response.choices[0]?.message?.content || "";
    } catch (error) {
      return userMessage; 
    }
  }

  // HyDE 검색
  async searchWithHyDE(userMessage: string, k: number = 3): Promise<Document[]> {
    try {
      const hydeDocument = await this.generateHyDEQuery(userMessage);
      return await this.vectorStoreManager.searchSimilarDocuments(hydeDocument, k);
    } catch (error) {
      return [];
    }
  }

  // Multi-Query
  async generateMultiQueries(userMessage: string): Promise<string[]> {
    try {
      const multiQueryPrompt = `질문을 2가지 다른 방식으로 표현(각 줄에 하나씩, 번호/기호 없이):
${userMessage}`;

      const response = await this.openaiClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: multiQueryPrompt }],
        max_tokens: 100, 
        temperature: 0.5
      });

      const content = response.choices[0]?.message?.content || "";
      const queries = content
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '').trim())
        .filter(line => line.length > 5)
        .slice(0, 2);

      return queries.length > 0 ? queries : [userMessage];
    } catch (error) {
      return [userMessage];
    }
  }

  // Multi-Query 검색 
  async searchWithMultiQuery(userMessage: string, k: number = 3): Promise<Document[]> {
    try {
      const queries = await this.generateMultiQueries(userMessage);
      
      const allResultsArrays = await Promise.all(
        queries.map(query => this.vectorStoreManager.searchSimilarDocuments(query, k))
      );
      
      const allResults = allResultsArrays.flat();

      return allResults;
    } catch (error) {
      return [];
    }
  }

  // RRF
  reciprocalRankFusion(resultsA: Document[], resultsB: Document[], k: number = 60): Document[] {
    const docScores = new Map<string, { doc: Document; score: number }>();

    resultsA.forEach((doc, index) => {
      const docId = this.getDocumentId(doc);
      const score = 1 / (k + index + 1);
      docScores.set(docId, { doc, score: (docScores.get(docId)?.score || 0) + score });
    });

    resultsB.forEach((doc, index) => {
      const docId = this.getDocumentId(doc);
      const score = 1 / (k + index + 1);
      docScores.set(docId, { doc, score: (docScores.get(docId)?.score || 0) + score });
    });

    // 점수순으로 정렬하여 상위 문서 반환
    return Array.from(docScores.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(({ doc }) => doc);
  }

  // 문서 ID 생성
  private getDocumentId(doc: Document): string {
    return doc.metadata?.id || doc.pageContent.substring(0, 100).replace(/\s+/g, '_');
  }

  // MMR
  async mmrDiversification(
    documents: Document[], 
    query: string, 
    lambda: number = 0.7, 
    k: number = 5
  ): Promise<Document[]> {
    if (documents.length <= k) return documents;

    const selected: Document[] = [];
    const remaining = [...documents];

    if (remaining.length > 0) {
      selected.push(remaining.shift()!);
    }

    while (selected.length < k && remaining.length > 0) {
      let bestDoc: Document | null = null;
      let bestScore = -Infinity;

      for (const doc of remaining) {
        // 관련성 점수
        const relevanceScore = this.calculateRelevance(doc, query);
        
        // 다양성 점수
        const diversityScore = Math.min(
          ...selected.map(selectedDoc => 
            this.calculateSimilarity(doc, selectedDoc)
          )
        );

        // MMR
        const mmrScore = lambda * relevanceScore - (1 - lambda) * diversityScore;

        if (mmrScore > bestScore) {
          bestScore = mmrScore;
          bestDoc = doc;
        }
      }

      if (bestDoc) {
        selected.push(bestDoc);
        remaining.splice(remaining.indexOf(bestDoc), 1);
      } else {
        break;
      }
    }

    return selected;
  }

  // 관련성 점수 계산
  private calculateRelevance(doc: Document, query: string): number {
    const queryWords = query.toLowerCase().split(/\s+/);
    const docWords = doc.pageContent.toLowerCase().split(/\s+/);
    
    const matches = queryWords.filter(word => 
      docWords.some(docWord => docWord.includes(word) || word.includes(docWord))
    );
    
    return matches.length / queryWords.length;
  }

  // 문서 간 유사도 계산
  private calculateSimilarity(doc1: Document, doc2: Document): number {
    const words1 = new Set(doc1.pageContent.toLowerCase().split(/\s+/));
    const words2 = new Set(doc2.pageContent.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  // Cross-Encoder 리랭킹 
  async crossEncoderRerank(query: string, documents: Document[]): Promise<Document[]> {
    try {
      // 배치 처리 방식 사용
      const rankedDocs = await this.crossEncoderService.rerankDocumentsBatch(
        query, 
        documents, 
        3,  
        10  
      );
      
      rankedDocs.forEach((doc: Document, index: number) => {
        const score = doc.metadata?.crossEncoderScore;
      });
      
      return rankedDocs;
    } catch (error) {     
      const scoredDocs = documents.map(doc => {
        const score = this.calculateRelevance(doc, query);
        return { doc, score };
      });

      return scoredDocs
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(({ doc }) => doc);
    }
  }

  async generateAdvancedResponseStream(
    userMessage: string,
    history: Array<{ role: 'user' | 'assistant'; content: string }> = []
  ): Promise<Response> {
    const startTime = Date.now();
    const timings: { [key: string]: number } = {};
    
    try {
      const priceCheckStart = Date.now();
      const priceQuery = this.priceService.isPriceQuery(userMessage);
      if (priceQuery.isPrice && priceQuery.asset) {
        const priceData = await this.priceService.getRealTimePrice(priceQuery.asset);
        if (priceData) {
          const reply = this.priceService.formatPriceInfo(priceData, priceQuery.asset);
          return new Response(JSON.stringify({ reply }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
      timings['0_시세체크'] = Date.now() - priceCheckStart;

      const parallelSearchStart = Date.now();
      
      const [hydeQuery, multiQueries] = await Promise.all([
        this.generateHyDEQuery(userMessage),
        this.generateMultiQueries(userMessage)
      ]);
      
      const allQueries = [hydeQuery, ...multiQueries];
      const allResults = await this.vectorStoreManager.searchSimilarDocumentsBatch(allQueries, 3);

      const hydeResults = allResults.slice(0, 3);
      const multiQueryResults = allResults.slice(3);
      
      timings['1-2_병렬검색'] = Date.now() - parallelSearchStart;

      const rrfStart = Date.now();
      const fusedResults = this.reciprocalRankFusion(hydeResults, multiQueryResults);
      timings['3_RRF융합'] = Date.now() - rrfStart;

      const mmrStart = Date.now();
      const diversifiedResults = await this.mmrDiversification(fusedResults, userMessage);
      timings['4_MMR다양화'] = Date.now() - mmrStart;

      const crossEncoderStart = Date.now();
      const finalResults = await this.crossEncoderRerank(userMessage, diversifiedResults);
      timings['5_CrossEncoder'] = Date.now() - crossEncoderStart;

      const contextStart = Date.now();
      const context = finalResults
        .map((doc: any) => doc.pageContent)
        .join('\n\n');
      timings['6_컨텍스트구성'] = Date.now() - contextStart;

      const llmStart = Date.now();
      const response = await this.generateLLMResponseStream(userMessage, context, history);
      timings['7_LLM스트림시작'] = Date.now() - llmStart;

      return response;

    } catch (error) {
      const fallbackResults = await this.vectorStoreManager.searchSimilarDocuments(userMessage, 3);
      const fallbackContext = fallbackResults.map((doc: any) => doc.pageContent).join('\n\n');
      const reply = await this.generateLLMResponse(userMessage, fallbackContext, history);
      return new Response(JSON.stringify({ reply }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  async generateAdvancedResponse(
    userMessage: string,
    history: Array<{ role: 'user' | 'assistant'; content: string }> = []
  ): Promise<string> {
    const startTime = Date.now();
    const timings: { [key: string]: number } = {};
    
    try {
      const priceCheckStart = Date.now();
      const priceQuery = this.priceService.isPriceQuery(userMessage);
      if (priceQuery.isPrice && priceQuery.asset) {
        const priceData = await this.priceService.getRealTimePrice(priceQuery.asset);
        if (priceData) {
          const totalTime = Date.now() - startTime;
          return this.priceService.formatPriceInfo(priceData, priceQuery.asset);
        }
      }
      timings['0_시세체크'] = Date.now() - priceCheckStart;

      const parallelSearchStart = Date.now();
      const [hydeResults, multiQueryResults] = await Promise.all([
        this.searchWithHyDE(userMessage, 5),
        this.searchWithMultiQuery(userMessage, 5)
      ]);
      timings['1-2_병렬검색'] = Date.now() - parallelSearchStart;

      const rrfStart = Date.now();
      const fusedResults = this.reciprocalRankFusion(hydeResults, multiQueryResults);
      timings['3_RRF융합'] = Date.now() - rrfStart;

      const mmrStart = Date.now();
      const diversifiedResults = await this.mmrDiversification(fusedResults, userMessage);
      timings['4_MMR다양화'] = Date.now() - mmrStart;

      const crossEncoderStart = Date.now();
      const finalResults = await this.crossEncoderRerank(userMessage, diversifiedResults);
      timings['5_CrossEncoder'] = Date.now() - crossEncoderStart;

      const contextStart = Date.now();
      const context = finalResults
        .map((doc: any) => doc.pageContent)
        .join('\n\n');
      timings['6_컨텍스트구성'] = Date.now() - contextStart;

      const llmStart = Date.now();
      const response = await this.generateLLMResponse(userMessage, context, history);
      timings['7_LLM응답'] = Date.now() - llmStart;

      const totalTime = Date.now() - startTime;
      return response;

    } catch (error) {
      const fallbackResults = await this.vectorStoreManager.searchSimilarDocuments(userMessage, 3);
      const fallbackContext = fallbackResults.map((doc: any) => doc.pageContent).join('\n\n');
      return await this.generateLLMResponse(userMessage, fallbackContext, history);
    }
  }

  private cleanMarkdown(text: string): string {
    return text
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/###\s*/g, '')
      .replace(/##\s*/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/^[\s]*[-*+]\s+/gm, '')
      .replace(/^\d+\.\s+/gm, '')
      .replace(/^>\s*/gm, '')
      .replace(/^[-*_]{3,}$/gm, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  private async generateLLMResponseStream(
    userMessage: string,
    context: string,
    history: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<Response> {
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: "system" as const,
        content: `당신은 하나금융그룹의 디지털 자산 플랫폼 '하나모아' 전문 상담 챗봇입니다.
항상 한국어로, 이모티콘 없이, 친근하고 공손하게 답변합니다.

참고 정보:
${context || "관련 정보 없음"}

중요 규칙:
- 참고 정보를 바탕으로 정확하게 답변하세요
- 정보가 불충분하면 "정확한 정보를 위해 문의해주세요"라고 안내하세요
- "고객님" 호칭을 사용하고 존칭을 유지하세요
- 답변을 완전히 마무리하세요 (중간에 끊지 마세요)
- 절대로 마크다운 문법을 사용하지 마세요 (샵, 별표, 대시, 숫자점 등 모두 금지)
- 제목이나 구분이 필요하면 줄바꿈만 사용하세요
- 반드시 일반 텍스트로만 답변하세요`
      }
    ];

    // 대화 히스토리 추가 
    const recentHistory = history.slice(-2);
    for (const turn of recentHistory) {
      if (turn.role === 'user') {
        messages.push({
          role: "user" as const,
          content: turn.content
        });
      } else {
        messages.push({
          role: "assistant" as const,
          content: turn.content
        });
      }
    }

    // 현재 사용자 메시지 추가
    messages.push({
      role: "user" as const,
      content: userMessage
    });

    const client = this.getNextClient();
    const stream = await client.chat.completions.create({
      model: this.model,
      messages: messages,
      max_tokens: 800,
      temperature: 0.7,
      stream: true, 
    });

    const encoder = new TextEncoder();
    const self = this; 
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          let fullText = '';
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            fullText += content;
            
            const cleanedContent = self.cleanMarkdown(content);
            
            // 실시간으로 클라이언트에 전송
            const data = JSON.stringify({ 
              content: cleanedContent, 
              done: false 
            });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }

          // 스트리밍 완료
          const cleanedFullText = self.cleanMarkdown(fullText);
          const finalData = JSON.stringify({ 
            content: '', 
            done: true,
            reply: cleanedFullText 
          });
          controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }

  // LLM 응답 생성
  private async generateLLMResponse(
    userMessage: string,
    context: string,
    history: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<string> {
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: "system" as const,
        content: `당신은 하나금융그룹의 디지털 자산 플랫폼 '하나모아' 전문 상담 챗봇입니다.
항상 한국어로, 이모티콘 없이, 친근하고 공손하게 답변합니다.

참고 정보:
${context || "관련 정보 없음"}

중요 규칙:
- 참고 정보를 바탕으로 정확하게 답변하세요
- 정보가 불충분하면 "정확한 정보를 위해 문의해주세요"라고 안내하세요
- "고객님" 호칭을 사용하고 존칭을 유지하세요
- 답변을 완전히 마무리하세요 (중간에 끊지 마세요)
- 절대로 마크다운 문법을 사용하지 마세요 (샵, 별표, 대시, 숫자점 등 모두 금지)
- 제목이나 구분이 필요하면 줄바꿈만 사용하세요
- 반드시 일반 텍스트로만 답변하세요`
      }
    ];

      // 대화 히스토리 추가
      const recentHistory = history.slice(-2);
      for (const turn of recentHistory) {
        if (turn.role === 'user') {
          messages.push({
            role: "user" as const,
            content: turn.content
          });
        } else {
          messages.push({
            role: "assistant" as const,
            content: turn.content
          });
        }
      }

      // 현재 사용자 메시지 추가
      messages.push({
        role: "user" as const,
        content: userMessage
      });

    const client = this.getNextClient();
    const stream = await client.chat.completions.create({
      model: this.model,
      messages: messages,
      max_tokens: 800, 
      temperature: 0.7,
      stream: true, 
    });

    // 스트림에서 텍스트 수집
    let rawResponse = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      rawResponse += content;
    }

    if (!rawResponse) {
      return '죄송합니다. 응답을 생성할 수 없습니다.';
    }

    return this.cleanMarkdown(rawResponse);
  }

  // 벡터 스토어 초기화
  async initializeRAG(): Promise<void> {
    try {
      await this.vectorStoreManager.initializeVectorStore();
    } catch (error) {
      throw error;
    }
  }
}

// 싱글톤 인스턴스
let advancedRAGService: AdvancedRAGService | null = null;

export function getAdvancedRAGService(): AdvancedRAGService {
  if (!advancedRAGService) {
    advancedRAGService = new AdvancedRAGService();
  }
  return advancedRAGService;
}
