// DateSelector.js
import React from 'react';
import '../assets/css/dateSelector.css'

const DateSelector = ({ currentDate, selectedDate, onDateClick, theme }) => {
  const getIdForDate = (date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
  
    const todayDateStr = today.toDateString();
    const yesterdayDateStr = yesterday.toDateString();
    const dateStr = new Date(date).toDateString();
  
    if (dateStr === todayDateStr) {
      return 'today';
    } else if (dateStr === yesterdayDateStr) {
      return 'yesterday';
    }
    return ''; // 오늘과 전날이 아니면 빈 문자열 반환
  };

  const getDaysArray = () => {
    const today = new Date(currentDate);
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(today);
      day.setDate(today.getDate() - 3 + i);
      return day;
    });
  };

  return (
    <div className={`${theme}__diary-date-container`}>
      {getDaysArray().map((day, i) => (
        <div
          key={i}
          id={getIdForDate(day)}
          className={`${theme}__diary-date-round ${day.toDateString() === selectedDate.toDateString() ? `${theme}__diary-date-round--today` : ''}`}
          onClick={() => onDateClick(day)}
        >
          {day.getDate()}
        </div>
      ))}
    </div>
  );
};

export default DateSelector;
