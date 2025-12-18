import React, { useState, useEffect } from 'react';
import '../../assets/css/checklist.css';
import right_arrow from '../../assets/images/right_arrow.png';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { PropTypes } from 'prop-types';

const Routine = ({ onClose, onArrowClick, onSubmit }) => {
  const [routines, setRoutines] = useState([]);
  const [signId, setSignId] = useState(null);

  // 현재 날짜 기반으로 루틴 데이터 가져오기
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setSignId(decodedToken.signId);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }

    const currentDate = new Date().toISOString().split('T')[0];

    const fetchRoutines = async () => {
      const token = localStorage.getItem('token'); // 여기서 token을 다시 정의
      try {
        const response = await axios.get(`https://api.usdiary.site/contents/routines`, {
          params: {
            date: currentDate
          },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log("Response data:", response.data);
        const fetchedRoutines = Array.isArray(response.data.data) ? response.data.data.slice(0, 3) : [];
        setRoutines(fetchedRoutines.length > 0 ? fetchedRoutines : []);
        console.log("되고 있음?");
      } catch (error) {
        console.error('루틴을 가져오는 데 실패했습니다:', error);
      }
    };

    fetchRoutines();
  }, []);

  // 새로운 루틴 항목 추가 (3개까지만)
  const handleAddRoutine = () => {
    if (routines.length < 3) {
      const newRoutine = {
        routine_title: '',
        description: '',
        is_completed: false
      };

      // 로컬 상태에서 새로운 루틴 추가
      setRoutines((prevRoutines) => [
        ...prevRoutines,
        newRoutine
      ]);
      console.log('새로운 루틴 추가 성공:', newRoutine);
    } else {
      alert('루틴은 최대 3개까지만 추가할 수 있습니다.');
    }
  };


  // 제목 및 설명을 업데이트하는 함수
  const handleRoutineChange = (index, field, value) => {
    setRoutines((prevRoutines) =>
      prevRoutines.map((routine, idx) =>
        idx === index ? { ...routine, [field === 'title' ? 'routine_title' : 'description']: value } : routine
      )
    );
  };

  // 완료 상태를 토글하는 함수
  const handleToggleChange = (index) => {
    setRoutines((prevRoutines) =>
      prevRoutines.map((routine, idx) =>
        idx === index ? { ...routine, is_completed: !routine.is_completed } : routine
      )
    );
  };

  // 루틴 삭제
  const handleDeleteRoutine = (index) => {
    const routineToDelete = routines[index];
    
    if (!routineToDelete || !routineToDelete.routine_id) {
      console.error('삭제할 루틴이 없습니다.');
      return;
    }
  
    // 서버에 삭제 요청 보내기
    axios.delete(`https://api.usdiary.site/contents/routines/${routineToDelete.routine_id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then(() => {
        console.log('루틴 삭제 성공:', routineToDelete.routine_id);
  
        // 삭제된 루틴을 화면에서 제거
        setRoutines((prevRoutines) => prevRoutines.filter((routine, idx) => idx !== index));
      })
      .catch((error) => {
        console.error('루틴 삭제 중 오류 발생:', error);
      });
  };

  // 모든 루틴 삭제 후 다시 저장하는 함수
  const handleSave = async () => {
    try {
      // 1. 서버에 존재하는 모든 루틴 삭제
      await Promise.all(
        routines.map((routine) => {
          if (routine.routine_id) {
            return axios.delete(`https://api.usdiary.site/contents/routines/${routine.routine_id}`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            });
          } else {
            console.warn('루틴 ID가 없어서 삭제하지 않음:', routine);
            return Promise.resolve(); // ID가 없으면 삭제하지 않음
          }
        })
      );
      console.log("서버에 있는 모든 루틴 삭제 성공");

      // 2. 상태에 있는 루틴을 서버에 다시 추가 (빈 내용은 제외하고)
      const newRoutinesPromises = routines
        .filter(routine => routine.routine_title || routine.description) // 빈 내용인 루틴 제외
        .map((routine) => {
          const formattedDate = new Date().toISOString().split('T')[0]; // 현재 날짜를 YYYY-MM-DD 형식으로 저장

          return axios.post(
            "https://api.usdiary.site/contents/routines",
            {
              routine_title: routine.routine_title,
              description: routine.description,
              is_completed: routine.is_completed,
              date: formattedDate, // YYYY-MM-DD 형식으로 설정
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            }
          );
        });

      // 새로운 루틴을 서버에 추가
      const createdRoutines = await Promise.all(newRoutinesPromises);
      console.log("새 루틴 추가 성공:", createdRoutines.map((res) => res.data));
      alert("루틴이 저장되었습니다");
    } catch (error) {
      console.error("루틴 저장 중 오류 발생:", error);
    }
  };

  return (
    <div className="ck-popup-overlay">
      <div className="ck-popup-background">
        <div className="ck-popup-content">
          <div className="ck-popup-header">
            <h2>Check List</h2>
            <button className="ck-popup-close" onClick={onClose}>X</button>
          </div>
          <div className="routine">
            <div className="routine-top">
              <div className="routine-top-title">
                <div className="routine-top-title-circle"></div>
                <div className="routine-top-title-name">Routine</div>
              </div>
              <img
                src={right_arrow}
                className="routine-arrow"
                alt="right_arrow"
                onClick={onArrowClick}
              />
            </div>
            <hr />
            <div className="routine-middle">
              {routines.map((routine, index) => (
                <div className="routine-middle-box" key={index}>
                  <div className="routine-middle-box-1">
                    <input
                      type="checkbox"
                      id={`toggle-${index}`}
                      hidden
                      checked={routine.is_completed}
                      onChange={() => handleToggleChange(index)}
                    />
                    <label htmlFor={`toggle-${index}`} className="routine-middle-box-toggleSwitch">
                      <span className="routine-middle-box-toggleButton"></span>
                    </label>
                  </div>
                  <div className="routine-middle-box-2">
                    <input
                      className="routine-middle-box-title"
                      type="text"
                      placeholder="Routine"
                      value={routine.routine_title || ""}
                      onChange={(e) => handleRoutineChange(index, 'title', e.target.value)}
                      spellCheck="false"
                    />
                  </div>
                  <div className="routine-middle-box-3">
                    <input
                      className="routine-middle-box-content"
                      type="text"
                      placeholder="내용을 입력하시오."
                      value={routine.description || ''}
                      onChange={(e) => handleRoutineChange(index, 'description', e.target.value)}
                      spellCheck="false"
                    />
                  </div>
                  <div
                    className="routine-middle-box-delete"
                    onClick={() => handleDeleteRoutine(index)}
                  >
                    삭제
                  </div>
                </div>
              ))}

              {routines.length < 3 && (
                <div className="routine-middle-plusbtn" onClick={handleAddRoutine}>
                  루틴 추가하기
                </div>
              )}
            </div>
            <div className="routine-savebtn" onClick={handleSave}>저장</div>
          </div>
        </div>
      </div>
    </div>
  );
};

Routine.propTypes = {
  onClose: PropTypes.func.isRequired,
  onArrowClick: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default Routine;

export const deleteRoutine = async (routine_id) => {
  try {
    await axios.delete(`https://api.usdiary.site/contents/routines/${routine_id}`);
  } catch (error) {
    console.error('Failed to delete routine:', error);
    throw error;
  }
};

export const updateRoutine = async (routine_id, routine) => {
  try {
    const response = await axios.put(`https://api.usdiary.site/contents/routines/${routine_id}`, routine);
    return response.data.data
  } catch (error) {
    console.error('Failed to update routine:', error);
    throw error;
  }
};
