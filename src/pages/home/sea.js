import React, { useEffect, useState } from "react";
import DiaryCard from '../../components/diaryCard';
import GuidePopup from '../../components/guide';
import SeaPopup from "../../components/seaPopup";
import DiaryFilter from "../../components/diaryFilter";
import '../../assets/css/sea.css'; // Ensure this CSS file is correctly named and located.
import Menu from "../../components/menu";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import defaultImg from "../../assets/images/default.png"

const Sea = () => {
    const [diaries, setDiaries] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageGroup, setPageGroup] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
            try {
                setLoading(true);
                const board_id = 3
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
    ).filter(number => number <= totalPages);

    const handleDiaryClick = (diary_id) => {
        setSelectedDiaryId(diary_id); // 클릭한 다이어리 ID를 설정
    };

    const handleClosePopup = () => {
        setSelectedDiaryId(null); // 팝업 닫기
    };

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter); // 선택한 필터로 상태 업데이트
        setCurrentPage(1); // 페이지를 1로 초기화
        setPageGroup(0); // 페이지 그룹 초기화
    };

    return (
        <div className="page">
            <GuidePopup />
            <div className="wrap">
                <Menu />
                <div className="sea-page__container">
                    <div className="sea-page__header">
                        <h1 className="sea-page__heading">
                            Today's<br />
                            Sea
                        </h1>
                        <p className="sea-page__description">
                            오늘은 바다처럼 넓고 깊은 특별한 날을 기록하는 시간입니다. <br /> 바다가 주는 잔잔한 파도처럼, 마음을 차분히 가라앉히며 그날의 특별한 순간을 담아보세요.  <br /> 소중한 추억과 잊지 못할 경험들을 기록하며, 감정이 고스란히 남아 영원히 간직될 수 있는 시간을 만들어보세요. <br /> 바다는 인생의 특별한 날들을 아름답게 보존할 수 있는 공간이 될 것입니다.
                        </p>
                    </div>
                    <DiaryFilter filter={filter} onFilterChange={handleFilterChange} page="sea" />
                    <div className="sea-page__diary-cards">
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

                    <div className="sea-page__pagination">
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

                    <div className="sea-page__tree-background"></div>

                    {selectedDiaryId && (
                        <SeaPopup diary_id={selectedDiaryId} onClose={handleClosePopup} />
                    )}
                </div>
            </div>
        </div>
    );
}

export default Sea;