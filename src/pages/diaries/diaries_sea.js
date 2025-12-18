import React, { useState } from 'react';
import '@toast-ui/editor/dist/toastui-editor.css';

import Menu from "../../components/menu";
import SeaComponent from "../../components/seaDiary";
import SpecialDay from "./special_day";

import '../../assets/css/diaries_sea.css';
import todays_place from '../../assets/images/Todays_Place_sea.png';

const SeaDiary = () => {
  const [showSpecialday, setShowSpecialday] = useState(false);

  const switchToSpecialday = () => {
    setShowSpecialday(true);
  };

  const switchToDiary = () => {
    setShowSpecialday(false);
  };

  return (
    <div className={`wrap ${showSpecialday ? 'page2' : 'page1'}`}>
      <Menu/>
      {!showSpecialday ? (
        <div>
          {/* 페이지1 */}
          <div className="sea">
            {/* 오늘의장소 */}
            <div className="sea__check" onClick={switchToSpecialday}>
              <img src={todays_place} className="sea__check-image" alt="todays_place"/>
            </div>
            {/* 일기작성 */}
            <SeaComponent />
          </div>
        </div>
      ) : (
        <div>
          {/* 페이지2 */}
          <div className="sea">
            {/* 오늘의장소 */}
            <SpecialDay onBack={switchToDiary} />
            {/* 일기작성 */}
            <SeaComponent />
          </div>
        </div>
      )}
    </div>

  );
};



export default SeaDiary;