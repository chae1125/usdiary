import React, { useState, useEffect } from 'react';
import '../assets/css/guide.css';
import guide1 from '../../src/assets/images/guide1.png';
import guide2 from '../../src/assets/images/guide2.png';
import guide3 from '../../src/assets/images/guide3.png';

const GuidePopup = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isOpen, setIsOpen] = useState(false); 
    const images = [guide1, guide2, guide3];

    useEffect(() => {
        // 로컬 스토리지에서 'guide_closed' 상태 확인
        const isGuideClosed = localStorage.getItem('guide_closed');
        if (!isGuideClosed) {
            setIsOpen(true);
        }
    }, []);

    const handleNext = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    const handlePrev = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    };

    const handleClose = () => {
        setIsOpen(false);
        // 팝업이 닫히면 로컬 스토리지에 '닫힘' 상태 저장
        localStorage.setItem('guide_closed', 'true');
    };

    if (!isOpen) return null;

    return (
        <div className="guide-popup">
            <div className="guide-popup__content">
                <button className="guide-popup__close" onClick={handleClose}>X</button>
                <img src={images[currentImageIndex]} alt={`Guide ${currentImageIndex + 1}`} className="guide-popup__image" />
                <div className="guide-popup__controls">
                    <button onClick={handlePrev} disabled={currentImageIndex === 0}>이전</button>
                    <button onClick={handleNext} disabled={currentImageIndex === images.length - 1}>다음</button>
                </div>
            </div>
        </div>
    );
};

export default GuidePopup;
