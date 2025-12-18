import React, { useEffect, useState } from 'react';
import '../../assets/css/follow.css';
import '../../assets/css/notification.css';
import Menu from '../../components/menu';
import ProfileMenu from '../../components/profileMenu';
import { Link } from 'react-router-dom';

const Notification = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const notificationsPerPage = 7;
    const [notifications, setNotifications] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await fetch('https://api.usdiary.site/notices', {
                    method: 'GET',
                });

                if (!response.ok) {
                    throw new Error('공지사항을 가져오는 데 실패했습니다.');
                }

                const data = await response.json();
                setNotifications(data); // 서버에서 가져온 공지사항 데이터를 상태로 저장
            } catch (err) {
                setError(err.message); // 에러 발생 시 상태에 저장
            }
        };

        fetchNotifications();
    }, []);

    // 현재 페이지에 맞는 공지사항 추출
    const indexOfLastNotification = currentPage * notificationsPerPage;
    const indexOfFirstNotification = indexOfLastNotification - notificationsPerPage;
    const currentNotifications = notifications.slice(indexOfFirstNotification, indexOfLastNotification);
    const totalPages = Math.ceil(notifications.length / notificationsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className='wrap'>
            <Menu />
            <div className='profile'>
                <ProfileMenu />
                <div className='notification-contents'>
                    <div className='notification-contents-title'>공지사항</div>
                    {error && <p className='error-message'>{error}</p>} {/* 에러 메시지 표시 */}
                    <div className='notification-list'>
                        <div className='notification-header'>
                            <span>번호</span>
                            <span>제목</span>
                            <span>등록일</span>
                            <span>조회수</span>
                        </div>
                        {currentNotifications.map((notification) => (
                            <div key={notification.id} className='notification-item'>
                                <span>{notification.id}</span>
                                <Link to={`/notification/${notification.id}`} className='notification-title'>
                                    {notification.title}
                                </Link>
                                <span>{notification.created_at.split('T')[0]}</span> {/* 날짜 포맷 조정 */}
                                <span>{notification.views}</span>
                            </div>
                        ))}
                    </div>

                    <div className='pagination'>
                        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                            &lt;
                        </button>
                        {[...Array(totalPages).keys()].map(pageNumber => (
                            <button
                                key={pageNumber + 1}
                                onClick={() => handlePageChange(pageNumber + 1)}
                                className={currentPage === pageNumber + 1 ? 'active' : ''}
                            >
                                {pageNumber + 1}
                            </button>
                        ))}
                        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                            &gt;
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Notification;
