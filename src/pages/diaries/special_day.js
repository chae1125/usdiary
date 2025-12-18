import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import '../../assets/css/special_day.css';

import place_nature from '../../assets/images/place_nature.png';
import place_city from '../../assets/images/place_city.png';
import back_arrow from '../../assets/images/back_arrow.png';

import sea_illustration from '../../assets/images/sea_illustration.png';
import mountain from '../../assets/images/mountain.png';
import park from '../../assets/images/park.png';
import river from '../../assets/images/river.png';
import stream from '../../assets/images/stream.png';
import valley from '../../assets/images/valley.png';

import cafe from '../../assets/images/cafe.png';
import library from '../../assets/images/library.png';
import restaurant from '../../assets/images/restaurant.png';
import theater from '../../assets/images/theater.png';
import gallery from '../../assets/images/gallery.png';
import shoppingmall from '../../assets/images/shoppingmall.png';
import themepark from '../../assets/images/themepark.png';
import stadium from '../../assets/images/stadium.png';
import auditorium from '../../assets/images/auditorium.png';

import coffee from '../../assets/images/coffee.png';
import seashell from '../../assets/images/seashell.png';
import umbrage from '../../assets/images/umbrage.png';
import flower from '../../assets/images/flower.png';
import duck from '../../assets/images/duck.png';
import bicycle from '../../assets/images/bicycle.png';
import watermelon from '../../assets/images/watermelon.png';
import book from '../../assets/images/book.png';
import plate from '../../assets/images/plate.png';
import film from '../../assets/images/film.png';
import palette from '../../assets/images/palette.png';
import shoppingbag from '../../assets/images/shoppingbag.png';
import balloon from '../../assets/images/balloon.png';
import uniform from '../../assets/images/uniform.png';
import ticket from '../../assets/images/ticket.png';

import PlaceList from './PlaceList';

import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const iconMap = {
  1: seashell,
  2: umbrage,
  3: bicycle,
  4: duck,
  5: flower,
  6: watermelon,
  7: coffee,
  8: book,
  9: plate,
  10: film,
  11: palette,
  12: shoppingbag,
  13: balloon,
  14: uniform,
  15: ticket,
};

const SpecialDay = ({ onBack }) => {
  const location = useLocation();
  const { diary } = location.state || {};

  const [diary_emotion, setEmotion] = useState('');
  const [diary_memo, setMemo] = useState('');
  const [visibleDiv, setVisibleDiv] = useState('totalPlace');
  const [places, setPlaces] = useState([]);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [todayPlace, setTodayPlace] = useState(null);
  const [signId, setSignId] = useState(null);

  useEffect(() => {
    const fetchTodayPlace = async () => {
      const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식으로 현재 날짜 가져오기
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get(`https://api.usdiary.site/contents/places`, {
            params: { date: currentDate },
            headers: {
              'Authorization': `Bearer ${token}`  // 토큰을 Authorization 헤더에 추가
            }
          });
          const fetchedPlace = response.data.data[0];
          if (fetchedPlace) {
            console.log("fetchedPlace 전체 데이터:", fetchedPlace); // 전체 데이터를 콘솔에 출력
            console.log("cate_num:", fetchedPlace.cate_num);
            console.log("today_mood:", fetchedPlace.today_mood); // today_mood가 잘 불러와지는지 확인
            console.log("place_memo:", fetchedPlace.place_memo)

            setTodayPlace(fetchedPlace);
            setSelectedIcon(iconMap[fetchedPlace.cate_num]);
            setEmotion(fetchedPlace.today_mood);
            setMemo(fetchedPlace.place_memo);
          } else {
            console.warn("해당 날짜에 대한 장소 데이터가 없습니다.");
          }
        } catch (error) {
          console.error('오늘의 장소를 불러오는 데 실패했습니다.', error);
        }
      } else {
        console.error('토큰이 존재하지 않습니다.');
      }
    };

    fetchTodayPlace();
  }, []);


  const getIconClass = (cate_num) => {
    return `sea-popup__icon-${cate_num}`;
  };

  const isReadOnly = diary && diary_emotion && diary_memo;
  const [place_id, setPlaceId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);


  const handleSave = async () => {
    const divNumbers = {
      sea: '1',
      mountain: '2',
      park: '3',
      river: '4',
      stream: '5',
      valley: '6',
      cafe: '7',
      library: '8',
      restaurant: '9',
      theater: '10',
      gallery: '11',
      shoppingmall: '12',
      themepark: '13',
      stadium: '14',
      auditorium: '15'
    };

    // visibleDiv 값을 숫자로 변환
    const cate_num = divNumbers[visibleDiv];

    const currentDate = new Date().toISOString().split('T')[0];

    // 서버로 전송할 데이터
    const data = {
      cate_num: cate_num, // visibleDiv에 매핑된 숫자
      today_mood: diary_emotion, // 오늘의 기분
      place_memo: diary_memo,  // 한 줄 메모
      date: currentDate
    };

    const token = localStorage.getItem('token');

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setSignId(decodedToken.signId);

        // 서버로 POST 요청
        const response = await axios.post('https://api.usdiary.site/contents/places', data, {
          headers: {
            'Authorization': `Bearer ${token}`  // Authorization 헤더에 토큰 추가
          }
        });

        if (response.status === 201) {
          // 서버 응답 메시지 확인
          const message = response.data.message;  // 응답에서 message 추출
          console.log(message);
        } else {
          console.error('데이터 저장에 실패했습니다.', response.data);
        }
      } catch (error) {
        console.error('토큰 디코딩 중 오류 발생:', error);
      }
    } else {
      console.error('토큰이 존재하지 않습니다.');
    }
  };

  const handleToggleDiv = (currentDiv, targetDiv) => {
    setVisibleDiv(visibleDiv === currentDiv ? targetDiv : currentDiv);
  };

  // 자연 - 장소 이동 핸들러
  const handleToggleDiv1 = () => handleToggleDiv('totalPlace', 'naturePlace');

  // 도시 - 장소 이동 핸들러
  const handleToggleDiv2 = () => handleToggleDiv('totalPlace', 'cityPlace');

  // 장소 - 바다 이동 핸들러
  const handleToggleDiv3 = () => handleToggleDiv('naturePlace', 'sea');

  // 장소 - 산 이동 핸들러
  const handleToggleDiv4 = () => handleToggleDiv('naturePlace', 'mountain');

  // 장소 - 공원 이동 핸들러
  const handleToggleDiv5 = () => handleToggleDiv('naturePlace', 'park');

  // 장소 - 강 이동 핸들러
  const handleToggleDiv6 = () => handleToggleDiv('naturePlace', 'river');

  // 장소 - 하천 이동 핸들러
  const handleToggleDiv7 = () => handleToggleDiv('naturePlace', 'stream');

  // 장소 - 계곡 이동 핸들러
  const handleToggleDiv8 = () => handleToggleDiv('naturePlace', 'valley');

  // 장소 - 카페 이동 핸들러
  const handleToggleDiv9 = () => handleToggleDiv('cityPlace', 'cafe');

  // 장소 - 도서관 이동 핸들러
  const handleToggleDiv10 = () => handleToggleDiv('cityPlace', 'library');

  // 장소 - 식당 이동 핸들러
  const handleToggleDiv11 = () => handleToggleDiv('cityPlace', 'restaurant');

  // 장소 - 극장 이동 핸들러
  const handleToggleDiv12 = () => handleToggleDiv('cityPlace', 'theater');

  // 장소 - 미술관 이동 핸들러
  const handleToggleDiv13 = () => handleToggleDiv('cityPlace', 'gallery');

  // 장소 - 쇼핑몰 이동 핸들러
  const handleToggleDiv14 = () => handleToggleDiv('cityPlace', 'shoppingmall');

  // 장소 - 테마파크 이동 핸들러
  const handleToggleDiv15 = () => handleToggleDiv('cityPlace', 'themepark');

  // 장소 - 경기장 이동 핸들러
  const handleToggleDiv16 = () => handleToggleDiv('cityPlace', 'stadium');

  // 장소 - 공연장 이동 핸들러
  const handleToggleDiv17 = () => handleToggleDiv('cityPlace', 'auditorium');

  const placeListData = [
    { visibleDiv: 'sea', image: seashell, title: '바다', imageId: 'seashell', category: 'naturePlace' },
    { visibleDiv: 'mountain', image: umbrage, title: '산', imageId: 'umbrage', category: 'naturePlace' },
    { visibleDiv: 'park', image: flower, title: '공원', imageId: 'flower', category: 'naturePlace' },
    { visibleDiv: 'river', image: duck, title: '강', imageId: 'duck', category: 'naturePlace' },
    { visibleDiv: 'stream', image: bicycle, title: '하천', imageId: 'bicycle', category: 'naturePlace' },
    { visibleDiv: 'valley', image: watermelon, title: '계곡', imageId: 'watermelon', category: 'naturePlace' },
    { visibleDiv: 'cafe', image: coffee, title: '카페', imageId: 'coffee', category: 'cityPlace' },
    { visibleDiv: 'library', image: book, title: '도서관', imageId: 'book', category: 'cityPlace' },
    { visibleDiv: 'restaurant', image: plate, title: '식당', imageId: 'plate', category: 'cityPlace' },
    { visibleDiv: 'theater', image: film, title: '극장', imageId: 'film', category: 'cityPlace' },
    { visibleDiv: 'gallery', image: palette, title: '미술관', imageId: 'palette', category: 'cityPlace' },
    { visibleDiv: 'shoppingmall', image: shoppingbag, title: '쇼핑몰', imageId: 'shoppingbag', category: 'cityPlace' },
    { visibleDiv: 'themepark', image: balloon, title: '테마파크', imageId: 'balloon', category: 'cityPlace' },
    { visibleDiv: 'stadium', image: uniform, title: '경기장', imageId: 'uniform', category: 'cityPlace' },
    { visibleDiv: 'auditorium', image: ticket, title: '공연장', imageId: 'ticket', category: 'cityPlace' }
  ];

  const handleToggle = (divName) => () => {
    setVisibleDiv(visibleDiv === divName ? 'totalPlace' : divName);
  };

  const handleBackClick = () => {
    if (diary) {
      onBack();
      return;
    }

    if (diary_emotion || diary_memo) { // diary_emotion 또는 diary_memo 값이 있을 경우
      const confirmLeave = window.confirm("입력한 내용이 저장되지 않았습니다. 정말 돌아가시겠습니까?");
      if (!confirmLeave) {
        return; // 사용자가 '취소'를 선택하면 종료
      }
    }
    onBack(); // 값이 없거나 '확인'을 누르면 onBack 실행
  };

  return (
    <div>
      <div className="sea_back-button" onClick={handleBackClick}>&lt;&lt;&nbsp;&nbsp;Hide</div>
      <div className="specialDay">
        <div className="specialDay-title">
          <div className="specialDay-title-name">Today’s Place</div>
        </div>

        {todayPlace ? (
          <div className='sea-popup__container' style={{ boxShadow: 'none', marginBottom: '5px', height: '400px' }}>
            <img src={selectedIcon} alt="Category Icon" className={`sea-popup__category-icon ${getIconClass(todayPlace.cate_num)}`} />
            <div className="sea-popup__icon-text">
              <div className="sea-popup__icon-emotion">{diary_emotion}</div>
              <div className="sea-popup__icon-memo">{diary_memo}</div>
            </div>
          </div>
        ) : (
          <>
            {visibleDiv === 'totalPlace' && (
              <div className="specialDay-choice1">
                <div className="specialDay-choice1-box" onClick={handleToggleDiv1}>
                  <img src={place_nature} alt='place_nature' />
                  <div id="totalPlace" className="specialDay-choice1-box-name">자연</div>
                </div>
                <div className="specialDay-choice1-box" onClick={handleToggleDiv2}>
                  <img src={place_city} alt='place_city' />
                  <div id="totalPlace" className="specialDay-choice1-box-name">도시</div>
                </div>
              </div>
            )}

            {visibleDiv === 'naturePlace' && (
              <div className="specialDay-choice2">
                <div className="specialDay-choice2-top">
                  <div onClick={handleToggleDiv1}>
                    <img src={back_arrow} alt='back_arrow' className="back_arrow" />
                  </div>
                  <div className="specialDay-choice2-top-name">자연</div>
                </div>
                <hr />
                <div className="specialDay-choice2-places">
                  <div className="specialDay-choice2-places-left" id='naturePlace'>
                    <div className="specialDay-choice2-places-left-thg" onClick={handleToggleDiv3}><img src={sea_illustration} alt='sea_illustration' id='sea_illustration' /></div>
                    <div className="specialDay-choice2-places-left-name" onClick={handleToggleDiv3}>바다</div>
                    <div className="specialDay-choice2-places-left-thg" onClick={handleToggleDiv5}><img src={park} alt='park' id='park' /></div>
                    <div className="specialDay-choice2-places-left-name" onClick={handleToggleDiv5}>공원</div>
                    <div className="specialDay-choice2-places-left-thg" onClick={handleToggleDiv7}><img src={stream} alt='stream' id='stream' /></div>
                    <div className="specialDay-choice2-places-left-name" onClick={handleToggleDiv7}>하천</div>
                  </div>
                  <div className="specialDay-choice2-places-right">
                    <div className="specialDay-choice2-places-left-thg" onClick={handleToggleDiv4}><img src={mountain} alt='mountain' id='mountain' /></div>
                    <div className="specialDay-choice2-places-left-name" onClick={handleToggleDiv4}>산</div>
                    <div className="specialDay-choice2-places-left-thg" onClick={handleToggleDiv6}><img src={river} alt='river' id='river' /></div>
                    <div className="specialDay-choice2-places-left-name" onClick={handleToggleDiv6}>강</div>
                    <div className="specialDay-choice2-places-left-thg" onClick={handleToggleDiv8}><img src={valley} alt='valley' id='valley' /></div>
                    <div className="specialDay-choice2-places-left-name" onClick={handleToggleDiv8}>계곡</div>
                  </div>
                </div>
              </div>
            )}

            {visibleDiv === 'cityPlace' && (
              <div className="specialDay-choice2">
                <div className="specialDay-choice2-top">
                  <div onClick={handleToggleDiv2}>
                    <img src={back_arrow} alt='back_arrow' className="back_arrow" />
                  </div>
                  <div className="specialDay-choice2-top-name">도시</div>
                </div>
                <hr />
                <div className="specialDay-choice2-places">
                  <div className="specialDay-choice2-places-left" id='cityPlace'>
                    <div className="specialDay-choice2-places-left-thg" onClick={handleToggleDiv9}><img src={cafe} alt='cafe' id='cafe' /></div>
                    <div className="specialDay-choice2-places-left-name" onClick={handleToggleDiv9}>카페</div>
                    <div className="specialDay-choice2-places-left-thg" onClick={handleToggleDiv11}><img src={restaurant} alt='restaurant' id='restaurant' /></div>
                    <div className="specialDay-choice2-places-left-name" onClick={handleToggleDiv11}>식당</div>
                    <div className="specialDay-choice2-places-left-thg" onClick={handleToggleDiv13}><img src={gallery} alt='gallery' id='gallery' /></div>
                    <div className="specialDay-choice2-places-left-name" onClick={handleToggleDiv13}>미술관</div>
                    <div className="specialDay-choice2-places-left-thg" onClick={handleToggleDiv15}><img src={themepark} alt='themepark' id='themepark' /></div>
                    <div className="specialDay-choice2-places-left-name" onClick={handleToggleDiv15}>테마파크</div>
                    <div className="specialDay-choice2-places-left-thg" onClick={handleToggleDiv17}><img src={auditorium} alt='auditorium' id='auditorium' /></div>
                    <div className="specialDay-choice2-places-left-name" onClick={handleToggleDiv17}>공연장</div>
                  </div>
                  <div className="specialDay-choice2-places-right">
                    <div className="specialDay-choice2-places-left-thg" onClick={handleToggleDiv10}><img src={library} alt='library' id='library' /></div>
                    <div className="specialDay-choice2-places-left-name" onClick={handleToggleDiv10}>도서관</div>
                    <div className="specialDay-choice2-places-left-thg" onClick={handleToggleDiv12}><img src={theater} alt='theater' id='theater' /></div>
                    <div className="specialDay-choice2-places-left-name" onClick={handleToggleDiv12}>극장</div>
                    <div className="specialDay-choice2-places-left-thg" onClick={handleToggleDiv14}><img src={shoppingmall} alt='shoppingmall' id='shoppingmall' /></div>
                    <div className="specialDay-choice2-places-left-name" onClick={handleToggleDiv14}>쇼핑몰</div>
                    <div className="specialDay-choice2-places-left-thg" onClick={handleToggleDiv16}><img src={stadium} alt='stadium' id='stadium' /></div>
                    <div className="specialDay-choice2-places-left-name" onClick={handleToggleDiv16}>경기장</div>
                  </div>
                </div>
              </div>
            )}

            {placeListData.map((place) =>
              visibleDiv === place.visibleDiv && (
                <PlaceList
                  key={place.visibleDiv}
                  places={places}
                  image={place.image}
                  handleToggle={handleToggle(place.category)}
                  title={place.title}
                  imageId={place.imageId}
                />
              )
            )}
          </>
        )}

        <div className="specialDay-emotion">
          <input
            placeholder='오늘의 기분 (10자 제한)'
            spellCheck="false"
            maxLength='10'
            value={diary_emotion}
            onChange={(e) => setEmotion(e.target.value)}
            readOnly={isReadOnly}  // 읽기 전용 조건
          />
        </div>

        <div className="specialDay-memo">
          <textarea
            placeholder='한 줄 메모 (30자 제한)'
            spellCheck="false"
            maxLength='30'
            value={diary_memo}
            onChange={(e) => setMemo(e.target.value)}
            readOnly={isReadOnly}  // 읽기 전용 조건
          />
        </div>

        {!isReadOnly && (
          <div className="specialDay-save" onClick={handleSave}>저장</div>
        )}
      </div>
    </div>
  );
};


export default SpecialDay;