import React, { useEffect, useState, useRef } from 'react';
import '../assets/css/cityPopup.css';
import miniCityImage from '../assets/images/minicity.png'
import sirenIcon from '../assets/images/siren_city.png';
import axios from 'axios';
import ReportPopup from './reportPopup';
import { jwtDecode } from 'jwt-decode';
import { Viewer } from '@toast-ui/react-editor';
import defaultImage from '../assets/images/default.png';

const CityPopup = ({ diary_id, onClose }) => {
    const [diary, setDiary] = useState(null);
    const [comments, setComments] = useState([]);
    const [todos, setTodos] = useState([]);
    const [routines, setRoutines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newComment, setNewComment] = useState(""); // 새 댓글 상태
    const [editingcomment_id, setEditingcomment_id] = useState(null);
    const commentRefs = useRef({});
    const [liked, setLiked] = useState(false);
    const [userProfile, setUserProfile] = useState({
        profile_img: '',
        user_nick: ''
    });
    const [diaryLoading, setDiaryLoading] = useState(true);

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
        const fetchTodoData = async () => {
            const token = localStorage.getItem('token');
            
            // 오늘 날짜를 기본값으로 설정 (한국 시간 기준)
            const today = new Date(new Date().getTime() + 9 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0]; // YYYY-MM-DD 형식으로 변환
            
            // 날짜가 주어지지 않으면 오늘 날짜를 기본값으로 사용
            const queryDate = diary_id ? today : diary_id;
    
            try {
                const response = await axios.get('https://api.usdiary.site/contents/todos', {
                    params: { date: queryDate },  // date 파라미터 추가
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
    
                const data = response.data?.data || []; // 데이터가 없으면 빈 배열 처리
                setTodos(data);  // 루틴 데이터 설정
                console.log('Todo Data:', data);
            } catch (error) {
                const message = error.code === 'ECONNABORTED'
                    ? '서버 응답이 지연되었습니다. 잠시 후 다시 시도해주세요.'
                    : (error.response?.status === 404
                        ? '루틴을 찾을 수 없습니다.'
                        : '루틴 데이터를 불러오는 데 실패했습니다.');
                setError(message);
                console.error('Error fetching routine:', error.response?.data || error.message);
            } finally {
                setLoading(false);
            }
        };
    
        fetchTodoData();
    }, [diary_id]);
    
    
    useEffect(() => {
        const fetchRoutineData = async () => {
            const token = localStorage.getItem('token');
            
            // 오늘 날짜를 기본값으로 설정 (한국 시간 기준)
            const today = new Date(new Date().getTime() + 9 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0]; // YYYY-MM-DD 형식으로 변환
            
            // 날짜가 주어지지 않으면 오늘 날짜를 기본값으로 사용
            const queryDate = diary_id ? today : diary_id;
    
            try {
                const response = await axios.get('https://api.usdiary.site/contents/routines', {
                    params: { date: queryDate },  // date 파라미터 추가
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
    
                const data = response.data?.data || []; // 데이터가 없으면 빈 배열 처리
                setRoutines(data);  // 루틴 데이터 설정
                console.log('Routine Data:', data);
            } catch (error) {
                const message = error.code === 'ECONNABORTED'
                    ? '서버 응답이 지연되었습니다. 잠시 후 다시 시도해주세요.'
                    : (error.response?.status === 404
                        ? '루틴을 찾을 수 없습니다.'
                        : '루틴 데이터를 불러오는 데 실패했습니다.');
                setError(message);
                console.error('Error fetching routine:', error.response?.data || error.message);
            } finally {
                setLoading(false);
            }
        };
    
        fetchRoutineData();
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

    /* useEffect(() => {
        // Fetch initial liked status
        const fetchLikeStatus = async () => {
            try {
                const response = await axios.get(`/diaries/${diary_id}/like`);
                setLiked(response.data.liked);
            } catch (error) {
                console.error('Failed to fetch like status', error);
            }
        };
        fetchLikeStatus();
    }, [diary_id]); */

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

    const hasComments = comments.length > 0;

    const hasTodos = todos.length > 0;
    const hasRoutines = routines.length > 0;

    const showChecklistSection = hasTodos || hasRoutines;

    /*
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
    }; */


    const EmptyHeart = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9EA3AB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
    );

    const FilledHeart = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#D8D8D8" stroke="#9EA3AB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
    );

    return (
        <div>
            <div className="city-popup" onClick={handleBackgroundClick}>
                <div className="city-popup__content">
                    <div className='city-popup__header'>
                        <div className='city-popup__header-left'>
                            <img src={diary?.User?.Profile?.profile_img || defaultImage} alt={`${diary?.User?.user_nick || 'User'}'s profile`} className="city-popup__author-profile-image" />
                            <p className="city-popup__author-nickname">{diary?.User?.user_nick || 'User'}님</p>
                        </div>
                        <div className="city-popup__header-right">
                            <button className="city-popup__report-button" onClick={handleReportButtonClick}>
                                <img src={sirenIcon} alt="Report" />
                            </button>
                            <span className="city-popup__like-button">
                                {liked ? <FilledHeart /> : <EmptyHeart />}
                            </span>
                        </div>
                    </div>

                    <div className={`city-popup__main-content ${!(hasRoutines || hasTodos) ? 'city-popup__main-content--centered' : ''}`}>
                        {showChecklistSection && (
                            <div className='city-popup__checklist-section'>
                                <h2 className="city-popup__checklist-title">Today's Checklist</h2>
                                <div className="city-popup__checklist__check-routine">
                                    <div className="city-popup__checklist__check-routine-top">
                                        <div className="checklist-routine-top-circle"></div>
                                        <div className="checklist-routine-top-name">Routine</div>
                                        <div className="checklist-routine-top-num">{routines?.length}</div>
                                    </div>
                                    <hr />
                                    <div className="city-popup__checklist__check-routine-bottom">
                                        {routines.map((routine, index) => (
                                            <div className="checklist-routine-bottom-box" key={routine.routine_id}>
                                                <div className="checklist-routine-bottom-box-toggleSwitch">
                                                    <input
                                                        type="checkbox"
                                                        id={`routine-toggle-${index}`}
                                                        hidden
                                                        checked={routine.is_completed}
                                                        readOnly // 읽기 전용으로 설정
                                                    />
                                                    <label htmlFor={`routine-toggle-${index}`}>
                                                        <span></span>
                                                    </label>
                                                </div>
                                                <div className="checklist-routine-bottom-box-title">{routine.routine_title}</div>
                                                <div className="checklist-routine-bottom-box-content">{routine.description}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="city-popup__checklist__check-todo">
                                    <div className="city-popup__checklist__check-todo-top">
                                        <div className="checklist-todo-top-circle"></div>
                                        <div className="checklist-todo-top-name">To Do</div>
                                        <div className="checklist-todo-top-num">{todos?.length}</div>
                                    </div>
                                    <hr />
                                    <div className="city-popup__checklist__check-todo-bottom">
                                        {todos.map((todo, index) => (
                                            <div className="checklist-todo-bottom-box" key={todo.todo_id}>
                                                <div className="checklist-todo-bottom-box-toggleSwitch">
                                                    <input
                                                        type="checkbox"
                                                        id={`todo-toggle-${index}`}
                                                        hidden
                                                        checked={todo.is_completed}
                                                        readOnly // 읽기 전용으로 설정
                                                    />
                                                    <label htmlFor={`todo-toggle-${index}`}>
                                                        <span></span>
                                                    </label>
                                                </div>
                                                <div className="checklist-todo-bottom-box-title">{todo.todo_title}</div>
                                                <div className="checklist-todo-bottom-box-content">{todo.description}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="city-popup__diary-section">
                            <div className='city-popup__title'>
                                <img src={miniCityImage} alt="Mini city" className="city-popup__mini-city-image" />
                                <h1 className='city-popup__city'>Today's City</h1>
                            </div>
                            <div className='city-popup__title-container'>
                                <p className='city-popup__diary-title'>{diary?.diary_title}</p>
                                <div className="city-popup__title-line"></div>
                            </div>
                            <div className="city-popup__diary-content">
                                <Viewer initialValue={diary?.diary_content || ""} />
                            </div>
                        </div>
                    </div>

                    <div className="city-popup__comment-input-section">
                        <img src={userProfile.profile_img || defaultImage} alt="User Profile" className="city-popup__user-profile-image" />
                        <input
                            type="text"
                            value={newComment}
                            onChange={handleCommentChange}
                            placeholder="댓글 달기 ..."
                            className="city-popup__comment-input"
                        />
                        <button onClick={handleCommentSubmit} className="city-popup__comment-submit-button">댓글 작성</button>
                    </div>

                    <div className={`city-popup__comments-section ${!hasComments ? 'city-popup__comments-section--no-comments' : ''}`}>
                        {hasComments ? (
                            Array.isArray(comments) && comments.map((comment) => (
                                <div key={comment.comment_id} className="city-popup__comment">
                                    <img
                                        src={comment.User?.Profile?.profile_img || ''}
                                        alt={`${comment.User?.user_nick || 'User'}'s profile`}
                                        className="city-popup__comment-profile-image"
                                    />
                                    <div className="city-popup__comment-details">
                                        <p className="city-popup__comment-nickname">
                                            {comment.User?.user_nick ? `${comment?.User?.user_nick}님` : 'Anonymous'}
                                        </p>
                                        <p
                                            className={`city-popup__comment-content ${editingcomment_id === comment.comment_id ? 'city-popup__comment-content--editable' : ''}`}
                                            contentEditable={editingcomment_id === comment.comment_id}
                                            onBlur={() => handleEditBlur(comment.comment_id)}
                                            ref={(el) => commentRefs.current[comment.comment_id] = el}
                                            suppressContentEditableWarning={true}
                                        >
                                            {comment.comment_text}
                                        </p>
                                    </div>
                                    {comment.User?.user_nick === userProfile.user_nick && (
                                        <div className="city-popup__comment-actions">
                                            {editingcomment_id === comment.comment_id ? (
                                                <button
                                                    className="city-popup__edit-button"
                                                    onClick={() => setEditingcomment_id(null)}
                                                >
                                                    저장
                                                </button>
                                            ) : (
                                                <button
                                                    className="city-popup__edit-button"
                                                    onClick={() => handleEditClick(comment.comment_id)}
                                                >
                                                    수정
                                                </button>
                                            )}
                                            <button
                                                className="city-popup__delete-button"
                                                onClick={() => handleDeleteClick(comment.comment_id)}
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="city-popup__no-comments-message">첫 번째 댓글을 남겨보세요!</p>
                        )}
                    </div>
                </div>
            </div>
            {reportPopupVisible && <ReportPopup onClose={handleCloseReportPopup} />}
        </div>
    );

};

export default CityPopup;
