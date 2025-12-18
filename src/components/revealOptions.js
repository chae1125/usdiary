// RevealOptions.js
import React from 'react';
import '../assets/css/diaries_sea.css'; // 스타일 파일 경로 조정 필요

const RevealOptions = ({ selectedDiv, onDivClick }) => {
  return (
    <div className="sea__diary-another-reveal">
      {['all', 'subscribe', 'only'].map((className, index) => (
        <div
          key={index}
          className={`sea__diary-another-reveal-btn sea__diary-another-reveal-btn--${className} ${selectedDiv === index ? 'sea__diary-another-reveal-btn--selected' : ''}`}
          onClick={() => onDivClick(index)}
        >
          {className}
        </div>
      ))}
    </div>
  );
};

export default RevealOptions;
