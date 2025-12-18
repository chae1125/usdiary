import React, { useEffect, useState } from "react";
import DiaryCard from '../../components/diaryCard';
import ForestPopup from "../../components/forestPopup";
import GuidePopup from '../../components/guide';
import DiaryFilter from "../../components/diaryFilter";
import '../../assets/css/forest.css';
import Menu from "../../components/menu";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import defaultImg from "../../assets/images/default.png"

const Forest = () => {
    const [diaries, setDiaries] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageGroup, setPageGroup] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false); // Add a loading state
    const [error, setError] = useState(null); // Add an error state
    const [selectedDiaryId, setSelectedDiaryId] = useState(null);
    const [filter, setFilter] = useState('latest');
    const [user_id, setUserId] = useState(null);
    const baseURL = 'https://api.usdiary.site';

    const diariesPerPage = 12;
    const pagesPerGroup = 5;

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUserId(decodedToken.user_id);
            } catch (error) {
                console.error('Failed to decode token:', error);
            }
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const board_id = 1; // 필터링할 게시판 ID
                let response;

                if (filter === 'latest') {
                    response = await axios.get(`${baseURL}/diaries`, {
                        params: { page: currentPage, limit: diariesPerPage, board_id }
                    });
                } else if (filter === 'topLikes') {
                    response = await axios.get(`${baseURL}/diaries/weekly-likes`, {
                        params: { page: currentPage, limit: diariesPerPage, board_id }
                    });
                } else if (filter === 'topViews') {
                    response = await axios.get(`${baseURL}/diaries/weekly-views`, {
                        params: { page: currentPage, limit: diariesPerPage, board_id }
                    });
                }

                const { data: { totalDiaries, diary: diariesData } } = response.data;

                const filteredDiaries = (diariesData || []).filter(diary => diary.access_level === 0);

                setDiaries(filteredDiaries);

                const calculatedTotalPages = Math.ceil(totalDiaries / diariesPerPage);
                setTotalPages(calculatedTotalPages || 1);

                if (currentPage > calculatedTotalPages) {
                    setCurrentPage(calculatedTotalPages);
                }

            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentPage, filter]);

    // 페이지네이션 조정 로직
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

    // 페이지 그룹 생성
    const pageNumbers = Array.from(
        { length: Math.min(pagesPerGroup, totalPages - pageGroup * pagesPerGroup) },
        (_, index) => pageGroup * pagesPerGroup + index + 1
    ).filter(number => number <= totalPages); // totalPages 초과 필터링



    const handleDiaryClick = (diary_id) => {
        setSelectedDiaryId(diary_id);
    };

    const handleClosePopup = () => {
        setSelectedDiaryId(null);
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
                <div className="forest-page__container">
                    <div className="forest-page__header">
                        <h1 className="forest-page__heading">
                            Today's<br />
                            Forest
                        </h1>
                        <p className="forest-page__description">
                            오늘은 숲속에서 느림의 미학을 만끽해보세요. <br /> 작은 것에서부터 큰 깨달음을 찾고, 하루 속에서 숨어 있는 의미를 발견할 수 있는 시간이 될 거예요. <br /> 자연의 소리를 들으며 마음의 여유를 되찾고, 하루를 차분히 기록해보세요. <br /> 여유로운 순간들이 모여, 나만의 이야기를 숲속에 채워넣을 수 있을 것입니다.
                        </p>
                    </div>
                    <DiaryFilter filter={filter} onFilterChange={handleFilterChange} page="forest" />
                    <div className="forest-page__diary-cards">
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
                                onClick={() => handleDiaryClick(diary.diary_id)}
                                user_id={user_id}
                            />
                        ))}
                    </div>

                    <div className="forest-page__pagination">
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

                    <div className="forest-page__tree-background"></div>

                    {selectedDiaryId && (
                        <ForestPopup diary_id={selectedDiaryId} onClose={handleClosePopup} />
                    )}
                </div>
            </div>
        </div>
    );
}

export default Forest;
