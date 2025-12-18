import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import '../../assets/css/forestquestion.css';
import { jwtDecode } from 'jwt-decode';

const TodayQuestionPopup = ({ onClose, question_id, initialAnswer, initialPhoto, onDelete }) => {
  const [question, setQuestion] = useState(null);
  const [answer_text, setAnswer] = useState(initialAnswer || '');  // 변경된 변수
  const [answer_photo, setPhoto] = useState(initialPhoto || null);  // 변경된 변수
  const fileInputRef = useRef(null);
  const [answer_id, setAnswerId] = useState(null);
  const [signId, setSignId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const decodedToken = jwtDecode(token);
            setSignId(decodedToken.sign_id);
        } catch (error) {
            console.error('Failed to decode token:', error);
        }
    }
}, []);

  useEffect(() => {
    const fetchTodayQuestion = async () => {
      try {
        const response = await axios.get('https://api.usdiary.site/contents/questions/today', {
          params: { date: new Date().toISOString().split('T')[0] }  // Format as YYYY-MM-DD
        });
        setQuestion(response.data.data.question_text);
      } catch (error) {
        console.error('Error fetching today’s question:', error);
        alert('질문을 불러오는 데 실패했습니다.');
      }
    };
    fetchTodayQuestion();


  }, []);

  const handleAnswerChange = (event) => {
    setAnswer(event.target.value);
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const fetchTodayAnswer = async () => {
      if (!signId) return; // sign_id가 없으면 API 요청을 하지 않음

      try {
        // 오늘 날짜를 YYYY-MM-DD 형식으로 설정
        const todayDate = new Date().toISOString().split('T')[0];
        
        // 특정 날짜의 답변을 조회하는 GET 요청
        const response = await axios.get('https://api.usdiary.site/contents/myanswers', {
          params: { date: todayDate, sign_id: signId }, // sign_id 추가
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        // 조회된 답변 데이터를 상태로 설정
        const { answer_id, answer_text } = response.data.data;
        setAnswerId(answer_id);
        setAnswer(answer_text);
        
        console.log("Fetched Answer ID:", answer_id);
        console.log("Fetched Answer Text:", answer_text);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.error('답변을 찾을 수 없습니다.');
        } else {
          console.error('답변 조회 중 오류가 발생했습니다:', error);
        }
      }
    };

    fetchTodayAnswer();
  }, [signId]);


  const handleSave = async () => {
    try {
      const date = new Date().toISOString().split('T')[0];

      const payload = {
        answer_text,  // 답변 텍스트
        date,  // 날짜
        sign_id: signId 
      };

      if (answer_id) {
        // 답변이 이미 존재하면 PATCH 요청을 통해 수정
        const response = await axios.patch(`https://api.usdiary.site/contents/answers/${answer_id}`, payload, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        alert('답변이 성공적으로 수정되었습니다.');
      } else {
        // 답변이 존재하지 않으면 POST 요청을 통해 새로 생성
        const response = await axios.post('https://api.usdiary.site/contents/answers', payload, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        alert('답변이 성공적으로 저장되었습니다.');
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving the answer:', error);
      if (error.response) {
        if (error.response.status === 400) {
          alert('요청 데이터 형식이 잘못되었습니다. 답변 텍스트와 날짜를 확인해 주세요.');
        } else if (error.response.status === 404) {
          alert('수정할 답변을 찾을 수 없습니다.');
        } else if (error.response.status === 419) {
          alert('세션이 만료되었거나 권한이 없습니다. 다시 로그인해주세요.');
        } else if (error.response.status === 500) {
          alert('서버 오류로 인해 답변 저장에 실패했습니다.');
        } else {
          alert('답변 저장에 실패했습니다.');
        }
      } else {
        alert('네트워크 오류가 발생했습니다.');
      }
    }
  };


  const handleDelete = async () => {
    try {
      await axios.delete(`https://api.usdiary.site/contents/answers/${answer_id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      alert('답변이 성공적으로 삭제되었습니다.');
      setAnswer(''); // 답변 텍스트를 초기화하여 삭제된 상태를 반영
      setAnswerId(null); // answer_id 초기화
      setPhoto(null); // 사진 초기화
      onClose();
      onDelete();
    } catch (error) {
      console.error('Error deleting the answer:', error);
      if (error.response && error.response.status === 404) {
        alert('삭제할 답변을 찾을 수 없습니다.');
      } else {
        alert('답변 삭제에 실패했습니다.');
      }
    }
  };
  

  return (
    <div className="forestquestion_popup-overlay">
      <div className="forestquestion_popup-background">
        <div className="forestquestion_popup-content">
          <div className="forestquestion_popup-header">
            <h2>Today's Question</h2>
            <button className="forestquestion_popup-close" onClick={onClose}>X</button>
          </div>
          <div className="forestquestion_popup-question-box">
            <div className="forestquestion_popup-question-text">{question || "Loading..."}</div>
            <textarea
              className="forestquestion_popup-answer-box"
              value={answer_text}
              onChange={handleAnswerChange}
            />
            <p className="forestquestion_popup-photo-input">&nbsp;</p>
            {/* 
            <input
              type="file"
              className="forestquestion_popup-photo-input"
              accept="image/*"
              onChange={handlePhotoChange}
              ref={fileInputRef}
            />  */}
            {answer_photo && <img src={answer_photo} className="forestquestion_popup-photo-display" alt="selected" />}
            <button className="forestquestion_popup-save-button" onClick={handleSave}>저장</button>
            <button className="forestquestion_popup-delete-button" onClick={handleDelete}>삭제</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodayQuestionPopup;
