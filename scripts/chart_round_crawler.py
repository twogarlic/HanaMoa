#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json
import sys
from datetime import datetime

# 자산별 고시회차 API URL 매핑
ASSET_URLS = {
    'gold': {
        'summary': 'https://m.stock.naver.com/front-api/marketIndex/prices?category=metals&reutersCode=CMDT_GD&page=1',
        'ticks': 'https://m.stock.naver.com/front-api/chart/pricesByPeriod?reutersCode=CMDT_GD&category=metals&chartInfoType=marketindex&scriptChartType=day'
    },
    'usd': {
        'summary': 'https://m.stock.naver.com/front-api/marketIndex/prices?category=exchange&reutersCode=FX_USDKRW_SHB&page=1',
        'ticks': 'https://m.stock.naver.com/front-api/chart/pricesByPeriod?reutersCode=FX_USDKRW_SHB&category=exchange&chartInfoType=marketindex&scriptChartType=day'
    },
    'eur': {
        'summary': 'https://m.stock.naver.com/front-api/marketIndex/prices?category=exchange&reutersCode=FX_EURKRW_SHB&page=1',
        'ticks': 'https://m.stock.naver.com/front-api/chart/pricesByPeriod?reutersCode=FX_EURKRW_SHB&category=exchange&chartInfoType=marketindex&scriptChartType=day'
    },
    'jpy': {
        'summary': 'https://m.stock.naver.com/front-api/marketIndex/prices?category=exchange&reutersCode=FX_JPYKRW_SHB&page=1',
        'ticks': 'https://m.stock.naver.com/front-api/chart/pricesByPeriod?reutersCode=FX_JPYKRW_SHB&category=exchange&chartInfoType=marketindex&scriptChartType=day'
    },
    'cny': {
        'summary': 'https://m.stock.naver.com/front-api/marketIndex/prices?category=exchange&reutersCode=FX_CNYKRW_SHB&page=1',
        'ticks': 'https://m.stock.naver.com/front-api/chart/pricesByPeriod?reutersCode=FX_CNYKRW_SHB&category=exchange&chartInfoType=marketindex&scriptChartType=day'
    }
}

HEADERS = {
    "User-Agent": "Mozilla/5.0",
    "Referer": "https://m.stock.naver.com/",
}

def _to_float(s):
    """문자열을 float로 변환"""
    if isinstance(s, (int, float)):
        return float(s)
    return float(str(s).replace(",", ""))

def get_chart_round_data(asset):
    """회차 차트 데이터를 가져오는 함수"""
    try:
        if asset not in ASSET_URLS:
            raise ValueError(f"지원하지 않는 자산: {asset}")
        
        urls = ASSET_URLS[asset]
        
        # 틱 데이터 가져오기
        response = requests.get(urls['ticks'], headers=HEADERS, timeout=10)
        response.raise_for_status()
        ticks_data = response.json()["result"]
        
        # 요약 데이터 가져오기
        response = requests.get(urls['summary'], headers=HEADERS, timeout=10)
        response.raise_for_status()
        summary_data = response.json()["result"][0]
        
        # 현재 시간 생성
        now = datetime.now()
        current_time = now.strftime("%Y%m%d%H%M%S")
        
        # priceInfos 데이터 추출
        price_infos = []
        trade_base = ticks_data.get("tradeBaseAt", now.strftime("%Y%m%d"))
        last_trade_base = ticks_data.get("lastTradeBaseAt", now.strftime("%Y%m%d"))
        
        today_infos = [x for x in ticks_data.get("priceInfos", []) if str(x["localDateTime"]).startswith(trade_base)]
        if not today_infos:
            today_infos = [x for x in ticks_data.get("lastPriceInfos", []) if str(x["localDateTime"]).startswith(last_trade_base)]
        
        for info in today_infos[-50:]:
            price_infos.append({
                "localDateTime": str(info["localDateTime"]),
                "currentPrice": _to_float(info["currentPrice"]),
                "degreeCount": str(info["degreeCount"])
            })
        
        # 회차 차트 데이터 형식으로 변환
        result = {
            "isSuccess": True,
            "detailCode": "",
            "message": "",
            "result": {
                "code": f"CMDT_{asset.upper()}" if asset != 'gold' else "CMDT_GD",
                "infoType": "marketindex",
                "periodType": "day",
                "openPrice": _to_float(summary_data.get('openingPrice', 0)),
                "lastClosePrice": _to_float(summary_data.get('prevClosingPrice', 0)),
                "tradeBaseAt": trade_base,
                "lastTradeBaseAt": last_trade_base,
                "localDateTimeNow": current_time,
                "priceInfos": price_infos
            }
        }
        
        return result
        
    except requests.exceptions.RequestException as e:
        return None
    except Exception as e:
        return None

def main():
    if len(sys.argv) != 2:
        sys.exit(1)
    
    asset = sys.argv[1].lower()
    
    if asset not in ASSET_URLS:
        sys.exit(1)
    
    try:
        data = get_chart_round_data(asset)
        
        if data:
            print(json.dumps(data, ensure_ascii=False, indent=2))
        else:
            sys.exit(1)
            
    except Exception as e:
        sys.exit(1)

if __name__ == "__main__":
    main()
