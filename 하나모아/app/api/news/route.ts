import { NextRequest, NextResponse } from 'next/server'

const ASSET_CODES = {
  gold: 'EFKSP411060',  
  silver: 'EFAMXSLV', 
  usd: 'EFKSP261240', 
  jpy: 'EFKSP476750',    
  eur: 'EFAMXFXE',   
  cny: 'EFKSP411060'   
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const asset = searchParams.get('asset') || 'gold'
  const size = searchParams.get('size') || '200'
  const orderBy = searchParams.get('orderBy') || 'relevant'
  const newsId = searchParams.get('newsId')
  
  try {
    if (newsId) {
      const url = `https://wts-info-api.tossinvest.com/api/v2/news/${encodeURIComponent(newsId)}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json',
        },
        next: { revalidate: 300 }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      const newsDetail = data?.result?.kr || data?.result
      
      if (!newsDetail) {
        return NextResponse.json({
          success: false,
          error: 'News detail not found',
          data: null
        })
      }

      return NextResponse.json({
        success: true,
        data: {
          id: newsDetail.id,
          title: newsDetail.title,
          content: newsDetail.content,
          source: newsDetail.source,
          createdAt: newsDetail.createdAt,
          imageUrls: newsDetail.imageUrls,
          linkUrl: newsDetail.linkUrl
        }
      })
    }

    const assetCode = ASSET_CODES[asset as keyof typeof ASSET_CODES] || ASSET_CODES.gold
    
    const url = `https://wts-info-api.tossinvest.com/api/v2/news/companies/${assetCode}?size=${size}&orderBy=${orderBy}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
      },
      next: { revalidate: 300 }  
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    const items = (data?.result?.body) || []
    
    const newsItems = items.map((item: any, index: number) => ({
      id: item.id || `news-${Date.now()}-${index}`,
      title: item.title || '제목 없음',
      summary: item.summary || '요약 없음',
      content: item.summary || '내용 없음', 
      imageUrls: item.imageUrls || [],
      image: (item.imageUrls && item.imageUrls.length > 0) ? item.imageUrls[0] : '/images/ic_market_gold.png',
      sourceName: item.source?.name || '출처 미상',
      createdAt: item.createdAt || new Date().toISOString(),
      time: item.createdAt ? formatTimeAgo(item.createdAt) : '방금 전'
    }))

    return NextResponse.json({
      success: true,
      data: newsItems,
      total: newsItems.length
    })

  } catch (error) {
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch news',
      data: [],
      total: 0
    })
  }
}

function formatTimeAgo(createdAt: string): string {
  const now = new Date()
  const created = new Date(createdAt)
  
  const nowUTC = new Date(now.getTime() + (now.getTimezoneOffset() * 60000))
  const createdUTC = new Date(created.getTime() + (created.getTimezoneOffset() * 60000))
  
  const diffMs = nowUTC.getTime() - createdUTC.getTime()
  
  if (diffMs < 0) {
    return '방금 전'
  }
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  const currentYear = now.getFullYear()
  const newsYear = created.getFullYear()
  const isCurrentYear = currentYear === newsYear
  
  if (diffMinutes < 1) {
    return '방금 전'
  } else if (diffMinutes < 60) {
    return `${diffMinutes}분 전`
  } else if (diffHours < 24) {
    return `${diffHours}시간 전`
  } else if (diffDays < 7) {
    return `${diffDays}일 전`
  } else {
    if (isCurrentYear) {
      return created.toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric'
      })
    } else {
      return created.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  }
}


