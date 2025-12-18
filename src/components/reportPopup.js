import React, { useState } from 'react';
import '../assets/css/reportPopup.css';

const ReportPopup = ({ onClose }) => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [customReport, setCustomReport] = useState("");

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
    };

    const handleInputChange = (e) => {
        setCustomReport(e.target.value);
    };


    return (
        <div className="report-popup" onClick={onClose}>
            <div className="report-popup__content" onClick={(e) => e.stopPropagation()}>
                <h2>신고하기</h2>
                <div className="report-popup__buttons">
                    <button
                        className={`report-popup__category-button ${selectedCategory === 'spam' ? 'selected' : ''}`}
                        onClick={() => handleCategoryClick('spam')}
                    >
                        스팸
                    </button>
                    <button
                        className={`report-popup__category-button ${selectedCategory === 'adult' ? 'selected' : ''}`}
                        onClick={() => handleCategoryClick('adult')}
                    >
                        나체 및 음란물
                    </button>
                    <button
                        className={`report-popup__category-button ${selectedCategory === 'violence' ? 'selected' : ''}`}
                        onClick={() => handleCategoryClick('violence')}
                    >
                        폭력적인 내용
                    </button>
                    <button
                        className={`report-popup__category-button ${selectedCategory === 'guns' ? 'selected' : ''}`}
                        onClick={() => handleCategoryClick('guns')}
                    >
                        총기류 / 마약 판매 및 홍보
                    </button>
                    <button
                        className={`report-popup__category-button ${selectedCategory === 'impersonation' ? 'selected' : ''}`}
                        onClick={() => handleCategoryClick('impersonation')}
                    >
                        사칭 계정
                    </button>
                    <button
                        className={`report-popup__category-button ${selectedCategory === 'other' ? 'selected' : ''}`}
                        onClick={() => handleCategoryClick('other')}
                    >
                        기타
                    </button>
                    {selectedCategory === 'other' && (
                        <input
                            type="text"
                            className="report-popup__custom-input"
                            placeholder="기타 사유를 입력하세요..."
                            value={customReport}
                            onChange={handleInputChange}
                        />
                    )}
                </div>
                <div className="report-popup__actions">
                    <button className="report-popup__submit-button">제출</button>
                    <button className="report-popup__cancel-button" onClick={onClose}>취소</button>
                </div>
            </div>
        </div>
    );
};

export default ReportPopup;
