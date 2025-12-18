import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../../assets/css/follow.css';
import exit from '../../../assets/images/exit.png';
import { jwtDecode } from 'jwt-decode';
import basicprofileimg from '../../../assets/images/basicprofileimg.png';

const RequestMooner = ({ onClose }) => {
    const [entireUsers, setEntireUsers] = useState([]);
    const [signId, setSignId] = useState(null);
    const [userInfo, setUserInfo] = useState(null); // 유저 정보 상태 저장

    // JWT 토큰에서 sign_id 추출
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const savedSignId = decoded.sign_id;
                if (savedSignId) {
                    setSignId(savedSignId);
                }
            } catch (error) {
                console.error("Invalid token", error);
            }
        }
    }, []);

    // 팔로우 요청 목록 가져오기
    useEffect(() => {
        console.log("Fetching follow requests..."); // API 호출 시작 로그
        axios.get('https://api.usdiary.site/friends/follow-request/handle')
            .then((response) => {
                console.log("API Response:", response.data); // 응답 데이터 출력
                setEntireUsers(response.data.data); // 경로 수정: response.data.data
            })
            .catch((error) => {
                console.error('Error fetching follow requests:', error);
            });
    }, []);

    // 요청 수락 처리
    const handleAccept = async (user) => {
        if (!signId) {
            console.error("sign_id is missing");
            return;
        }

        try {
            const response = await axios.post('https://api.usdiary.site/friends/follow-request/handle', {
                follower_sign_id: user.id, // 요청자의 ID
                action: "accepted",        // 수락 액션
            });

            console.log(response.data.message); // 성공 메시지 로그
            setEntireUsers((prevUsers) => prevUsers.filter((u) => u.id !== user.id)); // 목록에서 제거
        } catch (error) {
            console.error('Error accepting request:', error);
        }
    };

    // 요청 거절 처리
    const handleRefuse = async (user) => {
        if (!signId) {
            console.error("sign_id is missing");
            return;
        }

        try {
            const response = await axios.post('https://api.usdiary.site/friends/follow-request/handle', {
                follower_sign_id: user.id, // 요청자의 ID
                action: "refused",         // 거절 액션
            });

            console.log(response.data.message); // 성공 메시지 로그
            setEntireUsers((prevUsers) => prevUsers.filter((u) => u.id !== user.id)); // 목록에서 제거
        } catch (error) {
            console.error('Error refusing request:', error);
        }
    };

    // 유저 정보 상태가 변경될 때마다 콘솔에 출력
    useEffect(() => {
        if (userInfo) {
            console.log('userInfo:', {
                profile_img: userInfo.profile_img,
                user_nick: userInfo.user_nick,
                user_id: userInfo.user_id
            });
        }
    }, [userInfo]);

    return (
        <div className="mooner_popup-overlay">
            <div className="mooner_popup-content">
                <img src={exit} className="mooner_popup_close" alt="Close popup" onClick={onClose} />
                <div className='mooner_popup_name'>무너 요청</div>
                <div className='request_box'>
                    {entireUsers.map((user, index) => (
                        <div key={index} className='profile-follow_box_content_box_friend'>
                            <img
                                src={user.profile_img || basicprofileimg}
                                className='profile-follow_box_content_box_friend_img'
                                alt='profile'
                            />
                            <div className='profile-follow_box_content_box_friend_text'>
                                <div className='profile-follow_box_content_box_friend_text_nickname'>{user.user_nick}</div>
                                <div className='profile-follow_box_content_box_friend_text_id'>{user.user_id}</div>
                            </div>
                            <div className='request_accept' onClick={() => handleAccept(user)}>수락</div>
                            <div className='request_refusal' onClick={() => handleRefuse(user)}>거절</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RequestMooner;
