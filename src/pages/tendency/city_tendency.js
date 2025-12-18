import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Menu from '../../components/menu';
import GuidePopup from '../../components/guide';
import '../../assets/css/city_tendency.css';
import BigcityImage from '../../assets/images/bigcity.png';
import MintreeImage from '../../assets/images/mintree.png';
import { jwtDecode } from 'jwt-decode';

function CityTendency() {
  const navigate = useNavigate();
  const [userNick, setUserNick] = useState(''); // userNick 상태 추가

  useEffect(() => {
    // 사용자 정보를 가져오는 API 호출
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token'); // 로컬스토리지에서 토큰 가져오기
        if (!token) {
          throw new Error('No token found');
        }

        const response = await fetch('https://api.usdiary.site/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('서버에 오류가 발생했습니다.');
        }

        const data = await response.json();
        setUserNick(data.data.user_nick); // 서버에서 응답받은 데이터를 사용
        console.log('Fetched userNick:', data.data.user_nick); // 닉네임 콘솔 출력
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData(); // 컴포넌트 마운트 시 사용자 정보 가져오기
  }, []);


  const handleSubmit = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('로그인 정보가 없습니다.');
      return;
    }

    // Decode the token to get userId
    const decodedToken = jwtDecode(token);
    const sign_id = decodedToken.sign_id;

    if (!sign_id) {
      console.error('User ID not found in token.');
      return;
    }

    console.log(token, sign_id);

    try {
      const response = await fetch(`https://api.usdiary.site/users/${sign_id}/tendency`, { // Corrected line
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ selection: 'city' }),
      });

      if (!response.ok) {
        throw new Error('서버에 오류가 발생했습니다.');
      }

      const data = await response.json();
      console.log('Server response:', data);

      if (data.message === '성향이 성공적으로 수정되었습니다.') {
        console.log("Navigating to home...");
        navigate('/home', { state: { userTendency: '도시' } });
      } else {
        console.error("성향 업데이트 실패");
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };


  const handleCityTendencyClick = () => {
    navigate('/forest_tendency');
  };

  return (
    <div className="Tendency">
      <GuidePopup />
      <div className="city_Tendency">
        <Menu />
        <div className="city_tendency">
          <div className="city_tendency_info-box">
            <div className="city_tendency_info-content">
              <div className="city_tendency_info-header">
                <h1>{userNick}님은 도시 성향이에요</h1> 
              </div>
              <div className="city_tendency_info-section">
                <h2>도시란?</h2>
                <div className="city_tendency_text-container">
                  <p>
                    도시는 바쁘게 살아가는 사람들을 위한 기록장입니다. 많은 계획과 일정을 소화하며 바쁜 하루를 보내는 무너들에게 의미 있는 공간이 될 것입니다. 할 일과 목표에 맞춰 체계적으로 하루를 관리하며, 생산적이고 보람 있는 하루를 기록할 수 있습니다. 비슷한 무너들과 함께 집중력을 높이고, 도전과 성취의 기쁨을 나눌 수 있는 도시 공간을 usdiary가 제공해드립니다.
                  </p>
                </div>
              </div>
              <div className="city_tendency_info-section">
                <h2>도시에는 이런 기능이 있어요</h2>
                <div className="city_tendency_text-container">
                  <p>
                    하루를 효과적으로 정리할 수 있도록 '투두 리스트'와 '루틴 리스트' 기능이 제공됩니다. 그날 해야 할 일들과 습관을 추가해 계획적으로 하루를 살아가며, 계획을 실행하고 성취하는 경험을 기록하세요. 목표를 이루는 과정을 기록하는 것은 자신을 되돌아보고 성장할 수 있는 발판이 되어줄 것입니다.
                  </p>
                </div>
              </div>
              <button className="city_tendency_submit-button" onClick={handleSubmit}>도시 성향으로 결정하기</button>
              <p className="city_tende_ncynote">* 일주일 동안 성향 변경이 가능합니다</p>
            </div>
            <img src={BigcityImage} alt="city_tendency_Description" className="city_tendency_info-image" />
            <button className="city_tendency_city-tendency-button" onClick={handleCityTendencyClick}>
              <img src={MintreeImage} alt="city_tendency_City Tendency" className="city_tendency_city-image" />
              숲 성향 보러가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CityTendency;
