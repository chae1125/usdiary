import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../assets/css/level.css';
import Menu from '../../components/menu';
import ProfileMenu from '../../components/profileMenu';

import crescent from '../../assets/images/crescent.png';
import firstQuarter from '../../assets/images/firstQuarter.png';
import fullMoon from '../../assets/images/fullMoon.png';
import oldMoon from '../../assets/images/oldMoon.png';


const Level = () => {
    const [userLevel, setUserLevel] = useState(1); // 초기값은 1로 설정

    useEffect(() => {
        // 서버로부터 레벨 데이터를 받아옴
        const fetchUserLevel = async () => {
            try {
                const response = await axios.get('/api/user/level'); // 서버 API 호출
                setUserLevel(response.data.level); // 서버에서 받은 레벨 값 설정
            } catch (error) {
                console.error("레벨 데이터를 가져오는 중 오류 발생:", error);
            }
        };

        fetchUserLevel();
    }, []);

    // 각 레벨에 따라 활성화 클래스 추가
    const getBoxClassName = (level) => {
        return userLevel === level ? 'profile-level_box active' : 'profile-level_box';
    };

    // 레벨에 따라 멘트 설정
    const levelMent = () => {
        switch (userLevel) {
            case 1:
                return "회원님은 현재 초승달 등급입니다.";
            case 2:
                return "회원님은 현재 상현달 등급입니다.";
            case 3:
                return "회원님은 현재 보름달 등급입니다.";
            case 4:
                return "회원님은 현재 그믐달 등급입니다.";
            default:
                return "회원님의 등급을 확인 중입니다.";
        }
    };

    return (
        <div className='wrap'>
            <Menu/>
            
            <div className='profile'>
                <ProfileMenu />
                <div className='profile-contents'>
                <div className='profile-level'>
                    <div className='profile-level_name'>등급별 혜택</div>
                    <hr/>
                    <div className='profile-level_ment'>{levelMent()}</div>
                    <div className='profile-level_boxes'>
                        <div className={getBoxClassName(1)} id='crescent'>
                            <img src={crescent} />
                            <div className='profile-level_box_text'>Lv 1. 초승달</div>
                        </div>
                        <div className={getBoxClassName(2)} id='firstQuarter'>
                            <img src={firstQuarter}/>
                            <div className='profile-level_box_text'>Lv 2. 상현달</div>
                        </div>
                        <div className={getBoxClassName(3)} id='fullMoon'>
                            <img src={fullMoon}/>
                            <div className='profile-level_box_text'>Lv 3. 보름달</div>
                        </div>
                        <div className={getBoxClassName(4)} id='oldMoon'>
                            <img src={oldMoon}/>
                            <div className='profile-level_box_text'>Lv 4. 그믐달</div>
                        </div>
                    </div>
                    <table>
                        <tr id='tr1'>
                            <td>등급</td>
                            <td>기준</td>
                            <td>혜택</td>
                        </tr>
                        <tr id='tr2'>
                            <th>Lv 4. 그믐달</th>
                            <td>가입일 3달 이상<br/>(한 달 기준) 일기 작성 15회 이상</td>
                            <td>(한 달 기준) 3개의 나만보기권 제공</td>
                        </tr>
                        <tr id='tr3'>
                            <th>Lv 3. 보름달</th>
                            <td>가입일 2달 이상<br/>(한 달 기준) 일기 작성 10회 이상<br/>반대 성향 댓글 10개 작성</td>
                            <td>반대 페이지 게시글 작성 3회권 획득<br/>포인트로 성향 바꾸기권 구매 가능</td>
                        </tr>
                        <tr id='tr4'>
                            <th>Lv 2. 상현달</th>
                            <td>가입일 2주 이상<br/>(한 달 기준) 일기 작성 7회 이상</td>
                            <td>반대 페이지 접속 가능<br/>(* 조회, 댓글 작성 가능, 일기 작성 불가능)<br/>친구 커뮤니티 기능 사용 가능<br/>마이페이지 - 팔로우, 팔로잉 기능 사용 가능</td>
                        </tr>
                        <tr id='tr5'>
                            <th>Lv 1. 초승달</th>
                            <td>가입 회원</td>
                            <td>ㅡ</td>
                        </tr>
                    </table>
                    <div className='profile-level_ment2'>
                    등급별 월 일기 횟수 미충족시 다음달 등급이 하락합니다.<br/>
                    성향 바꾸기가 반복될수록 일정 기준까지 구매 포인트가 올라갑니다.<br/>
                    상위 등급은 하위 등급의 모든 혜택을 포함하고 있습니다.
                    </div>
                </div>
                </div>
            </div>
        </div>
    );
};

export default Level;
