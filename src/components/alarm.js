import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../assets/css/alarm.css';  // 스타일을 위한 CSS 파일을 임포트

const Alarm = ({ isOpen, onClose }) => {
    const [isOn, setIsOn] = useState(false);
    const [notifications, setNotifications] = useState([]);  // 좋아요, 댓글 데이터 저장
    const [sign_id, setSignId] = useState(null);  // 사용자 아이디 저장
    const [user_nick, setUserNick] = useState(null);  // 사용자 닉네임 저장
    const location = useLocation();  // 현재 경로 가져오기

    const handleToggle = () => {
        setIsOn(!isOn);
        if (!isOn) {
            setNotifications([]);  // 알림 끄기 시 알림 목록 비우기
        }
    };

    // 사용자 정보 가져오기
    const fetchUserInfo = async () => {
        const token = localStorage.getItem('token');  // JWT 토큰 가져오기

        if (!token) {
            console.log('토큰이 없습니다. 로그인 필요');
            return;
        }

        const response = await fetch('/user', {
            method: 'GET',
            headers: {
                'Authorization': token,
            },
        });

        if (response.ok) {
            const data = await response.json();
            setSignId(data.sign_id);  // 사용자 아이디 설정
            setUserNick(data.user_nick);  // 사용자 닉네임 설정
        } else {
            console.log('사용자 정보를 가져오지 못했습니다.');
        }
    };

    // 알림 데이터 가져오기
    const fetchNotifications = async () => {
        const token = localStorage.getItem('token');  // JWT 토큰 가져오기

        if (!token || !sign_id) {
            console.log('토큰이 없거나 사용자 아이디가 없습니다. 로그인 필요');
            return;
        }

        const response = await fetch(`/api/system/notifications?userId=${sign_id}`, {  // 쿼리 파라미터로 userId 추가
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',  // 요청 헤더에 Content-Type 설정
                'Authorization': token,
            },
        });

        if (response.ok) {
            const data = await response.json();
            setNotifications(data.notifications);  // 서버에서 받은 알림 데이터 설정
        } else {
            console.log('알림 데이터를 가져오지 못했습니다. 상태 코드:', response.status);
        }
    };

    useEffect(() => {
        if (isOpen) {
            // 사용자 정보 가져오기
            const fetchData = async () => {
                await fetchUserInfo();  // 사용자 정보 가져오기
                if (isOn) {  // 알림이 켜져 있을 때만 알림 데이터 가져오기
                    await fetchNotifications();  // 알림 데이터 가져오기
                }
            };

            fetchData();
        }
    }, [isOpen, isOn]);  // isOn을 의존성 배열에 추가

    // 페이지 경로에 따른 알림 항목 배경색 설정
    const getNotificationBackgroundColor = () => {
        switch (location.pathname) {
            case '/forest':
            case '/forestquestion':
            case '/diaries/diaries_forest':
            case '/forest_diary':
                return '#E8F3DA';  // 연한 초록색
            case '/city':
            case '/checklist/checklist':
            case '/diaries/diaries_city':
            case '/city_diary':
                return '#FFFDB9';  // 연한 노란색
            case '/sea':
            case '/diaries/diaries_sea':
            case '/diaries/special_day':
            case '/sea_diary':
                return '#EAF0FF';  // 연한 파란색
            case '/friend':
                return '#F9EAFE';  // 연한 보라색
            default:
                return '#FFFFFF';  // 기본 배경색
        }
    };

    if (!isOpen) return null;  // 팝업이 열려있지 않으면 아무것도 렌더링하지 않음

    return (
        <div className={`popup-container ${isOpen ? 'show' : ''}`}>
            <div className="popup-header">
                <h3>알림설정</h3>
                <div className="onoff-switch">
                    <input 
                        type="checkbox" 
                        checked={isOn} 
                        onChange={handleToggle} 
                    />
                </div>
            </div>
            <div className="popup-body">
                <h3>알람내역</h3>
                <ul>
                    {notifications.length > 0 ? (
                        notifications.map((notification, index) => (
                            <li key={index} style={{ backgroundColor: getNotificationBackgroundColor() }}>
                                <div className="rounded-img">
                                    <img src={notification.profileImageUrl} alt="User" />
                                </div>
                                <div className="notification-message">
                                    {notification.type === 'like' ? (
                                        <p>{user_nick}님이 회원님의 게시글을 좋아합니다.</p>
                                    ) : notification.type === 'comment' ? (
                                        <p>{user_nick}님이 회원님의 게시글에 댓글을 달았습니다.</p>
                                    ) : null}
                                    <span className="notification-date">{notification.date}</span>
                                </div>
                                <div className="square-img">
                                    <img src={notification.diary_id} alt="Diary" />
                                </div>
                            </li>
                        ))
                    ) : (
                        <li>알림이 없습니다.</li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default Alarm;
