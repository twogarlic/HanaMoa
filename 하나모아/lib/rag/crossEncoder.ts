import { Document } from "@langchain/core/documents";

export class CrossEncoderService {
  private model: string;
  private apiUrl: string;
  private fastApiUrl: string;
  private useFastApi: boolean;

  constructor() {
    this.model = "Dongjin-kr/ko-reranker";
    this.apiUrl = `https://router.huggingface.co/hf-inference/models/${this.model}`;
    
    this.fastApiUrl = process.env.FASTAPI_RAG_URL || "";
    this.useFastApi = process.env.USE_FASTAPI_RAG !== "false";
  }

  // Cross-Encoder를 사용한 리랭킹 
  async rerankDocuments(query: string, documents: Document[], topK: number = 3): Promise<Document[]> {
    try {
      if (documents.length === 0) {
        return [];
      }

      // FastAPI
      if (this.useFastApi) {
        try {
          return await this.rerankWithFastAPI(query, documents, topK);
        } catch (fastApiError) {
        }
      }

      const scoredDocs = await Promise.all(
        documents.map(async (doc, index) => {
          try {
            const score = await this.calculateRelevanceScore(query, doc.pageContent);
            const safeScore = typeof score === 'number' ? score : 0.0;
            return { doc, score: safeScore };
          } catch (error) {
            return { doc, score: 0.0 };
          }
        })
      );

      const rankedDocs = scoredDocs
        .sort((a, b) => b.score - a.score)
        .slice(0, topK)
        .map(({ doc, score }) => {
          doc.metadata = { ...doc.metadata, crossEncoderScore: score };
          return doc;
        });

      return rankedDocs;

    } catch (error) {
      return documents.slice(0, topK);
    }
  }

  // FastAPI 
  private async rerankWithFastAPI(query: string, documents: Document[], topK: number): Promise<Document[]> {
    const startTime = Date.now();
    
    const response = await fetch(`${this.fastApiUrl}/rerank/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        documents: documents.map(doc => doc.pageContent),
        top_k: topK
      }),
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      throw new Error(`FastAPI 응답 오류: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const elapsedTime = Date.now() - startTime;

    if (!result.success || !result.results) {
      throw new Error('FastAPI 리랭킹 실패');
    }

    const rankedDocs = result.results.map((item: any) => {
      const doc = documents[item.index];
      return {
        ...doc,
        metadata: {
          ...doc.metadata,
          crossEncoderScore: item.score
        }
      };
    });

    return rankedDocs;
  }

  private async calculateRelevanceScore(query: string, document: string): Promise<number> {
    try {
      const maxLength = 400;
      const truncatedDoc = document.length > maxLength 
        ? document.substring(0, maxLength) + "..."
        : document;

      const response = await fetch(this.apiUrl, {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: `${query} [SEP] ${truncatedDoc}`
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      let scores = result;
      
      if (Array.isArray(result) && Array.isArray(result[0])) {
        scores = result[0];
      }
      
      if (Array.isArray(scores) && scores.length > 0) {
        const relevantLabel = scores.find(r => r.label === 'LABEL_1' || r.label === '1');
        if (relevantLabel) {
          return relevantLabel.score;
        }
        
        const irrelevantLabel = scores.find(r => r.label === 'LABEL_0' || r.label === '0');
        if (irrelevantLabel) {
          return 1 - irrelevantLabel.score;
        }

        return scores[0].score || 0.0;
      }

      return 0.0;
    } catch (error) {
      return this.fallbackKeywordScore(query, document);
    }
  }

  private fallbackKeywordScore(query: string, document: string): number {
    const queryWords = query.toLowerCase().split(/\s+/);
    const docWords = document.toLowerCase().split(/\s+/);
    
    const matches = queryWords.filter(word => 
      docWords.some(docWord => docWord.includes(word) || word.includes(docWord))
    );
    
    const score = matches.length / queryWords.length;
    return score;
  }

  async checkModelStatus(): Promise<boolean> {
    try {
      const response = await fetch(this.apiUrl, {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: "테스트 질문 [SEP] 테스트 문서"
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        return Array.isArray(result) && result.length > 0;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }

  async rerankDocumentsBatch(
    query: string, 
    documents: Document[], 
    topK: number = 3,
    batchSize: number = 5
  ): Promise<Document[]> {
    try {
      if (documents.length === 0) {
        return [];
      }

      const scoredDocs: { doc: Document; score: number }[] = [];

      for (let i = 0; i < documents.length; i += batchSize) {
        const batch = documents.slice(i, i + batchSize);
        const batchScores = await Promise.all(
          batch.map(async (doc, index) => {
            try {
              const score = await this.calculateRelevanceScore(query, doc.pageContent);
              return { doc, score };
            } catch (error) {
              return { doc, score: 0.0 };
            }
          })
        );

        scoredDocs.push(...batchScores);
        
        if (i + batchSize < documents.length) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      const rankedDocs = scoredDocs
        .sort((a, b) => b.score - a.score)
        .slice(0, topK)
        .map(({ doc, score }) => {
          doc.metadata = { ...doc.metadata, crossEncoderScore: score };
          return doc;
        });
      return rankedDocs;

    } catch (error) {
      return documents.slice(0, topK);
    }
  }
}

// 싱글톤 인스턴스
let crossEncoderService: CrossEncoderService | null = null;

export function getCrossEncoderService(): CrossEncoderService {
  if (!crossEncoderService) {
    crossEncoderService = new CrossEncoderService();
  }
  return crossEncoderService;
}
