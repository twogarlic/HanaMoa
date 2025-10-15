"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import NavigationBar from "@/components/NavigationBar";
import { useAuth } from "@/hooks/use-auth";

export default function PrivacyPage() {
  const { user: userInfo, isAuthenticated, isCheckingAuth } = useAuth({ redirectOnFail: false });
  
  const HEADER_HEIGHT = 64;

  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [giftRequests, setGiftRequests] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [friendRequestsCount, setFriendRequestsCount] = useState(0);
  const [giftRequestsCount, setGiftRequestsCount] = useState(0);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
  }, []);

  const fetchAllNotifications = async () => {
    try {
      if (!userInfo) return;

      setIsLoadingRequests(true);

      const [friendReqRes, giftReqRes, notifRes] = await Promise.all([
        fetch(`/api/friends/request?userId=${userInfo.id}&type=received`),
        fetch(`/api/gifts?userId=${userInfo.id}&type=received`),
        fetch(`/api/notifications?userId=${userInfo.id}`)
      ]);

      const friendReqData = await friendReqRes.json();
      const giftReqData = await giftReqRes.json();
      const notifData = await notifRes.json();

      if (friendReqData.success) {
        setFriendRequests(friendReqData.data || []);
        setFriendRequestsCount(friendReqData.data?.length || 0);
      }
      if (giftReqData.success) {
        setGiftRequests(giftReqData.data || []);
        setGiftRequestsCount(giftReqData.data?.length || 0);
      }
      if (notifData.success) {
        setNotifications(notifData.data || []);
        setUnreadNotificationCount(notifData.data?.filter((n: any) => !n.isRead).length || 0);
      }
    } catch (error) {
      console.error('알림 로드 오류:', error);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const handleFriendRequest = async (requestId: string, action: 'accept' | 'decline'): Promise<void> => {
    if (!userInfo) throw new Error('사용자 정보를 찾을 수 없습니다.');
    
    const response = await fetch(`/api/friends/request/${requestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, userId: userInfo.id })
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || '친구 신청 처리에 실패했습니다.');
    }

    setFriendRequests(prev => prev.filter(req => req.id !== requestId));
    fetchAllNotifications();
  };

  const handleGiftRequest = async (giftId: string, action: 'accept' | 'decline' | 'detail'): Promise<void> => {
    if (action === 'detail') return;

    if (!userInfo) throw new Error('사용자 정보를 찾을 수 없습니다.');
    
    const response = await fetch(`/api/gifts/${giftId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, userId: userInfo.id })
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || '선물 처리에 실패했습니다.');
    }

    setGiftRequests(prev => prev.filter(gift => gift.id !== giftId));
    fetchAllNotifications();
  };

  const handleNotificationRead = async (notificationId: string) => {
    if (!userInfo) return;
    
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationId: notificationId,
          userId: userInfo.id
        })
      });

      const result = await response.json();

      if (result.success) {
        await fetchAllNotifications();
      }
    } catch (error) {
      console.error('알림 읽음 처리 오류:', error);
    }
  };

  const handlePostNotificationClick = async (postId: string, authorId: string, asset: string) => {
    console.log('게시물 알림 클릭:', { postId, authorId, asset });
  };

  useEffect(() => {
    if (userInfo) {
      fetchAllNotifications();
    }
  }, [userInfo]);


  const moveScroll = useCallback((selector: string) => {
    const el = document.querySelector(selector) as HTMLElement | null;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - (HEADER_HEIGHT + 8);
    window.scrollTo({ top, behavior: "smooth" });
  }, []);

  return (
    <>
      <NavigationBar
        isAuthenticated={isAuthenticated}
        friendRequestsCount={friendRequestsCount}
        giftRequestsCount={giftRequestsCount}
        friendRequests={friendRequests}
        giftRequests={giftRequests}
        notifications={notifications}
        unreadNotificationCount={unreadNotificationCount}
        isLoadingRequests={isLoadingRequests}
        onFriendRequest={handleFriendRequest}
        onGiftRequest={handleGiftRequest}
        onNotificationClick={fetchAllNotifications}
        onNotificationRead={handleNotificationRead}
        onPostNotificationClick={handlePostNotificationClick}
      />
      <main className="page">
        <div className="container">
          <h1 className="page-title">고객정보취급방침</h1>
          
          <div className="lead">
            <p>
              하나금융그룹을 아끼고 사랑해 주시는 고객여러분께 깊은 감사를 드립니다.
            </p>
            <p>
              하나금융그룹은 금융지주회사법령에 의해 그룹사간에는 고객정보의 제공 및 이용이 가능하게 되어 있습니다.
              이에 다음과 같이 안내하여 드리오니 참고하시기 바랍니다.
            </p>
          </div>

          <div className="legal-box">
            <h3>금융지주회사법 제48조의2(고객정보의 제공 및 관리)</h3>
            <ol className="hangul">
              <li>
                금융지주회사등은 「금융실명거래 및 비밀보장에 관한 법률」 제4조제1항 및 「신용정보의 이용 및 보호에 관한 법률」 제32조 · 제33조에도 불구하고 「금융실명거래 및 비밀보장에 관한 법률」 제4조에 따른 금융거래의 내용에 관한 정보 또는 자료(이하 "금융거래정보"라 한다) 및 「신용정보의 이용 및 보호에 관한 법률」 제32조제1항에 따른 개인신용정보를 다음 각 호의 사항에 관하여 금융위원회가 정하는 방법과 절차(이하 "고객정보제공절차"라 한다)에 따라 그가 속하는 금융지주회사등에게 신용위험관리 등 대통령령으로 정하는 내부 경영관리상 이용하게 할 목적으로 제공할 수 있다.
                <ol className="hangul m-l">
                  <li>제공할 수 있는 정보의 범위</li>
                  <li>고객정보의 암호화 등 처리방법</li>
                  <li>고객정보의 분리 보관</li>
                  <li>고객정보의 이용기간 및 이용목적</li>
                  <li>이용기간 경과 시 고객정보의 삭제</li>
                  <li>그 밖에 고객정보의 엄격한 관리를 위하여 대통령령으로 정하는 사항</li>
                </ol>
              </li>
              <li>
                금융지주회사의 자회사등인 「자본시장과 금융투자업에 관한 법률」에 따른 투자매매업자 또는 투자중개업자는 해당 투자매매업자 또는 투자중개업자를 통하여 증권을 매매하거나 매매하고자 하는 위탁자가 예탁한 금전 또는 증권에 관한 정보 중 다음 각 호의 어느 하나에 해당하는 정보(이하 "증권총액정보등"이라 한다)를 고객정보제공절차에 따라 그가 속하는 금융지주회사등에게 신용위험관리 등 대통령령으로 정하는 내부 경영관리상 이용하게 할 목적으로 제공할 수 있다.
                <ol className="hangul m-l">
                  <li>예탁한 금전의 총액</li>
                  <li>예탁한 증권의 총액</li>
                  <li>예탁한 증권의 종류별 총액</li>
                  <li>그 밖에 제1호부터 제3호까지에 준하는 것으로서 금융위원회가 정하여 고시하는 정보</li>
                </ol>
              </li>
            </ol>
          </div>

          <div className="lead">
            <p>
              이에 따라 하나금융그룹은 하나금융지주를 중심으로 고객정보를 그룹사간에 제공 및 이용하기 위하여 「고객정보 취급방침」을 제정 · 운영하고 있습니다.
            </p>
            <p>
              이러한 고객정보의 제공 및 이용은 고객 여러분의 금융거래에 따른 불편함을 해소하고 더욱 더 만족스러운 금융서비스를 제공하기 위해 시행하는 것이며 만에 하나 발생할지도 모르는 부작용을 방지하기 위하여 다음과 같이 제공되는 정보의 종류 및 제공처를 한정하고, 정보의 엄격한 관리를 위한 제도를 마련하였습니다.
            </p>
          </div>

          <section className="sec">
            <h3>I. 제공되는 고객정보의 종류</h3>
            <ul className="dot">
              <li>『금융실명거래 및 비밀보장에 관한 법률』 제4조에 따른 금융거래의 내용에 관한 정보 또는 자료</li>
              <li>『신용정보의 이용 및 보호에 관한 법률』 제2조 제2호에 따른 개인신용정보</li>
            </ul>
            <p className="mt">
              ※ 고객정보 중 『자본시장과 금융투자업에 관한 법률』에 따른 투자매매업자 또는 투자중개업자를 통하여 매매하고자 하는 위탁자가 예탁한 금전 또는 증권에 관한 정보는 다음 각 목의 형태로 제한됨
            </p>
            <ol className="hangul m-l">
              <li>예탁한 금전의 총액</li>
              <li>예탁한 증권의 총액</li>
              <li>예탁한 증권의 종류별 총액</li>
              <li>채무증권의 종류별 총액</li>
              <li>수익증권으로서 『자본시장과 금융투자업에 관한 법률』 제229조 각 호의 구분에 따른 집합투자기구의 종류별 총액</li>
              <li>예탁한 증권의 총액을 기준으로 한 위탁자의 평균 증권보유기간 및 일정기간 동안의 평균 거래회수</li>
            </ol>
          </section>

          <section className="sec">
            <h3>II. 고객정보의 제공처</h3>
            <p>
              하나금융그룹 중 금융지주회사법령에 의한 고객정보의 제공 및 이용이 가능한 회사는 하나금융지주(금융지주회사), 하나은행(은행업), 하나증권(금융투자업), 하나카드(신용카드업), 하나캐피탈(할부금융 및 시설대여업), 하나생명보험(생명보험업), 하나손해보험(손해보험업), 하나저축은행(상호저축은행업), 하나자산신탁(신탁업), 하나에프앤아이(NPL투자관리업), 하나금융티아이(시스템 소프트웨어 개발 및 공급업), 핀크(소액해외송금업), 하나대체투자자산운용(자산운용업), 하나펀드서비스(사무관리업), 하나벤처스(신기술사업금융업), 지엘엔인터내셔널(전자지급결제대행업), 하나자산운용(자산운용업), 하나금융파인드(보험대리점업) 입니다.
            </p>
          </section>

          <section className="sec">
            <h3>III. 고객정보의 보호에 관한 내부방침</h3>
            <p>
              하나금융그룹에서는 고객 여러분의 고객정보를 최대한 안전하게 관리하기 위해 그룹사간 정보 제공 및 이용이 아래와 같이 엄격한 절차와 관리 · 감독하에 이루어지도록 하였습니다.
            </p>
            <ol className="hangul">
              <li>고객정보의 제공 및 이용은 내부 경영관리 목적으로만 이용되도록 하였습니다.</li>
              <li>그룹사의 임원 1인 이상을 고객정보관리인으로 선임하여 고객정보의 제공 및 이용에 관련된 일체의 책임을 지도록 하였습니다.</li>
              <li>그룹사별로 소관부서 및 담당자를 지정하여 체계적이고 집중적인 관리를 도모하였습니다.</li>
              <li>고객정보의 요청 및 제공시 서면 또는 전자결재시스템을 통하여 금융지주회사법령에 따라 고객정보관리인등의 결재를 받은 후 요청 및 제공하도록 하는 등 업무 프로세스의 정형화를 통해 엄격한 관리 및 통제가 이루어지도록 하였습니다.</li>
              <li>그룹사간 고객정보의 요청 및 제공, 이용 등과 관련한 업무에 대하여 금융지주회사 고객정보관리인에게 총괄관리 역할을 부여함으로써 고객정보의 보호에 만전을 기하였습니다.</li>
              <li>고객정보의 제공 및 이용 관련 취급방침의 제 · 개정 시 2개 이상의 일간지에 공고하고, 각 영업점(본점 해당부서 포함), 그리고 각 그룹사 홈페이지 등에 게시하는 등 고객 공지 의무에 최선을 다 할 것입니다.</li>
              <li>그룹사간 고객정보 제공 내역을 각 그룹사 홈페이지에 게시하여 정보이용에 대한 고객의 조회가 용이하도록 하였습니다.</li>
              <li>위법 · 부당한 고객정보의 제공으로 인해 피해를 입게 된 고객분을 위해 적정한 보상 및 처리가 이루어지도록 민원 사항에 대한 안내 및 상담, 처리, 그리고 결과 및 통지 등 민원처리 관련 일체의 업무를 수행할 소관부서를 그룹사마다 두었습니다. 그리고 소관부서 외 금융감독원 분쟁 조정제도를 통하여 구제받으실 수 있도록 하였습니다.</li>
              <li>고객정보제공 및 관리에 대한 권한이 부여된 자만 고객정보에 접근하고, 고객정보의 송 · 수신, 보관 등에 있어 암호화하여 관리하며, 천재지변 및 외부로부터의 공격 · 침입 등 불가항력에 대비한 보안시스템을 구축하였고, 고객정보와 관련된 임직원에 대하여는 정기적으로 보안교육을 실시하는 등 철저한 보안 대책을 마련하고 있습니다.</li>
            </ol>
            <p className="mt">
              하나금융그룹은 그룹사간 고객정보의 제공 및 이용을 허용한 것이 금융서비스의 질을 높이고, 나아가 우리나라 금융산업을 선진화시키기 위한 조치임을 명심하고 고객정보의 교류를 토대로 고객 여러분들께 보다 편리하고 질 높은 선진금융서비스를 제공할 것을 약속드리며, 고객 여러분의 고객정보의 보호 및 엄격한 관리를 위해 최선을 다할 것입니다.
            </p>
          </section>

          <section className="sec">
            <h3>고객정보관리인</h3>
            <ul className="dot">
              <li>하나금융지주고객정보관리인</li>
              <li>하나은행고객정보관리인</li>
              <li>하나증권고객정보관리인</li>
              <li>하나카드고객정보관리인</li>
              <li>하나캐피탈고객정보관리인</li>
              <li>하나생명보험고객정보관리인</li>
              <li>하나손해보험고객정보관리인</li>
              <li>하나저축은행고객정보관리인</li>
              <li>하나자산신탁고객정보관리인</li>
              <li>하나에프앤아이고객정보관리인</li>
              <li>하나금융티아이고객정보관리인</li>
              <li>핀크고객정보관리인</li>
              <li>하나대체투자자산운용고객정보관리인</li>
              <li>하나펀드서비스고객정보관리인</li>
              <li>하나벤처스고객정보관리인</li>
              <li>지엘엔인터내셔널고객정보관리인</li>
              <li>하나자산운용고객정보관리인</li>
              <li>하나금융파인드고객정보관리인</li>
            </ul>
          </section>
        </div>
      </main>

      <style jsx>{`
        :root {
          --ink: #111111;
          --muted: #6b7280;
          --border: #e5e7eb;
          --brand: #111111; /* 탭 활성: 검정 */
          --bg-soft: #f8f9fb;
          --link: #1f2937;
        }

        .page {
          padding-bottom: 80px;
          color: #111;
          background: #fff;
        }

        .container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .page-title {
          font-size: clamp(28px, 5.5vw, 48px);
          line-height: 1.2;
          font-weight: 700;
          letter-spacing: -0.01em;
          margin: 130px 0 8px;
          font-family: "Hana2-Medium", sans-serif;
        }

        /* 법적 내용 박스 */
        .legal-box {
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 24px;
          margin: 24px 0;
          background: #FFFFFF;
        }
        .legal-box h3 {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 16px;
          color: #111;
          font-family: "Hana2-Bold", sans-serif;
        }

        /* 리드 문단 */
        .lead p {
          color: var(--muted);
          font-size: 1.0625rem;
          margin: 10px 0;
          font-family: "Hana2-Regular", sans-serif;
        }
        .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }


        /* 섹션 */
        .sec { margin-top: 36px; }
        .sec h3 {
          font-size: 22px;
          font-weight: 800;
          margin: 0 0 10px;
          font-family: "Hana2-Bold", sans-serif;
        }
        .sec p { 
          margin: 8px 0; 
          font-family: "Hana2-Regular", sans-serif;
        }

        /* 리스트 */
        .dot { list-style: disc; padding-left: 20px; }
        .dot > li { 
          margin: 4px 0; 
          font-family: "Hana2-Regular", sans-serif;
        }

        .hangul { list-style: none; padding-left: 0; counter-reset: hnum; }
        .hangul > li { 
          position: relative; 
          padding-left: 1.6em; 
          margin: 8px 0; 
          font-family: "Hana2-Regular", sans-serif;
        }
        .hangul > li::before {
          counter-increment: hnum;
          content: counter(hnum) ".";
          position: absolute;
          left: 0; top: 0;
          font-weight: 800;
        }
        .m-l { margin-left: 12px; }
        .mt { margin-top: 10px; }
        .muted { color: var(--muted); }

        /* 표 */
        .table { overflow-x: auto; margin-top: 10px; }
        table {
          width: 100%;
          border-collapse: collapse;
          background: #fff;
          border: 1px solid var(--border);
          min-width: 480px;
        }
        thead th {
          background: var(--bg-soft);
          padding: 10px;
          font-weight: 800;
          border-bottom: 1px solid var(--border);
          text-align: center;
          font-family: "Hana2-Bold", sans-serif;
        }
        tbody td, tbody th {
          padding: 10px;
          border-top: 1px solid var(--border);
          border-right: 1px solid var(--border);
          font-family: "Hana2-Regular", sans-serif;
          text-align: center;
        }
        .row .th { background: var(--bg-soft); width: 30%; }
        .center { text-align: center; }
        .small { 
          font-size: 12px; 
          color: var(--muted); 
          margin-top: 6px; 
          font-family: "Hana2-Regular", sans-serif;
        }
        .etc { 
          padding-left: 16px; 
          font-family: "Hana2-Regular", sans-serif;
        }

        /* 링크 모음 */
        .links { list-style: none; padding-left: 0; }
        .links li { 
          margin: 8px 0; 
          font-family: "Hana2-Regular", sans-serif;
        }
        .btnTxt { 
          font-weight: 700; 
          text-decoration: underline; 
          text-underline-offset: 2px; 
          font-family: "Hana2-Bold", sans-serif;
        }
      `}</style>
    </>
  );
}
