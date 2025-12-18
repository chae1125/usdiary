import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../assets/css/questions.css';
import Menu from '../../components/menu';

const questions = [
  {
    question: "Q1. 자기 계발을 위해 어떤 방법을 더 선호하시나요?",
    answers: ["스스로에게 질문을 던지고, 그에 대한 답을 찾아가는 과정을 즐긴다", "구체적인 목표와 체크리스트를 세워 체계적으로 자기 계발을 한다"],
  },
  {
    question: "Q2. 새로운 아이디어가 떠오를 때 어떻게 하시나요?",
    answers: ["자유롭게 생각을 확장시키고, 다양한 가능성을 탐구한다", "아이디어를 구체적인 계획으로 정리하고, 실행 가능한 목록을 작성한다"],
  },
  {
    question: "Q3. 하루를 기록하는 방법 중에 더 선호하는 방법은 무엇인가요?",
    answers: ["하루를 돌아볼 수 있는 간단한 질문에 대한 답으로 기록하고 싶다", "하루에 한 일을 리스트로 정리하며 기록하고 싶다"],
  },
  {
    question: "Q4. 어떤 사람들의 하루가 더 흥미롭게 느껴지나요?",
    answers: ["하루를 자유롭게 보내며 다양한 경험을 하는 사람들", "계획적이고 체계적으로 목표를 이루어가는 사람들"],
  },
  {
    question: "Q5. 그리는 미래에 선호하는 거주 공간은 어디인가요?",
    answers: ["여유로운 하루를 보낼 수 있는 숲 속", "모두가 바쁘게 살아가는 도시의 중심지"],
  },
];

const Question = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([null, null]);
  const [forestCount, setForestCount] = useState(0);
  const [cityCount, setCityCount] = useState(0);
  const navigate = useNavigate();

  // 쿼리 파라미터에서 JWT 토큰을 추출하여 로컬 스토리지에 저장하는 로직
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      // 토큰을 로컬 스토리지에 저장
      localStorage.setItem('token', token);
      // 쿼리 파라미터를 제거한 후 질문 페이지로 리다이렉트
      navigate('/question', { replace: true });
    }
  }, [navigate]);

  const handleAnswer = (answerIndex) => {
    setSelectedAnswers((prevSelected) => {
      const newSelected = [...prevSelected];
      newSelected[currentQuestion] = answerIndex;
      return newSelected;
    });

    if (answerIndex === 0) {
      setForestCount(forestCount + 1);
    } else {
      setCityCount(cityCount + 1);
    }
  };

  const handleNext = () => {
    if (selectedAnswers[currentQuestion] !== null) {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        if (forestCount > cityCount) {
          navigate('/forest_tendency');
        } else {
          navigate('/city_tendency');
        }
      }
    } else {
      alert('답변을 선택해 주세요.'); 
    }
  };

  return (
    <div className='Question'>
      <Menu/>
      <div className="Question-container">
        <div className="Question-box">
          <div className="navigation">
            {currentQuestion > 0 && (
              <button className="nav-button" onClick={() => setCurrentQuestion(currentQuestion - 1)}>&lt;</button>
            )}
          </div>
          <div className="question">{questions[currentQuestion].question}</div>
          <div className="answers">
            {questions[currentQuestion].answers.map((answer, index) => (
              <button
                key={index}
                className={`answer-button ${selectedAnswers[currentQuestion] === index ? 'selected' : ''}`}
                onClick={() => handleAnswer(index)}
              >
                {answer}
              </button>
            ))}
          </div>
          <div className="navigation">
            <button className="nav-button" onClick={handleNext}>&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Question;
