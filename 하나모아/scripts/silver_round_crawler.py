#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json
import sys
from datetime import datetime, timedelta

def get_silver_chart_round_data():
    try:
        now = datetime.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        
        # API URL 생성
        from_time = today_start.strftime("%Y-%m-%dT%H:%M:%S")
        to_time = now.strftime("%Y-%m-%dT%H:%M:%S")
        
        url = f"https://prod-api.exgold.co.kr/api/v1/main/chart/live/price/domestic?type=AG&from={from_time}&to={to_time}"
        
        # API 요청
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        
        if not data.get('success') or not data.get('data'):
            raise ValueError("Silver 데이터가 비어있습니다.")
        
        price_data = sorted(data['data'], key=lambda x: x['dateTime'])
        
        price_infos = []
        degree_count = 1
        
        for i, item in enumerate(price_data):
            if i % 2 == 0:
                dt = datetime.fromisoformat(item['dateTime'].replace('Z', '+00:00'))
                local_datetime = dt.strftime("%Y%m%d%H%M%S")
                
                price_infos.append({
                    "localDateTime": local_datetime,
                    "currentPrice": float(item['domesticPrice']),
                    "degreeCount": str(degree_count)
                })
                degree_count += 1
        
        price_infos = price_infos[-50:]
        
        current_time = now.strftime("%Y%m%d%H%M%S")
        
        result = {
            "isSuccess": True,
            "detailCode": "",
            "message": "",
            "result": {
                "code": "CMDT_AG",
                "infoType": "marketindex",
                "periodType": "day",
                "openPrice": price_infos[0]['currentPrice'] if price_infos else 0,
                "lastClosePrice": price_infos[-1]['currentPrice'] if price_infos else 0,
                "tradeBaseAt": now.strftime("%Y%m%d"),
                "lastTradeBaseAt": now.strftime("%Y%m%d"),
                "localDateTimeNow": current_time,
                "priceInfos": price_infos
            }
        }
        
        return result
        
    except requests.exceptions.RequestException as e:
        print(f"API 요청 실패 (silver): {e}", file=sys.stderr)
        return None
    except Exception as e:
        print(f"데이터 처리 실패 (silver): {e}", file=sys.stderr)
        return None

def main():
    try:
        data = get_silver_chart_round_data()
        
        if data:
            print(json.dumps(data, ensure_ascii=False, indent=2))
        else:
            print("Silver 회차 차트 데이터를 가져올 수 없습니다.", file=sys.stderr)
            sys.exit(1)
            
    except Exception as e:
        print(f"오류 발생: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
