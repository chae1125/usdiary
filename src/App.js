import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/login/login';
import FindId from './pages/login/id-find';
import FindPwd from './pages/login/pw-find';
import ForestDiary from './pages/diaries/diaries_forest';
import CityDiary from './pages/diaries/diaries_city';
import SeaDiary from './pages/diaries/diaries_sea';
import Signup from './pages/signup/signup';
import Home from './pages/home/home';
import Sea from './pages/home/sea';
import Friend from './pages/home/friend';
import Question from './pages/tendency/question';
import ForestTendency from "./pages/tendency/forest_tendency";
import CityTendency from "./pages/tendency/city_tendency";
import Map from './pages/map/map';
import Forest from './pages/home/forest';
import City from './pages/home/city';
import ForestQuestion from './pages/diaries/forestquestion'
import CheckList from './pages/checklist/checklist';
import SpecialDay from './pages/diaries/special_day';
import ProfilePage from './pages/mypages/profile';
import ProfileFix from './pages/mypages/profilefix';
import Follow from './pages/mypage/follow/follow';
import MyRate from './pages/mypage/myRate';
import Level from './pages/mypage/level';
import Notification from './pages/mypages/notification';
import NotificationDetail from './pages/mypages/notification_detail';
import Contact from './pages/mypages/contact';

const App = () => {

  return (
    <Router>
      <Routes>
        {/* 로그인 페이지 경로 */}
        <Route path="/" element={<Login />} />
        
        <Route path="/findId" element={<FindId />} />

        <Route path="/findPwd" element={<FindPwd />} />

        {/* 숲 다이어리 페이지 경로 */}
        <Route path="/forest_diary" element={<ForestDiary />}></Route>
        {/* 도시 다이어리 페이지 경로 */}
        <Route path="/city_diary" element={<CityDiary />}></Route>
        {/* 바다 다이어리 페이지 경로 */}
        <Route path="/sea_diary" element={<SeaDiary />}></Route>

        {/* 체크리스트 페이지 경로 */}
        <Route path="/city_diary/checklist" element={<CheckList />}></Route>

        {/* 바다 특별한 일기 페이지 경로 */}
        <Route path="/sea_diary/special_day" element={<SpecialDay />}></Route>

        {/* 회원가입 페이지 경로 */}
        <Route path="/signup" element={<Signup/>} />   

        {/* 성향 질문 페이지 경로 */}
        <Route path="/question" element={<Question/>} />

        <Route path="/forest_tendency" element={<ForestTendency/>} />

        <Route path="/city_tendency" element={<CityTendency/>} />
     

        <Route path="/home" element={<Home />} />

        <Route path="/forest" element={<Forest />}></Route>

        <Route path="/city" element={<City />}></Route>

        <Route path="/sea" element={<Sea />}></Route>

        <Route path="/friend" element={<Friend />}></Route>

        <Route path="/map" element={<Map />}></Route>

        {/* 오늘의 질문 페이지 경로 */}
        <Route path="/forestquestion" element={<ForestQuestion />}/>

        {/* 마이페이지 프로필 수정 페이지 경로 */}
        <Route path="/profile" element={<ProfilePage />}/>
        <Route path="/profilefix" element={<ProfileFix />}/>

        {/* 공지사항 페이지 경로 */}
        <Route path="/notification" element={<Notification />}/>
        <Route path="/notification/:id" element={<NotificationDetail />}/>

        {/* 문의사항 페이지 경로 */}
        <Route path="/contact" element={<Contact />}/>

        {/* 팔로우 페이지 경로 */}
        <Route path="/mypage/follow" element={<Follow />}/>

        <Route path="/mypage/myRate" element={<MyRate />}/>
        <Route path="/mypage/level" element={<Level />}/>
      </Routes>
    </Router>
  );
};

export default App;