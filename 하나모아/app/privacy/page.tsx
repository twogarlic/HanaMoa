"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import NavigationBar from "@/components/NavigationBar";
import { useAuth } from "@/hooks/use-auth";
import styles from "@/components/privacy/PrivacyPage.module.css";

export default function PrivacyPage() {
  const { user: userInfo, isAuthenticated, isCheckingAuth } = useAuth({ redirectOnFail: false });
  
  const HEADER_HEIGHT = 64;

  const [activeTab, setActiveTab] = useState<number>(1);

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
    }
  };

  const handlePostNotificationClick = async (postId: string, authorId: string, asset: string) => {
  };

  useEffect(() => {
    if (userInfo) {
      fetchAllNotifications();
    }
  }, [userInfo]);

  const moveTab = useCallback((idx: number) => {
    setActiveTab(idx);
    const pos = document.querySelector<HTMLDivElement>(".tab-anchor");
    if (pos) {
      const top = pos.getBoundingClientRect().top + window.scrollY - (HEADER_HEIGHT + 8);
      window.scrollTo({ top, behavior: "smooth" });
    }
  }, []);

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
      <main className={styles.page}>
        <div className={styles.container}>
          <h1 className={styles.pageTitle}>개인정보처리방침</h1>
        </div>

      <div className="tab-anchor" />
      <nav className={styles.tabs}>
        <ul>
          <li>
            <a
              href="#"
              className={`${styles.pill} ${activeTab === 1 ? styles.active : ""}`}
              onClick={(e) => {
                e.preventDefault();
                moveTab(1);
              }}
            >
              개인정보처리방침
            </a>
          </li>
          <li>
            <a
              href="#"
              className={`${styles.pill} ${activeTab === 2 ? styles.active : ""}`}
              onClick={(e) => {
                e.preventDefault();
                moveTab(2);
              }}
            >
              영상정보처리기기운영방침
            </a>
          </li>
        </ul>
      </nav>

      <section
        className={styles.container}
        style={{ display: activeTab === 1 ? "block" : "none" }}
      >
        <div className={styles.lead}>
          <p>
            하나모아(이하 ‘회사’라 함)는 이용자의 개인정보보호를 매우 중요시하며,
            개인정보보호법, 정보통신망 이용촉진 및 정보보호 등에 관한 법률 등 회사가 준수하여야 할 관련
            법규상의 개인정보보호 규정을 준수하고 있습니다.
          </p>
          <p>
            회사는 개인정보처리방침을 통하여 이용자께서 제공하시는 개인정보가 어떠한 용도와 방식으로 이용되고
            있으며, 개인정보보호를 위해 어떠한 조치가 취해지고 있는지 알려드립니다.
          </p>
          <p>
            회사는 개인정보처리방침을 홈페이지(<span className={styles.mono}>www.hanamoa.co.kr</span>) 화면 아래쪽에 공개함으로써 이용자가 언제나 용이하게
            열람할 수 있도록 조치합니다.
          </p>
          <p>
            회사의 개인정보처리방침은 법률 및 정부지침 변경이나 내부 방침 변경 등으로 수시로 변경될 수 있습니다.
            이용자는 회사 홈페이지 방문 시 개인정보처리방침을 수시로 확인하여 주시기 바랍니다.
          </p>
          <p>본 개인정보처리방침은 다음과 같은 내용을 담고 있습니다.</p>
        </div>

        <div className={styles.toc}>
          <ol>
            <li>
              <a href="#" onClick={(e) => { e.preventDefault(); moveScroll("#h2Title01"); }}>
                개인정보의 수집항목 및 수집방법
              </a>
            </li>
            <li>
              <a href="#" onClick={(e) => { e.preventDefault(); moveScroll("#h2Title02"); }}>
                개인정보의 수집 및 이용 목적
              </a>
            </li>
            <li>
              <a href="#" onClick={(e) => { e.preventDefault(); moveScroll("#h2Title03"); }}>
                개인정보 수집에 대한 동의
              </a>
            </li>
            <li>
              <a href="#" onClick={(e) => { e.preventDefault(); moveScroll("#h2Title04"); }}>
                개인정보 자동수집장치의 설치 및 운영
              </a>
            </li>
            <li>
              <a href="#" onClick={(e) => { e.preventDefault(); moveScroll("#h2Title05"); }}>
                개인정보의 목적 외 사용 및 제3자 제공
              </a>
            </li>
            <li>
              <a href="#" onClick={(e) => { e.preventDefault(); moveScroll("#h2Title06"); }}>
                개인정보처리의 위탁에 관한 사항
              </a>
            </li>
            <li>
              <a href="#" onClick={(e) => { e.preventDefault(); moveScroll("#h2Title07"); }}>
                이용자의 권리 · 의무 및 그 행사방법
              </a>
            </li>
            <li>
              <a href="#" onClick={(e) => { e.preventDefault(); moveScroll("#h2Title08"); }}>
                이용자 및 대리인의 권리와 그 행사방법
              </a>
            </li>
            <li>
              <a href="#" onClick={(e) => { e.preventDefault(); moveScroll("#h2Title09"); }}>
                개인정보의 이용기간 및 보유기간
              </a>
            </li>
            <li>
              <a href="#" onClick={(e) => { e.preventDefault(); moveScroll("#h2Title10"); }}>
                개인정보 파기 절차 및 방법
              </a>
            </li>
            <li>
              <a href="#" onClick={(e) => { e.preventDefault(); moveScroll("#h2Title11"); }}>
                개인정보의 안전성 확보조치에 관한 사항
              </a>
            </li>
            <li>
              <a href="#" onClick={(e) => { e.preventDefault(); moveScroll("#h2Title12"); }}>
                개인정보처리방침의 변경에 관한 사항
              </a>
            </li>
            <li>
              <a href="#" onClick={(e) => { e.preventDefault(); moveScroll("#h2Title13"); }}>
                개인정보보호 담당부서 및 연락처
              </a>
            </li>
            <li>
              <a href="#" onClick={(e) => { e.preventDefault(); moveScroll("#h2Title14"); }}>
                고지의 의무
              </a>
            </li>
          </ol>
        </div>

        <section id="h2Title01" className={styles.sec}>
          <h3>1. 개인정보의 수집항목 및 수집방법</h3>
          <ol className={styles.hangul}>
            <li>
              개인정보 수집항목
              <p>
                회사는 입사지원, 입사와 관련된 문의 응답, 취업보호 대상자의 확인을 위해 아래와 같은 개인정보들을 수집하고 있습니다. <br />
                단, 이용자의 기본적 인권 침해의 우려가 있는 민감한 개인정보는 수집하지 않습니다.
              </p>
              <ul className={styles.dot}>
                <li>
                  필수정보 : 성명(국문, 한자, 영문), 사진, 생년월일, 성별, 주소, 전화번호, 휴대전화번호, e-mail, 병역사항(미필인 경우 미필 사유), 자기소개
                </li>
                <li>
                  선택정보 : 외국어사항, 외국거주경험, 자격사항, 수상경력, IT활용능력, 학내외 활동사항, 보훈여부, 보훈번호, 장애여부, 장애등급, 장애내용, 학력사항, 경력사항, 프로젝트사항
                </li>
              </ul>
            </li>
            <li>
              개인정보 수집방법
              <ul className={styles.dot}>
                <li>홈페이지, 서면양식, 팩스, 전화, 상담 게시판, 이메일, 응모내역, 배송요청</li>
                <li>생성정보 수집 툴을 통한 수집</li>
              </ul>
            </li>
          </ol>
        </section>

        <section id="h2Title02" className={styles.sec}>
          <h3>2. 개인정보의 수집 및 이용 목적</h3>
          <p>회사는 직원채용(입사전형 진행, 입사 지원서 수정, 합격 여부 확인 등) 및 인사관리 등의 목적으로 개인정보를 처리합니다.</p>
        </section>

        <section id="h2Title03" className={styles.sec}>
          <h3>3. 개인정보 수집에 대한 동의</h3>
          <p>
            이용자가 회사 홈페이지 상에서 입사지원 시, 회사는 이용자의 개인정보 수집·이용·제공에 대한 동의여부를 묻고 이용자가 「동의」버튼을 클릭하면
            개인정보 수집·이용·제공에 대해 동의한 것으로 간주합니다.
          </p>
        </section>

        <section id="h2Title04" className={styles.sec}>
          <h3>4. 개인정보자동수집장치의 설치 및 운영</h3>
          <p>서비스 이용과정이나 사업처리 과정에서 아래와 같은 정보들이 자동으로 생성되어 수집될 수 있습니다.</p>
          <ul className={styles.dot}>
            <li>이용자의 브라우저 종류 및 OS, 방문 기록(IP Address, 접속시간), 쿠키</li>
          </ul>
        </section>

        <section id="h2Title05" className={styles.sec}>
          <h3>5. 개인정보의 목적 외 사용 및 제3자 제공</h3>
          <p>회사는 이용자의 개인정보를 수집목적 및 이용 목적을 초과하여 이용하거나 타인 또는 타 기관에 제공하지 않습니다.</p>
          <p>단, 아래의 경우에는 예외로 합니다.</p>
          <ol className={`${styles.hangul} ${styles.mL}`}>
            <li>정보주체의 동의를 받은 경우</li>
            <li>법률에 특별한 규정이 있거나 법령상 의무를 준수하기 위하여 불가피한 경우</li>
            <li>명백히 정보주체 또는 제3자의 급박한 생명, 신체, 재산의 이익을 위하여 필요하다고 인정되는 경우</li>
            <li>개인정보처리자의 정당한 이익을 달성하기 위하여 필요한 경우로서 명백하게 정보주체의 권리보다 우선하는 경우</li>
            <li>공중위생 등 공공의 안전과 안녕을 위하여 긴급히 필요한 경우</li>
          </ol>
          <p className={styles.mt}>
            간혹 입사지원자에게 회사와 특수관계에 있는 회사(관계사 등)에 입사제안을 드릴 수 있으며, 이 경우 반드시 사전에 입사지원자에게 개별 연락하여
            동의 절차를 거친 후 입사 지원서를 해당 회사로 이관합니다.
          </p>
        </section>

        <section id="h2Title06" className={styles.sec}>
          <h3>6. 개인정보처리의 위탁에 관한 사항</h3>
          <ol className={styles.hangul}>
            <li>
              회사는 원활한 개인정보업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.
              <div className={styles.table}>
                <table>
                  <colgroup>
                    <col style={{ width: "50%" }} />
                    <col style={{ width: "50%" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th scope="col">구분</th>
                      <th scope="col">위탁업무 내용</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>마이다스인</td>
                      <td>채용 시스템 위탁</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </li>
            <li>
              위탁계약 시 개인정보보호 관련 법규의 준수, 개인정보에 관한 제3자 제공 금지 및 책임부담 등을 명확히 규정하고 감독하고 있으며
              당해 계약내용을 서면 또는 전자 보관하고 있습니다. 업체 변경 시 공지사항 및 개인정보처리방침을 통해 고지하겠습니다.
            </li>
          </ol>
        </section>

        <section id="h2Title07" className={styles.sec}>
          <h3>7. 이용자의 권리·의무 및 그 행사방법에 관한 사항</h3>
          <ol className={styles.hangul}>
            <li>
              이용자는 회사에 대해 언제든지 다음과 같은 개인정보 보호관련 권리를 행사할 수 있습니다.
              <ul className={styles.dot}>
                <li>개인정보의 열람요구</li>
                <li>개인정보의 정정·삭제</li>
                <li>개인정보의 처리 정지</li>
              </ul>
            </li>
            <li>
              이용자가 서면, 전자우편, 모사전송(FAX) 등을 통하여 개인정보 열람 등의 요구를 하실 경우 지체 없이 조치하겠습니다[
              <Link href="/static/doc/request.doc" target="_blank">신청 서식</Link>].<br />
              단, 법률에 특별한 규정이 있거나 법령상 의무를 준수하기 위하여 불가피한 경우, 다른 사람의 권익을 침해할 우려가 있는 경우 등에는
              해당 이용자에게 알리고, 열람요구 및 처리정지 요구 등을 거절할 수 있습니다.
            </li>
            <li>이용자가 개인정보의 오류 등에 대한 정정 또는 삭제를 요구한 경우, 정정 또는 삭제를 완료할 때까지 당해 개인정보를 이용하거나 제공하지 않습니다.</li>
            <li>
              이용자는 위임을 받은 대리인을 통하여 개인정보 열람 등을 요구할 수 있습니다. 이 경우 위임장을 제출하여야 합니다[
              <Link href="/static/doc/delegation.doc" target="_blank">위임장</Link>].
            </li>
          </ol>
        </section>

        <section id="h2Title08" className={styles.sec}>
          <h3>8. 이용자 및 대리인의 권리와 그 행사방법</h3>
          <ol className={styles.hangul}>
            <li>이용자 및 위임을 받은 대리인은 언제든지 등록되어 있는 개인정보를 조회·수정할 수 있으며, 동의를 거부할 수 있습니다(서비스 이용 제한 가능).</li>
            <li>‘개인정보변경’ 및 동의철회는 홈페이지에서 직접 또는 대리인을 통해 가능하며, 담당부서에 서면·전화·메일로도 요청 가능합니다.</li>
            <li>정정 요청 시 완료 전까지 해당 개인정보를 이용·제공하지 않습니다.</li>
            <li>해지·삭제된 개인정보는 “9. 개인정보의 이용기간 및 보유기간”에 따라 처리되며 그 외 용도로 열람·이용할 수 없도록 합니다.</li>
          </ol>
        </section>

        <section id="h2Title09" className={styles.sec}>
          <h3>9. 개인정보의 이용기간 및 보유기간</h3>
          <p>
            원칙적으로 목적 달성 시 지체 없이 파기합니다. 다만 회사 임직원 등의 개인정보는 퇴직 후에도 사고예방, 조사, 분쟁해결, 민원처리,
            법령상 의무 이행만을 위하여 보유·이용되며, 입사지원자의 개인정보는 채용공고 게재일로부터 1년간 보관 후 삭제합니다.
            삭제 요청 시 지체 없이 삭제합니다.
          </p>
        </section>

        <section id="h2Title10" className={styles.sec}>
          <h3>10. 개인정보 파기 절차 및 방법</h3>
          <ol className={styles.hangul}>
            <li>
              파기절차
              <ul className={styles.dot}>
                <li>개인정보가 불필요하게 되었을 때 5일 이내 파기합니다.</li>
                <li>보존 필요 시 별도 DB 또는 장소에 분리 보관합니다.</li>
              </ul>
            </li>
            <li>
              파기방법
              <ul className={styles.dot}>
                <li>종이: 분쇄 또는 소각</li>
                <li>전자파일: 복구 불가능한 기술적 방법으로 삭제</li>
              </ul>
            </li>
          </ol>
        </section>

        <section id="h2Title11" className={styles.sec}>
          <h3>11. 개인정보의 안전성 확보조치에 관한 사항</h3>
          <p>분실·도난·누출·변조·훼손 방지를 위해 다음의 조치를 시행합니다.</p>
          <ol className={styles.hangul}>
            <li>
              관리적 조치
              <ul className={styles.dot}>
                <li>내부관리계획 수립·시행 및 교육</li>
                <li>정기 자체점검</li>
              </ul>
            </li>
            <li>
              기술적 조치
              <ul className={styles.dot}>
                <li>접속권한 최소화 및 차등 부여</li>
                <li>암호화·전송보안 적용</li>
                <li>접속기록 보관/위·변조 방지, 정기 백업</li>
                <li>문서암호화·백신 등 보안 프로그램 운영</li>
                <li>네트워크 접근통제</li>
              </ul>
            </li>
            <li>
              물리적 조치
              <ul className={styles.dot}>
                <li>전산실·보관실 접근통제</li>
                <li>서류·매체 잠금보관</li>
              </ul>
            </li>
          </ol>
          <p className={styles.muted}>
            단, 회사가 법적 의무를 다했음에도 이용자 부주의나 회사가 통제하지 않는 영역에서 발생한 손해는 책임지지 않습니다.
          </p>
        </section>

        <section id="h2Title12" className={styles.sec}>
          <h3>12. 개인정보처리방침의 변경에 관한 사항</h3>
          <p>변경 및 시행 시기, 변경 내용을 지속 공개하며, 이용자가 쉽게 확인할 수 있도록 전·후 비교하여 공개합니다.</p>
        </section>



        <section id="h2Title14" className={styles.sec}>
          <h3>13. 고지의 의무</h3>
          <p>중요 변경 또는 방침 변경(추가·삭제 등) 시 홈페이지를 통해 고지합니다.</p>
        </section>
      </section>

      <section
        className={styles.container}
        style={{ display: activeTab === 2 ? "block" : "none" }}
      >
        <div className={styles.lead}>
          <p>
            하나모아(이하 '회사'라 함)는 영상정보처리기기 운영·관리 방침을 통해 회사에서 처리하는
            영상정보가 어떠한 용도와 방식으로 이용·관리되고 있는지 알려드립니다.
          </p>
        </div>

        <section className={styles.sec}>
          <h3>1. 영상정보처리기기 설치근거 및 목적</h3>
          <p>『개인정보 보호법』 제25조 제1항에 따라 다음의 목적으로 설치·운영합니다.</p>
          <ul className={styles.dot}>
            <li>시설안전, 화재예방 및 범죄예방</li>
            <li>차량도난 및 파손방지</li>
          </ul>
        </section>

        <section className={styles.sec}>
          <h3>2. 설치 대수, 설치 위치 및 촬영 범위</h3>
          <div className={styles.table}>
            <table>
              <caption>영상정보처리기기의 설치 대수</caption>
              <colgroup>
                <col style={{ width: "30%" }} />
                <col style={{ width: "70%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th>설치 대수</th>
                  <th>설치 위치 및 촬영 범위</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={styles.center}>536대</td>
                  <td className={styles.center}>회사 건물 및 주차장 등 주요시설물</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.sec}>
          <h3>3. 관리책임자 및 접근권한자</h3>
          <p>개인영상정보 관리책임자 및 접근권한자를 아래와 같이 지정·운영합니다.</p>
          <div className={styles.table}>
            <table>
              <caption>관리책임자 및 접근권한자</caption>
              <colgroup>
                <col />
                <col style={{ width: "30%" }} />
                <col style={{ width: "30%" }} />
                <col style={{ width: "30%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th>구분</th>
                  <th>관리책임자</th>
                  <th>접근권한자</th>
                  <th>연락처</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={styles.center}>청라IDC</td>
                  <td className={styles.center}>통합구매팀장</td>
                  <td className={styles.center}>IDC운영 개인영상정보 보호담당자</td>
                  <td className={styles.center}>02-2151-6496</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.sec}>
          <h3>4. 촬영시간, 보관기간, 보관장소</h3>
          <div className={styles.table}>
            <table>
              <caption>촬영시간, 보관기간, 보관장소</caption>
              <colgroup>
                <col style={{ width: "20%" }} />
                <col style={{ width: "40%" }} />
                <col style={{ width: "40%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th>촬영시간</th>
                  <th>보관기간</th>
                  <th>보관장소</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={styles.center}>24시간</td>
                  <td className={styles.center}>촬영시부터 62일</td>
                  <td className={styles.center}>청라IDC 방재센터</td>
                </tr>
              </tbody>
            </table>
            <div className={styles.small}>※ 62일 후 자동삭제</div>
          </div>
        </section>

        <section className={styles.sec}>
          <h3>5. 설치 및 관리 위탁</h3>
          <p>다음 업체에 설치 및 관리 등을 위탁합니다.</p>
          <div className={styles.table}>
            <table>
              <caption>위탁 사항</caption>
              <colgroup>
                <col style={{ width: "33.3%" }} />
                <col style={{ width: "33.3%" }} />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th>수탁업체</th>
                  <th>위탁업무의 범위</th>
                  <th>연락처</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={styles.center}>두레시닝㈜</td>
                  <td className={styles.center}>영상정보처리기기 감시</td>
                  <td className={styles.center}>02-6420-6560</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.sec}>
          <h3>6. 영상정보 확인 방법 및 장소</h3>
          <ul className={styles.dot}>
            <li>방법 : 사전 연락 후 방문 시 확인 가능</li>
            <li>장소 : 청라IDC 방재센터</li>
          </ul>
        </section>

        <section className={styles.sec}>
          <h3>7. 열람 등 요구</h3>
          <ul className={styles.dot}>
            <li>열람·존재확인·삭제는 청구서로 신청하며 요건 충족 시에 한해 허용</li>
            <li>보관기간 경과 파기 등 정당한 사유 시 거부 가능(10일 이내 통지)</li>
          </ul>
        </section>

        <section className={styles.sec}>
          <h3>8. 안전성 확보조치</h3>
          <p>접근권한/접근통제 지정, 열람 기록·관리, 물리적 잠금장치 등으로 보호합니다.</p>
        </section>

        <section className={styles.sec}>
          <h3>9. 방침 변경</h3>
          <p>법령·정책·보안기술 변경 시 시행 7일 전 홈페이지에 공지합니다.</p>
        </section>
      </section>
      </main>
    </>
  );
}
