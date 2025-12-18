import React from 'react';

const DiaryFilter = ({ filter, onFilterChange, page }) => {
    // 페이지별 색상 테마 정의
    const pageColors = {
        forest: '#7E9660',  // Forest 색상
        city: '#828282',    // City 색상
        friend: '#75388B',  // Friend 색상
        sea: '#164BB0'      // Sea 색상
    };

    // 해당 페이지의 색상을 가져오기
    const activeColor = pageColors[page] || '#9FC393';  // 기본값은 Forest 색상

    return (
        <div className="forest-page__filter-box">
            <div
                className={`forest-page__filter-option ${filter === 'latest' ? 'active' : ''}`}
                onClick={() => onFilterChange('latest')}
                style={filter === 'latest' ? { backgroundColor: activeColor, color: 'white' } : {}}
            >
                Latest
            </div>
            <div
                className={`forest-page__filter-option ${filter === 'topViews' ? 'active' : ''}`}
                onClick={() => onFilterChange('topViews')}
                style={filter === 'topViews' ? { backgroundColor: activeColor, color: 'white' } : {}}
            >
                Top Views
            </div>
            <div
                className={`forest-page__filter-option ${filter === 'topLikes' ? 'active' : ''}`}
                onClick={() => onFilterChange('topLikes')}
                style={filter === 'topLikes' ? { backgroundColor: activeColor, color: 'white' } : {}}
            >
                Top Likes
            </div>
        </div>
    );
};

export default DiaryFilter;
