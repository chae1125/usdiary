import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../../assets/css/notification_detail.css';
import '../../assets/css/follow.css';
import Menu from '../../components/menu';
import ProfileMenu from '../../components/profileMenu';

const NotificationDetail = () => {
    const { id } = useParams(); // URL 파라미터에서 id 가져오기
    const [notification, setNotification] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNotification = async () => {
            try {
                // id를 URL에 포함시켜 단일 공지사항 조회
                const response = await fetch(`https://api.usdiary.site/notice/${id}`, {
                    method: 'GET',
                });

                if (!response.ok) {
                    throw new Error('공지사항을 가져오는 데 실패했습니다.');
                }

                const data = await response.json();
                setNotification(data); // 단일 공지사항을 상태로 저장

                // 전체 공지사항 목록을 가져와서 상태에 저장
                const allNotificationsResponse = await fetch('https://api.usdiary.site/notices');
                if (!allNotificationsResponse.ok) {
                    throw new Error('전체 공지사항을 가져오는 데 실패했습니다.');
                }
                const allNotificationsData = await allNotificationsResponse.json();
                setNotifications(allNotificationsData);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchNotification();
    }, [id]);

    if (error) {
        return <div>{error}</div>;
    }

    if (!notification) {
        return <div>Loading...</div>;
    }

    const nextId = notifications.findIndex((n) => n.id === Number(id)) + 1;
    const prevId = notifications.findIndex((n) => n.id === Number(id)) - 1;

    const hasNext = nextId < notifications.length;
    const hasPrev = prevId >= 0;

    return (
        <div className='wrap'>
            <Menu />
            <div className='notification'>
                <ProfileMenu />
                <div className='notification-contents'>
                    <h2 className='notification-title'>{notification.title}</h2>
                    <hr className='title-divider' />
                    <div className='notification-meta'>
                        <span>작성일 | {notification.created_at.split('T')[0]}</span>
                        <span>조회 | {notification.views} <Link to='/notification' className='back-link'>목록</Link></span>
                    </div>
                    <hr className='meta-divider' />
                    <p className='notification-content'>{notification.content}</p>
                    <div className='next-prev-links'>
                        <hr className='divider' />
                        <div className='next-link-container'>
                            {hasNext ? (
                                <>
                                    <Link to={`/notification/${notifications[nextId].id}`} className='next-link'>▲ 다음글</Link>
                                    <Link to={`/notification/${notifications[nextId].id}`} className='next-title'>
                                        {notifications[nextId].title}
                                    </Link>
                                </>
                            ) : (
                                <div className='next-link disabled'>▲ 다음글 글이 존재하지 않습니다.</div>
                            )}
                        </div>
                        <hr className='divider' />
                        <div className='prev-link-container'>
                            {hasPrev ? (
                                <>
                                    <Link to={`/notification/${notifications[prevId].id}`} className='prev-link'>▼ 이전글</Link>
                                    <Link to={`/notification/${notifications[prevId].id}`} className='prev-title'>
                                        {notifications[prevId].title}
                                    </Link>
                                </>
                            ) : (
                                <div className='prev-link disabled'>▼ 이전글 글이 존재하지 않습니다.</div>
                            )}
                        </div>
                        <hr className='divider' />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationDetail;
