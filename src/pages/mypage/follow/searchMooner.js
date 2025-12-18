import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../../assets/css/follow.css';

import exit from '../../../assets/images/exit.png';
import search from '../../../assets/images/search.png';
import basicprofileimg from '../../../assets/images/basicprofileimg.png';

const SearchMooner = ({ onClose }) => {
    const [searchText, setSearchText] = useState('');
    const [userInfo, setUserInfo] = useState(null); // 유저 정보 상태 저장

    const handleInputChange = (event) => {
        setSearchText(event.target.value);
    };

    // 검색 API 호출 함수
    const fetchUser = async () => {
        const trimmedText = searchText.trim();
        if (trimmedText === '') return;
    
        try {
            // API 요청 시 searchText를 쿼리 파라미터로 전달
            const response = await axios.get(
                `https://api.usdiary.site/friends/search/nickname`,
                { params: { user_nick: trimmedText } }
            );
    
            console.log('API Response:', response.data); // 응답 전체 확인
    
            const data = response.data.data; // data를 명확히 변수로 할당
            if (!data || !data.user) {
                console.log('사용자 정보가 없습니다.');
                setUserInfo(null); // 유저 정보가 없으면 상태 초기화
                return;
            }
    
            const user = data.user; // user 객체 할당
    
            // user 정보를 상태에 저장
            setUserInfo({
                user_id: user.user_id,
                user_nick: user.user_nick,
                profile_img: user.profile_img || basicprofileimg,
            });
    
        } catch (error) {
            console.error('Error fetching user:', error);
            setUserInfo(null); // 오류 발생 시 상태 초기화
        }
    };
    

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            fetchUser();
        }
    };

    const handleSearchClick = () => {
        fetchUser();
    };

    useEffect(() => {
        // userInfo 상태가 업데이트될 때마다 콘솔 출력
        if (userInfo) {
            console.log('userInfo:', {
                profile_img: userInfo.profile_img,
                user_nick: userInfo.user_nick,
                user_id: userInfo.user_id
            });
        }
    }, [userInfo]); // userInfo 상태가 변경될 때마다 실행

    return (
        <div className="mooner_popup-overlay">
            <div className="mooner_popup-content">
                <img src={exit} className="mooner_popup_close" alt="Close popup" onClick={onClose} />
                <div className='mooner_popup_name'>닉네임으로 무너 찾기</div>
                <div className='mooner_popup_search-id'>
                    <input
                        type="text"
                        value={searchText}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="닉네임 검색"
                        className='mooner_popup_search-id_input'
                    />
                    <img
                        src={search}
                        alt="Search icon"
                        onClick={handleSearchClick}
                    />
                </div>
                <div className='mooner_popup_box'>
                    {userInfo && (
                        <div className='profile-follow_box_content_box_friend'>
                            <img
                                src={userInfo.profile_img}
                                className='profile-follow_box_content_box_friend_img'
                                alt='profile'
                            />
                            <div className='profile-follow_box_content_box_friend_text'>
                                <div className='profile-follow_box_content_box_friend_text_nickname'>{userInfo.user_nick}</div>
                                <div className='profile-follow_box_content_box_friend_text_id'>{userInfo.user_id}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchMooner;
