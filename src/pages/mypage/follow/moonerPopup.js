import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../../assets/css/moonerPopup.css';
import DiaryCard from '../../../components/diaryCard';
import exit from '../../../assets/images/exit.png';
import defaultProfileImg from '../../../assets/images/default.png';

const MoonerPopup = ({ follower, onClose }) => {
    const [diaries, setDiaries] = useState([]);
    const [pinCount, setPinCount] = useState(0);
    const [relationship, setRelationship] = useState(true);
    const [btnText, setBtnText] = useState(relationship ? '무너' : '무너맺기');

    const getBoardText = (tendencyName) => {
        switch (tendencyName) {
            case "1":
                return "숲";
            case "2":
                return "도시";
            case "3":
                return "바다";
            default:
                return "알 수 없음";
        }
    };

    const handleDiaryClick = (diaryId) => {
        console.log('Diary clicked with ID:', diaryId);
    };

    const handleFollowClick = () => {
        if (btnText === '무너') {
            setBtnText('무너맺기');
            updateRelationship(false);
        } else if (btnText === '무너맺기') {
            setBtnText('무너 신청 중');
            updateRelationship(true);
        }
    };

    const updateRelationship = async (newRelationshipStatus) => {
        try {
            await axios.post(`https://api.usdiary.site/friends/follow-request`, {
                requested_sign_id: follower.user_id, // 서버에 전달할 사용자 ID
            });
            setRelationship(newRelationshipStatus);
            console.log('서버로 관계 상태 전송 성공:', newRelationshipStatus);
        } catch (error) {
            console.error('서버로 관계 상태 전송 실패:', error);
        }
    };

    useEffect(() => {
        const fetchDiaries = async () => {
            try {
                const response = await axios.get(`https://api.usdiary.site/friends/search/nickname`);
                const userData = response.data.data.user;
                const recentDiaries = response.data.data.recent_diaries;
    
                // 사용자 정보와 다이어리 설정
                setDiaries(recentDiaries);
                setPinCount(recentDiaries.length);
            } catch (error) {
                console.error('다이어리 데이터 가져오기 실패:', error);
            }
        };
    
        fetchDiaries();
    }, []);
    

    if (!onClose) return null;

    return (
        <div className="mooner-popup-overlay">
            <div className="mooner-popup">
                <div className="mooner-popup-content">
                    <img
                        src={exit}
                        className="mooner-popup_close"
                        alt="Close popup"
                        onClick={onClose}
                    />
                    <div className="mooner-popup-profile">
                        <div className="mooner-popup-profile_friend">
                            <img
                                src={follower.friend_profile_img || defaultProfileImg}
                                className="mooner-popup-profile_friend_img"
                                alt="profile"
                            />
                            <div className="mooner-popup-profile_friend_text">
                                <div className="mooner-popup-profile_friend_text_nickname">
                                    {follower.friend_nick}
                                </div>
                                <div className="mooner-popup-profile_friend_text_board">
                                    {getBoardText(follower.user_tendency)}
                                </div>
                            </div>
                            <div
                                className="mooner-popup-profile_friend_btn"
                                onClick={handleFollowClick}
                            >
                                {btnText}
                            </div>
                        </div>
                        <div className="mooner-popup-profile_pins">
                            <div className="mooner-popup-profile_pins_name">Pins</div>
                            <div className="mooner-popup-profile_pins_diaries">
                                {diaries.length === 0 ? (
                                    <p>고정된 일기가 없습니다</p>
                                ) : (
                                    diaries.map((diary) => (
                                        <DiaryCard
                                            key={diary.diary_id}
                                            diary_title={diary.diary_title}
                                            createdAt={diary.createdAt}
                                            diary_content={diary.diary_content}
                                            post_photo={diary.post_photo}
                                            handleDiaryClick={() => handleDiaryClick(diary.diary_id)}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MoonerPopup;
