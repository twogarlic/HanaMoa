import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { Document } from "@langchain/core/documents";
import fs from 'fs';
import path from 'path';
import https from 'https';

// HTTP/2 에이전트 설정
const httpsAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 30000,
  maxSockets: 10,
  maxFreeSockets: 5,
  timeout: 60000,
  // HTTP/2 지원 활성화
  rejectUnauthorized: true,
});

export class VectorStoreManager {
  private embeddings: OpenAIEmbeddings;
  private vectorStore: PineconeStore | null = null;
  private pinecone: Pinecone | null = null;
  private isInitialized: boolean = false;
  private indexName: string;

  constructor() {
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "text-embedding-3-large", 
      configuration: {
        // @ts-ignore 
        httpAgent: httpsAgent,
      }
    });
    this.indexName = process.env.PINECONE_INDEX_NAME || "hana-moai-knowledge";
  }

  async initializeVectorStore(): Promise<void> {
    try {
      if (this.isInitialized && this.vectorStore) {
        return;
      }

      this.pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY!,
      });

      const index = this.pinecone.index(this.indexName);

      this.vectorStore = await PineconeStore.fromExistingIndex(this.embeddings, {
        pineconeIndex: index,
        namespace: "hana-moai",
      });
      
      this.isInitialized = true;

    } catch (error) {
      throw error;
    }
  }

  private async loadDocuments(dirPath: string): Promise<Document[]> {
    const documents: Document[] = [];
    
    if (!fs.existsSync(dirPath)) {
      return documents;
    }

    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isFile() && (file.endsWith('.md') || file.endsWith('.txt'))) {
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          documents.push(new Document({
            pageContent: content,
            metadata: { source: file, path: filePath }
          }));
        } catch (error) {
        }
      }
    }

    return documents;
  }

  // 유사한 문서 검색
  async searchSimilarDocuments(query: string, k: number = 3): Promise<Document[]> {
    if (!this.vectorStore) {
      await this.initializeVectorStore();
    }

    if (!this.vectorStore) {
      throw new Error('벡터 스토어가 초기화되지 않았습니다.');
    }

    try {
      const results = await this.vectorStore.similaritySearch(query, k);
      return results;
    } catch (error) {
      throw error;
    }
  }

  // 배치 문서 검색
  async searchSimilarDocumentsBatch(queries: string[], k: number = 3): Promise<Document[]> {
    if (!this.vectorStore) {
      await this.initializeVectorStore();
    }

    if (!this.vectorStore) {
      throw new Error('벡터 스토어가 초기화되지 않았습니다.');
    }

    try {
      const embeddings = await this.embeddings.embedDocuments(queries);
      const batchResults = await Promise.all(
        embeddings.map(embedding => 
          this.vectorStore!.similaritySearchVectorWithScore(embedding, k)
        )
      );

      const allResults = batchResults
        .flat()
        .map(([doc, score]) => {
          doc.metadata = { ...doc.metadata, similarityScore: score };
          return doc;
        });
      return allResults;
    } catch (error) {
      const results = await Promise.all(
        queries.map(query => this.vectorStore!.similaritySearch(query, k))
      );
      return results.flat();
    }
  }

  async rebuildVectorStore(): Promise<void> {
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    const index = this.pinecone.index(this.indexName);
    try {
      await index.deleteAll();
    } catch (error) {
    }

    const knowledgeBasePath = path.join(process.cwd(), 'knowledge-base');
    const documents = await this.loadDocuments(knowledgeBasePath);
    
    if (documents.length === 0) {
      throw new Error('지식 베이스에 문서가 없습니다.');
    }

    // 문서를 청크로 분할
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const splitDocs = await textSplitter.splitDocuments(documents);
    console.log(`${splitDocs.length}개의 문서 청크를 생성했습니다.`);

    // Pinecone 벡터 스토어 생성
    this.vectorStore = await PineconeStore.fromDocuments(splitDocs, this.embeddings, {
      pineconeIndex: index,
      namespace: "hana-moai",
    });
    
    this.isInitialized = true;
    console.log('Pinecone 벡터 스토어가 재생성되었습니다.');
  }

  // 새 문서 추가
  async addDocument(content: string, metadata: Record<string, any> = {}): Promise<void> {
    if (!this.vectorStore) {
      await this.initializeVectorStore();
    }

    if (!this.vectorStore) {
      throw new Error('벡터 스토어가 초기화되지 않았습니다.');
    }

    const document = new Document({
      pageContent: content,
      metadata
    });

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const splitDocs = await textSplitter.splitDocuments([document]);
    await this.vectorStore.addDocuments(splitDocs);
  }
}

// 싱글톤 인스턴스
let vectorStoreManager: VectorStoreManager | null = null;

export function getVectorStoreManager(): VectorStoreManager {
  if (!vectorStoreManager) {
    vectorStoreManager = new VectorStoreManager();
  }
  return vectorStoreManager;
}
