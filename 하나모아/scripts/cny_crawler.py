import requests
from datetime import datetime

URL_SUMMARY = "https://m.stock.naver.com/front-api/marketIndex/prices?category=exchange&reutersCode=FX_CNYKRW_SHB&page=1"
URL_TICKS   = "https://m.stock.naver.com/front-api/chart/pricesByPeriod?reutersCode=FX_CNYKRW_SHB&category=exchange&chartInfoType=marketindex&scriptChartType=day"

HEADERS = {
    "User-Agent": "Mozilla/5.0",
    "Referer": "https://m.stock.naver.com/",
}

def _to_float(s):
    if isinstance(s, (int, float)):
        return float(s)
    return float(str(s).replace(",", ""))

def fetch_change_three():
    """
    반환: (is_up, change_value, change_ratio)
      - is_up: 상승=1, 하락=0 (그 외는 0)
      - change_value: 등락값(float, 부호 포함)
      - change_ratio: 등락률(float, % 아님)
    """
    r = requests.get(URL_SUMMARY, headers=HEADERS, timeout=10)
    r.raise_for_status()
    data = r.json()

    item = data["result"][0] 
    name = item["fluctuationsType"]["name"]  
    is_up = 1 if name == "RISING" else 0

    change_value = _to_float(item["fluctuations"])
    change_ratio = _to_float(item["fluctuationsRatio"])
    return is_up, change_value, change_ratio

def fetch_today_last_tick_fields():
    r = requests.get(URL_TICKS, headers=HEADERS, timeout=10)
    r.raise_for_status()
    res = r.json()["result"]

    trade_base = res.get("tradeBaseAt")         
    last_trade_base = res.get("lastTradeBaseAt") 

    def _pick_last(infos, yyyymmdd):
        same_day = [x for x in infos if str(x["localDateTime"]).startswith(yyyymmdd)]
        return same_day[-1] if same_day else None

    last = _pick_last(res.get("priceInfos", []), trade_base)
    if last is None:
        last = _pick_last(res.get("lastPriceInfos", []), last_trade_base)
    if last is None:
        raise ValueError("실패")

    return {
        "localDateTime": str(last["localDateTime"]),
        "currentPrice": _to_float(last["currentPrice"]),
        "degreeCount": int(last["degreeCount"]),
    }

def format_datetime(datetime_str):
    if len(datetime_str) != 14:
        return datetime_str
    
    year = datetime_str[:4]
    month = datetime_str[4:6]
    day = datetime_str[6:8]
    hour = datetime_str[8:10]
    minute = datetime_str[10:12]
    second = datetime_str[12:14]
    
    return f"{year}.{month}.{day} {hour}:{minute}:{second}"

def fetch_daily_page(page: int = 1):
    """
    특정 페이지의 일자별 데이터를 가져오기
    반환: List[dict]
      - 각 dict: {"date": str, "close": float, "diff": float, "ratio": float}
    """
    url = URL_SUMMARY.replace("page=1", f"page={page}")
    r = requests.get(url, headers=HEADERS, timeout=10)
    r.raise_for_status()
    data = r.json()
    result = data.get("result", []) or []
    
    rows = []
    for it in result:
        rows.append({
            "date": str(it.get("localTradedAt", "")),                 # 날짜
            "close": _to_float(it.get("closePrice", 0)),               # 매매기준율
            "diff": _to_float(it.get("fluctuations", 0)),              # 전일대비
            "ratio": _to_float(it.get("fluctuationsRatio", 0)),        # 등락률(단위: %)
        })
    
    return rows

def fetch_daily_chunks(chunk_size: int = 10, pages: int = 1):
    all_items = []

    for p in range(1, pages + 1):
        page_data = fetch_daily_page(p)
        all_items.extend(page_data)

    chunks = [all_items[i:i + chunk_size] for i in range(0, len(all_items), chunk_size)]
    return chunks

def fetch_all_flat(include_daily: bool = True, chunk_size: int = 10, pages: int = 1):
    is_up, change_value, change_ratio = fetch_change_three()
    tick = fetch_today_last_tick_fields()

    result = {
        "is_up": is_up,
        "change_value": change_value,
        "change_ratio": change_ratio,
        "localDateTime": tick["localDateTime"],
        "currentPrice": tick["currentPrice"],
        "degreeCount": tick["degreeCount"],
    }

    if include_daily:
        result["daily_chunks"] = fetch_daily_chunks(chunk_size=chunk_size, pages=pages)

    return result


if __name__ == "__main__":
    import sys
    import json
    
    try:
        # 커맨드라인 인자 확인
        include_daily_arg = '--include-daily' in sys.argv
        page_arg = None
        
        if '--page' in sys.argv:
            try:
                page_index = sys.argv.index('--page')
                if page_index + 1 < len(sys.argv):
                    page_arg = int(sys.argv[page_index + 1])
            except (ValueError, IndexError):
                page_arg = None
        
        if page_arg:
            # 특정 페이지 데이터만 반환
            page_data = fetch_daily_page(page_arg)
            print(json.dumps(page_data, ensure_ascii=False))
        elif include_daily_arg:
            # JSON 출력
            result = fetch_all_flat(include_daily=True, chunk_size=10, pages=1)
            output = {
                "round": result['degreeCount'],
                "time": format_datetime(result['localDateTime']),
                "currentPrice": result['currentPrice'],
                "changeValue": result['change_value'],
                "changeRatio": result['change_ratio'],
                "isUp": result['is_up'],
                "dailyChunks": result.get('daily_chunks', [])
            }
            print(json.dumps(output, ensure_ascii=False))
        else:
            # 기본 텍스트 출력
            result = fetch_all_flat(include_daily=True, chunk_size=10, pages=1)
            
            # API에서 파싱할 수 있도록 출력
            print(f"고시회차: {result['degreeCount']}")
            print(f"시각: {format_datetime(result['localDateTime'])}")
            print(f"시세: {result['currentPrice']}")
            print(f"등락값: {result['change_value']}")
            print(f"등락률: {result['change_ratio']}")
            print(f"상승여부: {result['is_up']}")

            if 'daily_chunks' in result and result['daily_chunks']:
                print("\n[최근 10영업일 요약]")
                for r in result['daily_chunks'][0]:
                    print(r)

    except Exception as e:
        print(f"EUR 환율 크롤링 실패: {e}")
