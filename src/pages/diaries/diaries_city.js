import React, { useState } from 'react';

import Menu from "../../components/menu";
import CityComponent from "../../components/cityDiary";
import CheckList from '../checklist/checklist';

import '../../assets/css/diaries_city.css';

import todays_check from '../../assets/images/Todays_Check_city.png';

const CityDiary = () => {
  const [showChecklist, setShowChecklist] = useState(false);

  const switchToChecklist = () => {
    setShowChecklist(true);
  };

  const switchToDiary = () => {
    setShowChecklist(false);
  };

  return (
    <div className={`wrap ${showChecklist ? 'page2' : 'page1'}`}>
      <Menu/>
      {!showChecklist ? (
        <div>
          {/* 페이지1 */}
          <div className="city">
            {/* 체크리스트 */}
            <div className="city__check" onClick={switchToChecklist}>
              <img src={todays_check} className="city__check-image" alt="todays_check"/>
            </div>
            {/* 일기작성 */}
            <CityComponent />
          </div>
        </div>
      ) : (
        <div>
          {/* 페이지2 */}
          <div className="city">
            {/* 체크리스트 */}
            <CheckList onBack={switchToDiary}/>
            {/* 일기작성 */}
            <CityComponent />
          </div>
      </div>
      )}
    
    </div>
  );
};



export default CityDiary;