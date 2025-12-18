import React, { useEffect, useState, useRef } from 'react';
import '../assets/css/forestPopup.css';
import miniTreeImage from '../assets/images/minitree.png';
import sirenIcon from '../assets/images/siren_forest.png';
import axios from 'axios';
import ReportPopup from './reportPopup';
import { jwtDecode } from 'jwt-decode';
import { Viewer } from '@toast-ui/react-editor';
import defaultImage from '../assets/images/default.png';
import MoonerPopup from '../pages/mypage/follow/moonerPopup';

const ForestPopup = ({ diary_id, onClose }) => {
    const [diary, setDiary] = useState(null);
    const [comments, setComments] = useState([]);
    const [questionData, setQuestionData] = useState(null);
    const [answerData, setAnswerData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newComment, setNewComment] = useState("");
    const [editingcomment_id, setEditingcomment_id] = useState(null);
    const commentRefs = useRef({});
    const [liked, setLiked] = useState(false);
    const [likedCount, setLikedCount] = useState(0);
    const [userProfile, setUserProfile] = useState({ user_nick: '', profile_img: '' });
    const [diaryLoading, setDiaryLoading] = useState(true);
    const [isPopupVisible, setIsPopupVisible] = useState(false);

    const handleProfileClick = () => {
        setIsPopupVisible(true); // 프로필 클릭 시 MoonerPopup을 표시
    };

    const handleClosePopup = () => {
        setIsPopupVisible(false); // 팝업 닫기
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
        if (diaryLoading || !diary || !diary.createdAt) {
            // diary가 없거나 아직 로딩 중일 경우 return
            return;
        }
    
        const fetchTodayQuestion = async () => {
            if (!diary.User?.sign_id) {
                console.error("No sign_id found in diary.");
                return;
            }
    
            try {
                const signId = diary.User?.sign_id;  // 다이어리에서 sign_id를 추출
                const diaryDate = new Date(diary.createdAt).toISOString().split('T')[0];
    
                const response = await axios.get('https://api.usdiary.site/contents/questions/today', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`, // 토큰은 여전히 필요
                    },
                    params: {
                        date: diaryDate,  // 날짜 파라미터로 다이어리 작성 날짜를 보냄
                        sign_id: signId   // 다이어리의 sign_id를 파라미터에 포함시킴
                    }
                });
    
                if (response.data && response.data.data) {
                    setQuestionData(response.data.data.question_text); // 질문 텍스트 설정
                    console.log(response.data.data); // 응답 내용 확인 (디버깅용)
                }
            } catch (error) {
                console.error('Error fetching today’s question:', error.response || error);
                alert('질문을 불러오는 데 실패했습니다.');
            }
        };
    
        fetchTodayQuestion();
    }, [diary, diaryLoading]); // diary가 로딩되면 질문을 가져옴
    
    // 세 번째 useEffect: 다이어리가 로딩된 후 답변을 불러오는 함수
    useEffect(() => {
        if (diaryLoading || !diary || !diary.createdAt) {
            // diary가 없거나 아직 로딩 중일 경우 return
            return;
        }
    
        const fetchAnswerData = async () => {
            if (!diary.diary_id) {
                console.error("No diary_id found in diary.");
                return;
            }
    
            try {
                const diaryId = diary.diary_id;  // 다이어리에서 diary_id를 추출
                const diaryDate = new Date(diary.createdAt).toISOString().split('T')[0];
                console.log("Diary ID:", diaryId);
                console.log("Diary Date:", diaryDate);
    
                // diary_id와 date만을 쿼리 파라미터로 전달
                const response = await axios.get('https://api.usdiary.site/contents/answers', {
                    params: {
                        date: diaryDate, // 날짜 파라미터로 다이어리 작성 날짜를 보냄
                        diary_id: diaryId  // diary_id를 파라미터에 포함시킴
                    }
                });
    
                const data = response.data?.data;
    
                if (data) {
                    setAnswerData({
                        answer_text: data.answer_text,
                        answer_photo: data.answer_photo,
                        question: data.question,  // 필요시 question도 설정
                    });
                    console.log('Answer Data:', data);
                } else {
                    setAnswerData(null); // 데이터가 없을 때 빈 상태로 설정
                    console.log('Answer Data not found');
                }
            } catch (error) {
                if (error.response?.status === 404) {
                    setAnswerData(null); // 답변을 찾을 수 없는 경우 빈 상태로 설정
                    console.error('Answer not found:', error);
                } else {
                    console.error('Error fetching answer data:', error);
                }
            } finally {
                setLoading(false);
            }
        };
    
        fetchAnswerData();
    }, [diary, diaryLoading]);
    
    // Comments data fetch
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

    /* useEffect(() => {
        const fetchLikeData = async () => {
            try {
                const response = await axios.get(`https://api.usdiary.site/diaries/${diary_id}/like`);
                setLiked(response.data.data.liked); // 좋아요 상태 초기화
                setLikedCount(response.data.data.like_count); // 서버에서 받아온 좋아요 개수로 초기화
            } catch (error) {
                console.error('Failed to fetch like data:', error);
            }
        };

        fetchLikeData();
    }, [diary_id]); */

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
                    setError(null);
                    console.log(response.data.message); // 댓글 생성 성공 메시지 로그
                } else {
                    console.error('Unexpected response status:', response.status);
                }
            } catch (err) {
                if (err.response) {
                    if (err.response.status === 419) {
                        setError('Token has expired');
                    } else if (err.response.status === 404) {
                        setError(err.response.data.message);  // 서버에서 보내는 오류 메시지
                    } else {
                        // 서버 오류 메시지가 없을 때 기본 메시지
                        setError('Failed to submit comment');
                    }
                } else {
                    // err.response가 없으면 서버에 접근할 수 없는 경우이므로 네트워크 오류일 수 있음
                    console.error('Network error or unexpected error:', err);
                    setError('Failed to submit comment - Network or unexpected error');
                }
            }

        }
    };

    const [reportPopupVisible, setReportPopupVisible] = useState(false);

    const handleReportButtonClick = () => {
        setReportPopupVisible(true);
    };

    const handleCloseReportPopup = () => {
        setReportPopupVisible(false);
    };

    if (loading) return <div className="diary-popup">Loading...</div>;
    if (error) return <div className="diary-popup">{error}</div>;
    if (diaryLoading) return <div className="diary-popup">Loading...</div>;

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


    const hasComments = comments.length > 0;
    const hasAnswers = answerData && answerData.length > 0;


    const EmptyHeart = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
    );

    const FilledHeart = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#D6E8C0" stroke="#9FC393" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
    );

    return (
        <div>
            <div className="forest-popup" onClick={handleBackgroundClick}>
                <div className="forest-popup__content">
                    <div className='forest-popup__header'>
                        <div className='forest-popup__header-left' onClick={handleProfileClick}>
                            <img
                                src={diary?.User?.Profile?.profile_img || defaultImage}
                                alt={`${diary?.User?.user_nick || 'User'}'s profile`}
                                className="forest-popup__author-profile-image"
                            />
                            <p className="forest-popup__author-nickname">{diary?.User?.user_nick || 'User'}님</p>
                        </div>
                        {isPopupVisible && <MoonerPopup />}
                        <div className="forest-popup__header-right">
                            <button className="forest-popup__report-button" onClick={handleReportButtonClick}>
                                <img src={sirenIcon} alt="Report icon" />
                            </button>
                            <div className="forest-popup__like-button">
                                {liked ? <FilledHeart /> : <EmptyHeart />}

                            </div>
                            <div className="forest-popup__like-count">{likedCount}</div>
                        </div>
                    </div>

                    <div className={`forest-popup__main-content ${!hasAnswers ? 'forest-popup__main-content--centered' : ''}`}>
                        <div className="forest-popup__question-section">
                            <h2 className="forest-popup__question-title">Today's Question</h2>
                            <div className="forest-popup__question-content">
                                <p className="forest-popup__question-text">Q. {questionData}</p>
                                {answerData && (
                                    <div key={answerData.answer_id}>
                                        <p className="forest-popup__answer-text">{answerData.answer_text}</p>
                                        {answerData.answer_photo && (
                                            <div className="forest-popup__check-today-photo-box">
                                                <img src={answerData.answer_photo} alt="Today's Question" />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="forest-popup__diary-section">
                            <div className='forest-popup__title'>
                                <img src={miniTreeImage} alt="" className="forest-popup__mini-tree-image" />
                                <h1 className='forest-popup__forest'>Today's Forest</h1>
                            </div>
                            <div className='forest-popup__title-container'>
                                <p className='forest-popup__diary-title'>{diary?.diary_title}</p>
                                <div className="forest-popup__title-line"></div>
                            </div>
                            <div className="forest-popup__diary-content">
                                <Viewer initialValue={diary?.diary_content || ""} />
                            </div>
                        </div>
                    </div>

                    <div className="forest-popup__comment-input-section">
                        <img src={userProfile.profile_img || defaultImage} alt="User Profile" className="forest-popup__user-profile-image" />
                        <input
                            type="text"
                            value={newComment}
                            onChange={handleCommentChange}
                            placeholder="댓글 달기 ..."
                            className="forest-popup__comment-input"
                        />
                        <button onClick={handleCommentSubmit} className="forest-popup__comment-submit-button">댓글 작성</button>
                    </div>

                    <div className={`forest-popup__comments-section ${!hasComments ? 'forest-popup__comments-section--no-comments' : ''}`}>
                        {hasComments ? (
                            Array.isArray(comments) && comments.map((comment) => (
                                <div key={comment.comment_id} className="forest-popup__comment">
                                    <img
                                        src={comment.User?.Profile?.profile_img || ''}
                                        alt={`${comment.User?.user_nick || 'User'}'s profile`}
                                        className="forest-popup__comment-profile-image"
                                    />
                                    <div className="forest-popup__comment-details">
                                        <p className="forest-popup__comment-nickname">
                                            {comment.User?.user_nick ? `${comment?.User?.user_nick}님` : 'Anonymous'}
                                        </p>
                                        <p
                                            className={`forest-popup__comment-content ${editingcomment_id === comment.comment_id ? 'forest-popup__comment-content--editable' : ''}`}
                                            contentEditable={editingcomment_id === comment.comment_id}
                                            onBlur={() => handleEditBlur(comment.comment_id)}
                                            ref={(el) => commentRefs.current[comment.comment_id] = el}
                                            suppressContentEditableWarning={true}
                                        >
                                            {comment.comment_text}
                                        </p>
                                    </div>
                                    {comment.User?.user_nick === userProfile.user_nick && (
                                        <div className="forest-popup__comment-actions">
                                            {editingcomment_id === comment.comment_id ? (
                                                <button
                                                    className="forest-popup__edit-button"
                                                    onClick={() => handleEditBlur(comment.comment_id)}
                                                >
                                                    저장
                                                </button>
                                            ) : (
                                                <button
                                                    className="forest-popup__edit-button"
                                                    onClick={() => handleEditClick(comment.comment_id)}
                                                >
                                                    수정
                                                </button>
                                            )}
                                            <button
                                                className="forest-popup__delete-button"
                                                onClick={() => handleDeleteClick(comment.comment_id)}
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="forest-popup__no-comments-message">첫 번째 댓글을 남겨보세요!</p>
                        )}

                    </div>
                </div>
            </div>
            {reportPopupVisible && <ReportPopup onClose={handleCloseReportPopup} />}
        </div>
    );
};

export default ForestPopup;
