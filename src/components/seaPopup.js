import React, { useEffect, useState, useRef } from 'react';
import '../assets/css/seaPopup.css';
import miniseaImage from '../assets/images/minisea.png';
import sirenIcon from '../assets/images/siren_sea.png';
import ReportPopup from './reportPopup';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Viewer } from '@toast-ui/react-editor';
import defaultImage from '../assets/images/default.png';

import seashell from '../assets/images/seashell.png';
import umbrage from '../assets/images/umbrage.png';
import bicycle from '../assets/images/bicycle.png';
import duck from '../assets/images/duck.png';
import flower from '../assets/images/flower.png';
import watermelon from '../assets/images/watermelon.png';

import coffee from '../assets/images/coffee.png';
import book from '../assets/images/book.png';
import plate from '../assets/images/plate.png';
import film from '../assets/images/film.png';
import palette from '../assets/images/palette.png';
import shoppingbag from '../assets/images/shoppingbag.png';
import balloon from '../assets/images/balloon.png';
import uniform from '../assets/images/uniform.png';
import ticket from '../assets/images/ticket.png';

const iconMap = {
    1: seashell,
    2: umbrage,
    3: bicycle,
    4: duck,
    5: flower,
    6: watermelon,
    7: coffee,
    8: book,
    9: plate,
    10: film,
    11: palette,
    12: shoppingbag,
    13: balloon,
    14: uniform,
    15: ticket,
};

const SeaPopup = ({ diary_id, onClose }) => {
    const [diary, setDiary] = useState(null);
    const [todayPlace, setTodayPlace] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false); // 로딩 상태 초기화
    const [liked, setLiked] = useState(false); // 좋아요 상태
    const [newComment, setNewComment] = useState(''); // 새 댓글 입력 상태
    const [error, setError] = useState(null);
    const [editingcomment_id, setEditingcomment_id] = useState(null);
    const commentRefs = useRef({});
    const [selectedIcon, setSelectedIcon] = useState(null);
    const [diaryLoading, setDiaryLoading] = useState(true);
    const [userProfile, setUserProfile] = useState({
        profile_img: '',
        user_nick: ''
    });

    const getIconClass = (cate_num) => {
        return `sea-popup__icon-${cate_num}`;
    };

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            console.warn("No token found in localStorage.");
            return;
        }

        const decoded = jwtDecode(token);
        const user_id = decoded.user_id; // Extract user_id from token

        const fetchUserProfile = async () => {
            try {
                const response = await axios.get(`https://api.usdiary.site/mypages/profiles/${user_id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                // Check if the data exists in response
                if (response.data && response.data.data) {
                    const { user_nick, profile_img } = response.data.data;

                    setUserProfile({
                        user_nick: user_nick || 'Unknown User',
                        profile_img: profile_img || 'defaultProfileImg.jpg', // Fallback profile image if none exists
                    });
                } else {
                    console.error("User profile data is missing in response:", response);
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        };

        fetchUserProfile();
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const fetchTodayPlace = async () => {
            const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식으로 현재 날짜 가져오기
            if (token) {
                try {
                    const response = await axios.get(`https://api.usdiary.site/contents/places`, {
                        params: { date: currentDate },
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const fetchedPlace = response.data.data[0];
                    if (fetchedPlace) {
                        console.log("fetchedPlace 전체 데이터:", fetchedPlace); // 전체 데이터를 콘솔에 출력
                        console.log("cate_num:", fetchedPlace.cate_num);
                        console.log("today_mood:", fetchedPlace.today_mood); // today_mood가 잘 불러와지는지 확인
                        console.log("place_memo:", fetchedPlace.place_memo);

                        setTodayPlace(fetchedPlace);
                        setSelectedIcon(iconMap[fetchedPlace.cate_num]);
                    } else {
                        console.warn("해당 날짜에 대한 장소 데이터가 없습니다.");
                    }
                } catch (error) {
                    console.error('오늘의 장소를 불러오는 데 실패했습니다.', error);
                }
            } else {
                console.error('토큰이 존재하지 않습니다.');
            }
        };

        fetchTodayPlace();
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const fetchDiaryData = async () => {
            setDiaryLoading(true);
            try {
                const response = await axios.get(`https://api.usdiary.site/diaries/${diary_id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setDiary(response.data.data.diary);
                console.log('Diary Data:', response.data.data);
            } catch (error) {
                const message = error.response?.status === 404
                    ? '일기를 찾을 수 없습니다.'
                    : '일기 데이터를 불러오는 데 실패했습니다.';
                setError(message);
                console.error('Error fetching diary data:', error.response?.data || error.message);
            } finally {
                setDiaryLoading(false);
            }
        };

        fetchDiaryData();
    }, [diary_id]);

    useEffect(() => {
        // userProfile.user_nick이 설정된 이후에만 comments를 가져옴
        if (userProfile.user_nick) {
            const token = localStorage.getItem('token');

            const fetchComments = async () => {
                try {
                    const response = await axios.get(`https://api.usdiary.site/diaries/${diary_id}/comments`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const commentsData = response.data?.data || [];
                    setComments(commentsData);
                    console.log('Comments Data:', commentsData);

                } catch (error) {
                    const message = error.code === 'ECONNABORTED'
                        ? '서버 응답이 지연되었습니다. 잠시 후 다시 시도해주세요.'
                        : '댓글을 불러오는 데 실패했습니다.';
                    setError(message);
                    console.error('Error fetching comments:', error);
                } finally {
                    setLoading(false);
                }
            };

            fetchComments();
        }
    }, [userProfile.user_nick, diary_id]);


    const [reportPopupVisible, setReportPopupVisible] = useState(false);

    const handleReportButtonClick = () => {
        setReportPopupVisible(true);
    };

    const handleCloseReportPopup = () => {
        setReportPopupVisible(false);
    };

    if (loading) return <div className="sea-popup">Loading...</div>;
    if (error) return <div className="sea-popup">{error}</div>;
    if (diaryLoading) return <div className="diary-popup">Loading...</div>;

    const handleBackgroundClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleCommentChange = (e) => {
        setNewComment(e.target.value);
    };

    const handleCommentSubmit = async () => {
        if (newComment.trim()) {
            const newCommentData = {
                content: newComment, // 서버가 기대하는 필드명에 맞춤
            };

            try {
                const token = localStorage.getItem('token'); // JWT 토큰 가져오기

                // 서버에 댓글 요청
                const response = await axios.post(`https://api.usdiary.site/diaries/${diary_id}/comments`, newCommentData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                // 상태 코드가 201일 때만 댓글 목록에 추가
                if (response.status === 201) {
                    const newCommentWithUser = {
                        ...response.data.data.comment,
                        User: {
                            user_nick: userProfile?.user_nick,
                            Profile: {
                                profile_img: userProfile?.profile_img,
                            },
                        },
                    };

                    setComments(prevComments => [...prevComments, newCommentWithUser]);
                    setNewComment("");
                    console.log(response.data.message); // 댓글 생성 성공 메시지 로그
                } else {
                    setError('Failed to submit comment');
                    console.error('Unexpected response status:', response.status);
                }
            } catch (err) {
                if (err.response) {
                    if (err.response.status === 419) {
                        setError('Token has expired');
                    } else if (err.response.status === 404) {
                        setError(err.response.data.message);
                    } else {
                        setError('Failed to submit comment');
                    }
                    console.error('Server response error:', err.response.data);
                } else {
                    setError('Failed to submit comment');
                    console.error('Error submitting comment:', err);
                }
            }
        }
    };



    const handleEditClick = (comment_id) => {
        setEditingcomment_id(comment_id);
    };

    const handleEditBlur = async (comment_id) => {
        console.log("diary_id:", diary_id, "comment_id:", comment_id);

        const commentEl = commentRefs.current[comment_id];

        if (commentEl) {
            const updatedContent = commentEl.innerText;

            try {
                const token = localStorage.getItem('token');

                // JWT에서 sign_id를 추출
                const decodedToken = jwtDecode(token);
                const loggedInSignId = decodedToken?.sign_id;

                console.log("Logged in sign_id:", loggedInSignId); // sign_id가 올바르게 추출되었는지 확인

                // 현재 댓글의 작성자와 로그인한 사용자 비교
                const comment = comments.find(comment => comment.comment_id === comment_id);
                if (!comment || comment.sign_id !== loggedInSignId) {
                    console.log("You do not have permission to edit this comment.");
                    setError("You do not have permission to edit this comment.");
                    return;
                }

                const response = await axios.put(
                    `https://api.usdiary.site/diaries/${diary_id}/comments/${comment_id}`,
                    { content: updatedContent },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                console.log('Response:', response.data);

                // Update comments in the state with the edited comment content
                setComments(comments.map(comment =>
                    comment.comment_id === comment_id
                        ? { ...comment, content: updatedContent }
                        : comment
                ));
            } catch (err) {
                setError('Failed to update comment');
                console.error('Error updating comment:', err.response?.data || err.message);
            }
        }

        setEditingcomment_id(null); // Exit edit mode
    };

    const handleDeleteClick = async (comment_id) => {
        try {
            const token = localStorage.getItem('token'); // JWT 토큰 가져오기

            const response = await axios.delete(`https://api.usdiary.site/diaries/${diary_id}/comments/${comment_id}`, {
                headers: { Authorization: `Bearer ${token}` }, // 토큰 헤더에 추가

            });

            // 상태 코드가 200일 때만 댓글 목록에서 삭제
            if (response.status === 200) {
                setComments(prevComments => prevComments.filter(comment => comment.comment_id !== comment_id));
                console.log('Comment deleted successfully:', response.data.message);
                return;
            }

            // 상태 코드가 404일 경우
            if (response.status === 404) {
                setError('Comment not found');
                console.error('Comment not found:', response.data.message);
                return;
            }

            // 예상치 못한 상태 코드
            setError('Failed to delete comment');
            console.error('Unexpected response status:', response.status);

        } catch (err) {
            setError('Failed to delete comment');
            console.error('Error deleting comment:', err.response?.data.message || err.message);
        }
    };

    const toggleLike = async (e) => {
        e.stopPropagation();
        try {
            const response = await axios.post(`/diaries/${diary_id}/like`, { liked: !liked });
            if (response.status === 200) {
                setLiked(!liked);
            }
        } catch (error) {
            console.error('Failed to update like status', error);
        }
    };

    const hasComments = comments.length > 0;
    const showPlaceSection = todayPlace?.cate_num !== undefined && todayPlace?.cate_num !== null;




    const EmptyHeart = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7D9FE3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
    );

    const FilledHeart = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#7D9FE3" stroke="#7D9FE3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
    );

    return (
        <div>
            <div className="sea-popup" onClick={handleBackgroundClick}>
                <div className="sea-popup__content">
                    <div className='sea-popup__header'>
                        <div className='sea-popup__header-left'>
                            <img src={diary?.User?.Profile?.profile_img || defaultImage} alt={`${diary?.User?.user_nick || 'User'}'s profile`} className="city-popup__author-profile-image" />
                            <p className="city-popup__author-nickname">{diary?.User?.user_nick || 'User'}님</p>
                        </div>
                        <div className="sea-popup__header-right">
                            <button className="sea-popup__report-button" onClick={handleReportButtonClick}>
                                <img src={sirenIcon} alt="Report" />
                            </button>
                            <span className="sea-popup__like-button" onClick={toggleLike}>
                                {liked ? <FilledHeart /> : <EmptyHeart />}
                            </span>
                        </div>
                    </div>

                    <div className={`sea-popup__main-content ${!diary?.cate_num ? 'sea-popup__main-content--centered' : ''}`}>
                        {showPlaceSection && (
                            <div className='sea-popup__place-section'>
                                <h2 className="sea-popup__place-title">Today's Place</h2>
                                <div className='sea-popup__container'>
                                    <img src={selectedIcon} alt="Category Icon" className={`sea-popup__category-icon ${getIconClass(todayPlace.cate_num)}`} />
                                    <div className="sea-popup__icon-text">
                                        <div className="sea-popup__icon-emotion">{todayPlace.today_mood}</div>
                                        <div className="sea-popup__icon-memo">{todayPlace.place_memo}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="sea-popup__diary-section">
                            <div className='sea-popup__title'>
                                <img src={miniseaImage} alt="Mini sea" className="sea-popup__mini-sea-image" />
                                <h1 className='sea-popup__sea'>Today's sea</h1>
                            </div>
                            <div className='sea-popup__title-container'>
                                <p className='sea-popup__diary-title'>{diary.diary_title}</p>
                                <div className="sea-popup__title-line"></div>
                            </div>
                            <div className="sea-popup__diary-content">
                                <Viewer initialValue={diary?.diary_content || ""} />
                            </div>
                        </div>
                    </div>

                    <div className="sea-popup__comment-input-section">
                        <img src={userProfile.profile_img || defaultImage} alt="User Profile" className="sea-popup__user-profile-image" />                     <input
                            type="text"
                            value={newComment}
                            onChange={handleCommentChange}
                            placeholder="댓글 달기 ..."
                            className="sea-popup__comment-input"
                        />
                        <button onClick={handleCommentSubmit} className="sea-popup__comment-submit-button">댓글 작성</button>
                    </div>

                    <div className={`sea-popup__comments-section ${!hasComments ? 'sea-popup__comments-section--no-comments' : ''}`}>
                        {hasComments ? (
                            Array.isArray(comments) && comments.map((comment) => (
                                <div key={comment.comment_id} className="sea-popup__comment">
                                    <img
                                        src={comment.User?.Profile?.profile_img || ''}
                                        alt={`${comment.User?.user_nick || 'User'}'s profile`}
                                        className="sea-popup__comment-profile-image"
                                    />
                                    <div className="sea-popup__comment-details">
                                        <p className="sea-popup__comment-nickname">
                                            {comment.User?.user_nick ? `${comment?.User?.user_nick}님` : 'Anonymous'}
                                        </p>
                                        <p
                                            className={`sea-popup__comment-content ${editingcomment_id === comment.comment_id ? 'sea-popup__comment-content--editable' : ''}`}
                                            contentEditable={editingcomment_id === comment.comment_id}
                                            onBlur={() => handleEditBlur(comment.comment_id)}
                                            ref={(el) => commentRefs.current[comment.comment_id] = el}
                                            suppressContentEditableWarning={true}
                                        >
                                            {comment.comment_text}
                                        </p>
                                    </div>
                                    {comment.User?.user_nick === userProfile.user_nick && (
                                        <div className="sea-popup__comment-actions">
                                            {editingcomment_id === comment.comment_id ? (
                                                <button
                                                    className="sea-popup__edit-button"
                                                    onClick={() => setEditingcomment_id(null)}
                                                >
                                                    저장
                                                </button>
                                            ) : (
                                                <button
                                                    className="sea-popup__edit-button"
                                                    onClick={() => handleEditClick(comment.comment_id)}
                                                >
                                                    수정
                                                </button>
                                            )}
                                            <button
                                                className="sea-popup__delete-button"
                                                onClick={() => handleDeleteClick(comment.comment_id)}
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="sea-popup__no-comments-message">첫 번째 댓글을 남겨보세요!</p>
                        )}
                    </div>
                </div>
            </div>
            {reportPopupVisible && <ReportPopup onClose={handleCloseReportPopup} />}
        </div>
    );
};

export default SeaPopup;
