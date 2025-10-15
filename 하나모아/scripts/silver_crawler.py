import requests
import time, random
from datetime import datetime, timedelta

URL_EXGOLD = "https://prod-api.exgold.co.kr/api/v1/main/detail/domestic/price"
URL_EXGOLD_PERIOD_FMT = "https://prod-api.exgold.co.kr/api/v1/main/chart/period/price/domestic?type=AG&from={from_date}&to={to_date}"

HEADERS = {
    "User-Agent": "Mozilla/5.0",
    "Accept": "application/json",
    "Referer": "https://www.exgold.co.kr/",
    "Origin": "https://www.exgold.co.kr",
}

def _to_float(v):
    if isinstance(v, (int, float)):
        return float(v)
    return float(str(v).replace(",", ""))

def _get_json_with_retries(url, headers, tries=4, connect_to=5, read_to=25, backoff=1.7):
    last_err = None
    for i in range(tries):
        try:
            r = requests.get(url, headers=headers, timeout=(connect_to, read_to))
            r.raise_for_status()
            return r.json()
        except (requests.ReadTimeout, requests.ConnectionError, requests.HTTPError) as e:
            last_err = e
            if i < tries - 1:
                # 1.7^i + [0~0.3)초 지터
                time.sleep((backoff ** i) + random.random() * 0.3)
            else:
                raise last_err

def fetch_ag_change():
    payload = _get_json_with_retries(URL_EXGOLD, HEADERS, tries=4, connect_to=5, read_to=25)
    items = payload["data"]["domesticLivePriceDtoList"]
    ag = next((x for x in items if str(x.get("type")) == "Ag"), None)
    if ag is None:
        raise ValueError("Ag 항목을 찾을 수 없습니다.")

    price = _to_float(ag["domesticPrice"])
    change_value = _to_float(ag["fluctuation"])
    prev = price - change_value
    change_ratio = (change_value / prev) if prev > 0 else 0.0
    is_up = 1 if change_value > 0 else 0

    return {
        "price": price,
        "change_value": change_value,
        "change_ratio": change_ratio*100,  
        "is_up": is_up,
    }

def fetch_ag_daily_rows(from_date: str, to_date: str):
    url = URL_EXGOLD_PERIOD_FMT.format(from_date=from_date, to_date=to_date)
    payload = _get_json_with_retries(url, HEADERS, tries=4, connect_to=5, read_to=25)

    items = payload.get("data", []) or []
    if not items:
        raise ValueError("ExGold 기간 데이터가 비었습니다.")

    items_sorted = sorted(items, key=lambda x: str(x.get("date", "")))
    rows_asc = []

    prev_close = None
    for it in items_sorted:
        date = str(it.get("date", ""))
        close = _to_float(it.get("domesticPrice", 0))

        if prev_close is None:
            diff = 0.0
            ratio = 0.0
        else:
            diff = close - prev_close
            ratio = (diff / prev_close * 100.0) if prev_close else 0.0

        rows_asc.append({
            "date": date,     # 날짜
            "close": close,   # 매매기준율
            "diff": diff,     # 전일대비
            "ratio": ratio,   # 등락률(%)
        })
        prev_close = close

    rows_desc = list(reversed(rows_asc))
    return rows_desc

def fetch_ag_daily_chunks(from_date: str, to_date: str, chunk_size: int = 10):
    rows = fetch_ag_daily_rows(from_date, to_date)
    return [rows[i:i+chunk_size] for i in range(0, len(rows), chunk_size)]

def fetch_ag_daily_page(page: int = 1):
    today = datetime.now()
    
    try:
        max_days = 100
        from_date = (today - timedelta(days=max_days)).strftime('%Y-%m-%d')
        to_date = today.strftime('%Y-%m-%d')
        
        all_rows = fetch_ag_daily_rows(from_date, to_date)
        
        start_idx = (page - 1) * 10
        end_idx = start_idx + 10
        
        page_rows = all_rows[start_idx:end_idx] if start_idx < len(all_rows) else []
        return page_rows
        
    except Exception as e:
        print(f"페이지 {page} 데이터 가져오기 실패: {e}")
        return []

if __name__ == "__main__":
    import sys
    import json
    
    try:
        # 커맨드라인 인자 확인
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
            page_data = fetch_ag_daily_page(page_arg)
            print(json.dumps(page_data, ensure_ascii=False))
        else:
            # 실시간 시세 출력
            r = fetch_ag_change()
            print(f"시세: {r['price']}")
            print(f"등락값: {r['change_value']}")
            print(f"등락률: {r['change_ratio']}")  
            print(f"상승여부: {r['is_up']}")       
            
            print("\n[페이지 1 데이터 (최근 10일)]")
            page1_data = fetch_ag_daily_page(1)
            for r in page1_data:
                print(r)
                
    except requests.ReadTimeout:
        print("Ag 시세 크롤링 실패: 서버 응답 지연(Read timeout). 타임아웃을 더 늘리거나 재시도하세요.")
    except Exception as e:
        print(f"Ag 시세 크롤링 실패: {e}")