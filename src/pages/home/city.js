import React, { useEffect, useState } from "react";
import DiaryCard from '../../components/diaryCard';
import CityPopup from "../../components/cityPopup";
import GuidePopup from '../../components/guide';
import DiaryFilter from "../../components/diaryFilter";
import '../../assets/css/city.css';
import Menu from "../../components/menu";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import defaultImg from "../../assets/images/default.png"

const City = () => {
    const [diaries, setDiaries] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageGroup, setPageGroup] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true); // Add a loading state
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
                const board_id = 2
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
                console.log(filteredDiaries);

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
                <div className="city-page__container">
                    <div className="city-page__header">
                        <h1 className="city-page__heading">
                            Today's<br />
                            City
                        </h1>
                        <p className="city-page__description">
                            오늘은 분주한 도시 속에서 체계적으로 하루를 계획해보세요. <br /> 바쁜 일정 속에서도 나만의 시간을 찾아 효율적으로 일정을 관리하고, 그 성취감을 기록하세요. <br /> 목표를 이루기 위한 작은 단계들까지 꼼꼼히 기록하며, 스스로의 성장을 확인할 수 있는 기회가 될 것입니다. <br /> 바쁜 하루 속에서도 기록을 통해 내면의 성취를 발견해보세요.

                        </p>
                    </div>
                    <DiaryFilter filter={filter} onFilterChange={handleFilterChange} page="city" />
                    <div className="city-page__diary-cards">
                        {loading && <p>Loading...</p>}
                        {error && <p>{error}</p>}
                        {!loading && !error && diaries.map((diary) => (
                            <DiaryCard
                                key={diary.diary_id}
                                diary_title={diary.diary_title}
                                createdAt={diary.createdAt}
                                diary_content={diary.diary_content}
                                post_photo={(Array.isArray(diary.post_photo) && diary.post_photo.length > 0) ? `${baseURL}/${diary.post_photo}` : defaultImg}
                                board_name={diary.Board.board_name}
                                user_nick={diary.User.user_nick}
                                like_count={diary.like_count}
                                diary_id={diary.diary_id}
                                onClick={() => handleDiaryClick(diary.diary_id)}
                                user_id={user_id}
                            />
                        ))}
                    </div>

                    <div className="city-page__pagination">
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

                    <div className="city-page__tree-background"></div>

                    {selectedDiaryId && (
                        <CityPopup diary_id={selectedDiaryId} onClose={handleClosePopup} />
                    )}
                </div>
            </div>
        </div>
    );
}

export default City;
