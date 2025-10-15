import { Document } from "@langchain/core/documents";

export class PriceService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = 'https://hana-final.vercel.app/';
  }

  async getRealTimePrice(asset: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/market/${asset}`);
      
      if (!response.ok) {
        console.error(`${asset} API 응답 오류:`, response.status, response.statusText);
        return null;
      }
      
      const data = await response.json();
      console.log(`${asset} API 응답:`, data);
      
      if (data.type) {
        if (data.currentPrice !== undefined) {
          return {
            price: data.currentPrice,
            change: data.changeValue,
            changePercent: data.changeRatio,
            timestamp: data.lastUpdated,
            isUp: data.isUp === 1
          };
        }
        else if (data.depositPrice !== undefined) {
          return {
            price: data.depositPrice,
            change: data.changeValue,
            changePercent: data.changeRatio,
            timestamp: data.lastUpdated,
            isUp: data.isUp === 1
          };
        }
      }
      
      return data;
    } catch (error) {
      console.error(`${asset} 시세 조회 오류:`, error);
      return null;
    }
  }

  isPriceQuery(userMessage: string): { isPrice: boolean; asset?: string } {
    const priceKeywords = {
      'gold': ['금시세', '금가격', '금값', '금 시세', '금 가격', '금값'],
      'silver': ['은시세', '은가격', '은값', '은 시세', '은 가격', '은값'],
      'usd': ['달러시세', '달러가격', '달러 시세', '달러 가격', '달러값'],
      'jpy': ['엔시세', '엔가격', '엔 시세', '엔 가격', '엔값'],
      'eur': ['유로시세', '유로가격', '유로 시세', '유로 가격', '유로값'],
      'cny': ['위안시세', '위안가격', '위안 시세', '위안 가격', '위안값']
    };

    const lowerMessage = userMessage.toLowerCase().trim();
    
    for (const [asset, keywords] of Object.entries(priceKeywords)) {
      for (const keyword of keywords) {
        if (lowerMessage.includes(keyword.toLowerCase())) {
          return { isPrice: true, asset };
        }
      }
    }

    return { isPrice: false };
  }

  formatPriceInfo(priceData: any, asset: string): string {
    if (!priceData || !priceData.price) {
      return `죄송합니다. ${asset} 시세 정보를 가져올 수 없습니다.`;
    }

    const { price, change, changePercent, timestamp, isUp } = priceData;
    
    let displayPrice = price;
    let displayChange = change;
    
    if (asset === 'gold') {
      displayPrice = (price / 100).toFixed(2);
      displayChange = (change / 100).toFixed(2);
    }
    
    return `${asset.toUpperCase()} 현재 시세는 ${displayPrice}원입니다! 시세는 실시간으로 변동됩니다. 하나모아 앱에서 더 자세한 차트와 분석을 확인하는것 어떠세요?!`;
  }
}
