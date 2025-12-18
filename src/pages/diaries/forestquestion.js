import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

import TodayQuestionPopup from "./todayQuestionPopup";

import '../../assets/css/forestquestion.css';

const ForestQuestion = ({ onBack }) => {
  const location = useLocation();
  const { diary } = location.state || {};

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showTodayQuestionPopup, setShowTodayQuestionPopup] = useState(false);
  const [todayQuestionContent, setTodayQuestionContent] = useState('');
  const [todayQuestion, setTodayQuestion] = useState('Question');
  const [question_id, setQuestionId] = useState(null);
  const [initialAnswer, setInitialAnswer] = useState('');
  const [initialPhoto, setInitialPhoto] = useState(null);
  const editorRef = useRef();

  const fetchAnswerByDate = async (date) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("No token found in localStorage.");
      return;
    }

    try {
      // JWT 토큰 디코딩
      const decodedToken = jwtDecode(token);
      const signId = decodedToken.sign_id; // sign_id 추출

      const response = await axios.get('https://api.usdiary.site/contents/myanswers', {
        params: { date, sign_id: signId },  // sign_id를 포함하여 요청
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const answerData = response.data.data || {};
      setInitialAnswer(answerData.answer_text || '');
      setInitialPhoto(answerData.answer_photo || null);
    } catch (error) {
      console.error('Error fetching answer by date:', error);
      alert('답변을 조회하는 데 실패했습니다.');
    }
  };

  useEffect(() => {
    const formattedDate = new Date(selectedDate.getTime() + 9 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]; // 한국 시간 (UTC+9)으로 변환하여 날짜 포맷
    fetchAnswerByDate(formattedDate);
  }, [selectedDate]);

  useEffect(() => {
    const fetchTodayQuestion = async () => {
      try {
        const formattedDate = new Date(new Date().getTime() + 9 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0]; // 한국 시간 (UTC+9)으로 변환하여 날짜 포맷

        const response = await axios.get('https://api.usdiary.site/contents/questions/today', {
          params: { date: formattedDate }
        });

        const questionData = response.data.data || {};
        setTodayQuestion(questionData.question_text || '');
        setQuestionId(questionData.question_id || null);
      } catch (error) {
        console.error('Error fetching today’s question:', error);
        alert('질문을 불러오는 데 실패했습니다.');
      }
    };
    fetchTodayQuestion();
  }, []);

  const handleDeleteAnswer = async () => {
    try {
      await axios.delete(`https://api.usdiary.site/contents/answers`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        params: { date: selectedDate.toISOString().split('T')[0] }
      });
      // 삭제 후 답변을 비우고 상태를 업데이트
      setInitialAnswer('');
      setInitialPhoto(null);
    } catch (error) {
      // 삭제 실패 시 아무것도 하지 않음
      console.error('Error deleting the answer:', error);
    }
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.getInstance().setHTML('');
    }
  }, []);

  useEffect(() => {
    const savedAnswer = localStorage.getItem('todayAnswer');

    // savedAnswer가 존재하는지 확인
    const answerToShow = savedAnswer || (initialAnswer ? initialAnswer : '답변이 없습니다.');

    setTodayQuestionContent(
      `<div class="today-question-text">${todayQuestion}</div><div class="today-answer-text">${answerToShow}</div>`
    );
  }, [showTodayQuestionPopup, todayQuestion, initialAnswer]);


  useEffect(() => {
    if (showTodayQuestionPopup) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showTodayQuestionPopup]);

  const handleTodayQuestionPopupClose = () => {
    setShowTodayQuestionPopup(false);
    fetchAnswerByDate(selectedDate.toISOString().split('T')[0]);
  };

  const handleTodayQuestionButtonClick = () => {
    setShowTodayQuestionPopup(true);
  };

  return (
    <div>
      <div className="forest__forestquestion">
        <div className="forest_back-button" onClick={onBack}>&lt;&lt;&nbsp;&nbsp;Hide</div>
        <div className="forest__forestquestion__check">
          <div className="forest__forestquestion__check-title">
            <div className="forest__forestquestion__check-title-name">Today's Question</div>
            <div
              className={`forest__forestquestion__check-title-plusbtn ${diary ? 'disabled' : ''}`}
              onClick={!diary ? handleTodayQuestionButtonClick : undefined} // diary가 없을 때만 클릭 이벤트 활성화
            >
              +
            </div>
          </div>
          <div className="forest__forestquestion__check-today-question">
            <div className="today-question-box">
              <div className="today-question-content" dangerouslySetInnerHTML={{ __html: todayQuestionContent }}></div>
              {initialPhoto && (
                <div className="forest__forestquestion__check-today-photo-box">
                  <img src={initialPhoto} alt="answer" className="forest__forestquestion__check-today-photo" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showTodayQuestionPopup && (
        <TodayQuestionPopup
          question={todayQuestion}
          question_id={question_id}
          initialAnswer={initialAnswer}
          initialPhoto={initialPhoto}
          onClose={handleTodayQuestionPopupClose}
          onDelete={handleDeleteAnswer}
        />
      )}
    </div>
  );
};

export default ForestQuestion;
