import React, { useEffect, useState } from "react";
import DiaryCard from '../../components/diaryCard';
import '../../assets/css/friend.css';
import ForestPopup from "../../components/forestPopup";
import CityPopup from "../../components/cityPopup";
import SeaPopup from "../../components/seaPopup";
import GuidePopup from '../../components/guide';
import DiaryFilter from "../../components/diaryFilter";
import Menu from '../../components/menu';
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import defaultImg from "../../assets/images/default.png"

const Friend = () => {
    const [diaries, setDiaries] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageGroup, setPageGroup] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDiary, setSelectedDiary] = useState(null);
    const [filter, setFilter] = useState('latest');
    const [user_id, setUserId] = useState(null);
    const [sign_id, setSignId] = useState(null);
    const baseURL = 'https://api.usdiary.site';

    const diariesPerPage = 12;
    const pagesPerGroup = 5;

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUserId(decodedToken.user_id);
                setSignId(decodedToken.sign_id);
            } catch (error) {
                console.error('Failed to decode token:', error);
            }
        }
    }, []);

    useEffect(() => {
        if (!user_id) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const followResponse = await axios.get(`${baseURL}/friends/${sign_id}/followings`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (followResponse.status === 404 || followResponse.data.message === 'No following found') {
                    setError('팔로우하는 사용자가 없습니다.');
                    setDiaries([]);  // 일기 리스트 초기화
                    setLoading(false);
                    return;
                }

                const followingUsers = Array.isArray(followResponse.data.data) ? followResponse.data.data : [];
                const followingSignIds = followingUsers.map(user => user.sign_id);
                console.log('Following Users:', followingUsers);

                // 필터에 따라 다르게 요청
                let response;
                if (filter === 'latest') {
                    response = await axios.get(`${baseURL}/diaries`, {
                        params: { page: currentPage, limit: diariesPerPage }
                    });
                } else if (filter === 'topLikes') {
                    response = await axios.get(`${baseURL}/diaries/weekly-likes`, {
                        params: { page: currentPage, limit: diariesPerPage }
                    });
                } else if (filter === 'topViews') {
                    response = await axios.get(`${baseURL}/diaries/weekly-views`, {
                        params: { page: currentPage, limit: diariesPerPage }
                    });
                }

                const { data: { totalDiaries, diary: diariesData } } = response.data;

                // 필터링된 나의 일기 가져오기
                const filteredDiaries = diariesData.filter(diary =>
                    diary.access_level === 1 && (diary.User.sign_id === sign_id || followingSignIds.includes(diary.User.sign_id))
                );

                setDiaries(filteredDiaries);

                const calculatedTotalPages = Math.ceil(totalDiaries / diariesPerPage);
                setTotalPages(Math.ceil(filteredDiaries.length / diariesPerPage));


                if (currentPage > calculatedTotalPages) {
                    setCurrentPage(Math.max(1, calculatedTotalPages));
                }
                
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    setError('팔로우하는 사용자가 없습니다.');
                } else {
                    console.error('Error fetching data:', error);
                    setError('데이터를 불러오는 데 실패했습니다.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentPage, filter, user_id, sign_id]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        const newPageGroup = Math.floor((pageNumber - 1) / pagesPerGroup);
        setPageGroup(newPageGroup);
    };

    const handleNextGroup = () => {
        const nextPageGroup = pageGroup + 1;
        const firstPageOfNextGroup = nextPageGroup * pagesPerGroup + 1;

        if (firstPageOfNextGroup <= totalPages) {
            setPageGroup(nextPageGroup);
            setCurrentPage(firstPageOfNextGroup);
        }
    };

    const handlePrevGroup = () => {
        if (pageGroup > 0) {
            const prevPageGroup = pageGroup - 1;
            const lastPageOfPrevGroup = (prevPageGroup + 1) * pagesPerGroup;
            setPageGroup(prevPageGroup);
            setCurrentPage(Math.min(lastPageOfPrevGroup, totalPages));
        }
    };

    const pageNumbers = Array.from(
        { length: Math.min(pagesPerGroup, totalPages - pageGroup * pagesPerGroup) },
        (_, index) => pageGroup * pagesPerGroup + index + 1
    ).filter(number => number <= totalPages); // totalPages 초과 필터링

    const handleDiaryClick = (diary) => {
        console.log('Diary clicked:', diary);
        setSelectedDiary(diary);
    };

    const handleClosePopup = () => {
        setSelectedDiary(null);
    };

    const handleFilterChange = (newFilter) => {
        // 필터 변경 시 페이지와 그룹을 초기화
        setFilter(newFilter);
        setCurrentPage(1);
        setPageGroup(0);
    };

    return (
        <div className="page">
            <GuidePopup />
            <div className="wrap">
                <Menu />
                <div className="friend-page__container">
                    <div className="friend-page__header">
                        <h1 className="friend-page__heading">
                            Today's<br />
                            Friend
                        </h1>
                        <p className="friend-page__description">
                            무너와 함께 나누는 특별한 하루입니다. <br /> 소중한 무너가 어떤 하루를 보냈는지, 그들의 생각과 감정을 함께 느껴보세요. <br /> 서로의 기록을 공유하며, 새로운 발견과 교감을 나누는 시간이 될 것입니다. <br /> 무너의 이야기를 통해 더 깊이 연결되고, 그들의 하루를 이해하는 특별한 경험을 해보세요.
                        </p>
                    </div>
                    <DiaryFilter filter={filter} onFilterChange={handleFilterChange} page="friend" />
                    <div className="friend-page__diary-cards">
                        {loading && <p>Loading...</p>}
                        {error && <p>{error}</p>}
                        {!loading && !error && diaries.map((diary) => (
                            <DiaryCard
                                key={diary.diary_id}
                                diary_title={diary.diary_title}  // title → diary_title
                                createdAt={diary.createdAt}       // date → createdAt
                                diary_content={diary.diary_content}  // summary → diary_content
                                post_photo={(Array.isArray(diary.post_photo) && diary.post_photo.length > 0) ? `${baseURL}/${diary.post_photo}` : defaultImg}
                                board_name={diary.Board.board_name}     // boardName → board_name
                                user_nick={diary.User.user_nick}        // nickname → user_nick
                                like_count={diary.like_count}
                                diary_id={diary.diary_id}
                                onClick={() => handleDiaryClick(diary)}
                                user_id={user_id}
                            />
                        ))}
                    </div>

                    <div className="friend-page__pagination">
                        <button
                            onClick={handlePrevGroup}
                            disabled={pageGroup === 0}
                            className="pagination-arrow"
                        >
                            &lt;
                        </button>
                        {pageNumbers.map((number) => (
                            <button
                                key={number}
                                onClick={() => handlePageChange(number)}
                                className={number === currentPage ? 'active' : ''}
                            >
                                {number}
                            </button>
                        ))}
                        <button
                            onClick={handleNextGroup}
                            disabled={pageGroup * pagesPerGroup + pagesPerGroup >= totalPages}
                            className="pagination-arrow"
                        >
                            &gt;
                        </button>
                    </div>

                    <div className="friend-page__tree-background"></div>

                    {selectedDiary && (
                        selectedDiary.Board.board_name === '숲' ? (
                            <ForestPopup diary_id={selectedDiary.diary_id} onClose={handleClosePopup} />
                        ) : selectedDiary.Board.board_name === '도시' ? (
                            <CityPopup diary_id={selectedDiary.diary_id} onClose={handleClosePopup} />
                        ) : selectedDiary.Board.board_name === '바다' ? (
                            <SeaPopup diary_id={selectedDiary.diary_id} onClose={handleClosePopup} />
                        ) : null
                    )}

                </div>
            </div>
        </div>
    );
}

export default Friend;
