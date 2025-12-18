import React, { useState } from 'react';

import Menu from "../../components/menu";
import ForestComponent from "../../components/forestDiary";
import Question from './forestquestion';

import '../../assets/css/diaries_forest.css';
import todays_question from '../../assets/images/Todays_Question_forest.png';

const ForestDiary = () => {
  const [showQuestion, setShowQuestion] = useState(false);

  const switchToQuestion = () => {
    setShowQuestion(true);
  };

  const switchToDiary = () => {
    setShowQuestion(false);
  };

  return (
    <div className={`wrap ${showQuestion ? 'page2' : 'page1'}`}>
      <Menu />
      <div className="forest">
        {/* 오늘의 질문 */}
        {!showQuestion ? (
          <div className="forest__question" onClick={switchToQuestion}>
            <img src={todays_question} className="forest__question-image" alt="todays_question"/>
          </div>
        ) : (
          <Question onBack={switchToDiary} />
        )}
        {/* 일기작성 */}
        <ForestComponent />
      </div>
    </div>
  );
};



export default ForestDiary;