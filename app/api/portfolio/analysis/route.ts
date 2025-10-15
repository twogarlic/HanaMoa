import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/database'
import prismaPrice from '../../../../lib/database-price'
import OpenAI from 'openai'

interface PortfolioAnalysis {
  totalValue: number
  totalInvestment: number
  totalProfitLoss: number
  totalProfitLossRatio: number
  diversification: {
    score: number
    level: string
    description: string
  }
  riskAnalysis: {
    level: string
    score: number
    description: string
    concentrationRisk: number
  }
  assetBreakdown: Array<{
    asset: string
    assetName: string
    quantity: number
    currentValue: number
    percentage: number
    profitLoss: number
    profitLossRatio: number
  }>
  recommendations: Array<{
    type: string
    title: string
    description: string
    priority: string
  }>
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const getAssetName = (asset: string): string => {
  const assetNames: { [key: string]: string } = {
    'gold': '금',
    'silver': '은',
    'usd': '달러',
    'eur': '유로',
    'jpy': '엔',
    'cny': '위안'
  }
  return assetNames[asset] || asset
}

const analyzePortfolioWithAI = async (holdings: any[], totalValue: number, totalInvestment: number, totalProfitLoss: number, totalProfitLossRatio: number) => {
  try {
  const herfindahlIndex = holdings.reduce((sum, holding) => {
    const weight = holding.currentValue / totalValue
    return sum + (weight * weight)
  }, 0)
    const diversificationScore = Math.round((1 - herfindahlIndex) * 100)
    
    const maxWeight = Math.max(...holdings.map(holding => holding.currentValue / totalValue))
    const concentrationRisk = Math.round(maxWeight * 100)

    const assetDetails = holdings.map(h => ({
      자산명: getAssetName(h.asset),
      수량: h.quantity,
      현재가치: h.currentValue,
      비중: `${((h.currentValue / totalValue) * 100).toFixed(1)}%`,
      수익률: `${h.profitLossRatio.toFixed(2)}%`
    }))

    const prompt = `당신은 하나모아 플랫폼의 금융 전문가입니다. 하나모아는 금, 은, 외환(달러, 유로, 엔, 위안) 투자만 다루는 플랫폼입니다.

포트폴리오 정보:
- 총 자산 가치: ${totalValue.toLocaleString()}원
- 총 투자금: ${totalInvestment.toLocaleString()}원
- 총 손익: ${totalProfitLoss.toLocaleString()}원
- 총 수익률: ${totalProfitLossRatio.toFixed(2)}%
- 분산투자 점수: ${diversificationScore}점 (0-100, 허핀달 지수 기반)
- 집중도 리스크: ${concentrationRisk}% (가장 큰 자산의 비중)

자산 구성:
${JSON.stringify(assetDetails, null, 2)}

다음 형식의 JSON으로 답변해주세요:
{
  "diversification": {
    "level": "우수/양호/보통/부족 중 하나",
    "description": "분산투자 수준에 대한 2-3문장의 설명"
  },
  "riskAnalysis": {
    "level": "낮음/보통/높음/매우 높음 중 하나",
    "description": "리스크 수준에 대한 2-3문장의 설명"
  },
  "recommendations": [
    {
      "type": "diversification/risk/performance/asset 중 하나",
      "title": "제목 (10자 이내)",
      "description": "상세 설명 (50자 이내)",
      "priority": "high/medium/low 중 하나"
    }
  ]
}

중요 제약사항:
- 오직 금, 은, 달러, 유로, 엔, 위안만 추천하세요
- 부동산, 채권, 주식 등 다른 자산은 절대 언급하지 마세요
- 하나모아 플랫폼 내에서 투자 가능한 자산만 다루세요
- 금과 은은 안전자산으로 변동성이 낮습니다
- 외환(달러, 유로, 엔, 위안)은 상대적으로 변동성이 높습니다
- 집중도 리스크가 60% 이상이면 다른 자산(금, 은, 외환)으로 분산투자를 권장합니다
- 수익률이 -10% 이하면 손실 관리를, +20% 이상이면 수익 실현을 제안합니다
- 최대 4개의 실용적이고 구체적인 추천을 제공해주세요`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '당신은 금융 전문가입니다. 항상 JSON 형식으로만 답변하며, 한국의 투자자들에게 실용적이고 이해하기 쉬운 조언을 제공합니다.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    })

    const analysis = JSON.parse(completion.choices[0].message.content || '{}')
    
    return {
      diversificationScore,
      concentrationRisk,
      diversification: {
        score: diversificationScore,
        level: analysis.diversification?.level || '보통',
        description: analysis.diversification?.description || '분석 결과를 처리하는 중입니다.'
      },
      riskAnalysis: {
        level: analysis.riskAnalysis?.level || '보통',
        score: concentrationRisk,
        description: analysis.riskAnalysis?.description || '리스크 분석 중입니다.',
        concentrationRisk
      },
      recommendations: analysis.recommendations || []
    }
  } catch (error) {    
    const herfindahlIndex = holdings.reduce((sum, holding) => {
      const weight = holding.currentValue / totalValue
      return sum + (weight * weight)
    }, 0)
    const diversificationScore = Math.round((1 - herfindahlIndex) * 100)
  const maxWeight = Math.max(...holdings.map(holding => holding.currentValue / totalValue))
  const concentrationRisk = Math.round(maxWeight * 100)

    let diversificationLevel = '보통'
    if (diversificationScore >= 70) diversificationLevel = '우수'
    else if (diversificationScore >= 50) diversificationLevel = '양호'
    else if (diversificationScore < 30) diversificationLevel = '부족'
    
    let riskLevel = '보통'
    if (concentrationRisk > 70) riskLevel = '매우 높음'
    else if (concentrationRisk > 50) riskLevel = '높음'
    else if (concentrationRisk < 30) riskLevel = '낮음'

  return { 
      diversificationScore,
      concentrationRisk,
      diversification: {
        score: diversificationScore,
        level: diversificationLevel,
        description: '포트폴리오 분산투자 수준을 분석했습니다.'
      },
      riskAnalysis: {
    level: riskLevel, 
        score: concentrationRisk,
        description: '포트폴리오의 리스크 수준을 평가했습니다.',
    concentrationRisk 
      },
      recommendations: [
        {
      type: 'diversification',
          title: '분산투자 검토',
          description: '포트폴리오의 분산투자 수준을 점검해보세요.',
          priority: 'medium'
        }
      ]
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: '사용자 ID가 필요합니다.'
      }, { status: 400 })
    }
    
    const holdings = await prisma.holding.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    })
    
    if (holdings.length === 0) {
      return NextResponse.json({
        success: true,
        analysis: {
          totalValue: 0,
          totalInvestment: 0,
          totalProfitLoss: 0,
          totalProfitLossRatio: 0,
          diversification: { score: 0, level: '없음', description: '보유 자산이 없습니다.' },
          riskAnalysis: { level: '없음', score: 0, description: '보유 자산이 없습니다.', concentrationRisk: 0 },
          assetBreakdown: [],
          recommendations: [{
            type: 'start',
            title: '투자 시작하기',
            description: '하나모아에서 금, 은, 외환 투자를 시작해보세요.',
            priority: 'high'
          }]
        }
      })
    }
    
    const realTimePrices = await prismaPrice.realTimePrice.findMany({
      where: {
        asset: { in: holdings.map(h => h.asset) }
      }
    })
    
    const holdingsWithPrices = holdings.map(holding => {
      const realTimePrice = realTimePrices.find((rtp: any) => rtp.asset === holding.asset)
      const currentPrice = realTimePrice?.currentPrice || 0
      const currentValue = currentPrice * holding.quantity
      const profitLoss = currentValue - holding.totalAmount
      const profitLossRatio = holding.totalAmount > 0 ? (profitLoss / holding.totalAmount) * 100 : 0
      
      return {
        ...holding,
        currentPrice,
        currentValue,
        profitLoss,
        profitLossRatio
      }
    })
    
    const totalValue = holdingsWithPrices.reduce((sum, holding) => sum + holding.currentValue, 0)
    const totalInvestment = holdingsWithPrices.reduce((sum, holding) => sum + holding.totalAmount, 0)
    const totalProfitLoss = totalValue - totalInvestment
    const totalProfitLossRatio = totalInvestment > 0 ? (totalProfitLoss / totalInvestment) * 100 : 0
    
    const aiAnalysis = await analyzePortfolioWithAI(
      holdingsWithPrices,
      totalValue,
      totalInvestment,
      totalProfitLoss,
      totalProfitLossRatio
    )
    
    const assetBreakdown = holdingsWithPrices
      .filter(holding => holding.currentValue > 0)
      .map(holding => ({
        asset: holding.asset,
        assetName: getAssetName(holding.asset),
        quantity: holding.quantity,
        currentValue: holding.currentValue,
        percentage: totalValue > 0 ? (holding.currentValue / totalValue) * 100 : 0,
        profitLoss: holding.profitLoss,
        profitLossRatio: holding.profitLossRatio
      }))
      .sort((a, b) => b.percentage - a.percentage)
    
    const analysis: PortfolioAnalysis = {
      totalValue,
      totalInvestment,
      totalProfitLoss,
      totalProfitLossRatio,
      diversification: aiAnalysis.diversification,
      riskAnalysis: aiAnalysis.riskAnalysis,
      assetBreakdown,
      recommendations: aiAnalysis.recommendations
    }
    
    return NextResponse.json({
      success: true,
      analysis
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '포트폴리오 분석 중 오류가 발생했습니다.'
    }, { status: 500 })
    }
}


