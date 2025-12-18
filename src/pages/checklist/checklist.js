import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '@toast-ui/editor/dist/toastui-editor.css';

import '../../assets/css/checklist.css';

import Routine from './routine';
import Todo from './todo';

import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export const postDiary = async (diary, signId) => {
  try {
    const response = await axios.post('https://api.usdiary.site/diaries', diary);
    return response.data;
  } catch (error) {
    console.error('Failed to post diary:', error);
    throw error;
  }
};

export const patchRoutine = async (routine_id, updatedRoutine) => {
  try {
    const response = await axios.patch(`https://api.usdiary.site/contents/routines/${routine_id}`, updatedRoutine);
    return response.data;
  } catch (error) {
    console.error('Failed to update routine:', error);
    throw error;
  }
};

export const deleteRoutine = async (routine_id) => {
  try {
    await axios.delete(`https://api.usdiary.site/contents/routines/${routine_id}`);
  } catch (error) {
    console.error('Failed to delete routine:', error);
    throw error;
  }
};

export const patchTodo = async (todo_id, updatedTodo) => {
  try {
    const response = await axios.patch(`https://api.usdiary.site/contents/todos/${todo_id}`, updatedTodo);
    return response.data;
  } catch (error) {
    console.error('Failed to update todo:', error);
    throw error;
  }
};

export const deleteTodo = async (todo_id) => {
  try {
    await axios.delete(`https://api.usdiary.site/contents/todos/${todo_id}`);
  } catch (error) {
    console.error('Failed to delete todo:', error);
    throw error;
  }
};

// 체크리스트 페이지 전체화면 컴포넌트
const CheckList = ({ onBack }) => {
  const location = useLocation();
  const { diary } = location.state || {};

  const [routines, setRoutines] = useState([]);
  const [todos, setTodos] = useState([]);
  const [signId, setSignId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setSignId(decodedToken.signId);
        console.log('Decoded signId:', decodedToken.signId);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  const fetchRoutinesAndTodos = async () => {
    const token = localStorage.getItem('token');
    const currentDate = new Date().toISOString().split('T')[0];
  
    try {
      const routinesResponse = await axios.get('https://api.usdiary.site/contents/routines', {
        headers: { Authorization: `Bearer ${token}` },
        params: { date: currentDate }
      });
      console.log("Routines Response Data:", routinesResponse.data);
      const fetchedRoutines = Array.isArray(routinesResponse.data.data) 
        ? routinesResponse.data.data.slice(0, 3) 
        : [];
      setRoutines(fetchedRoutines);
  
      const todosResponse = await axios.get('https://api.usdiary.site/contents/todos', {
        headers: { Authorization: `Bearer ${token}` },
        params: { date: currentDate }
      });
      console.log("Todos Response Data:", todosResponse.data);
      const fetchedTodos = Array.isArray(todosResponse.data.data) 
        ? todosResponse.data.data 
        : [];
      setTodos(fetchedTodos);
  
    } catch (error) {
      console.error('Failed to fetch routines and todos:', error);
    }
  };
  
  useEffect(() => {
    // 최초 렌더링 시 데이터 가져오기
    fetchRoutinesAndTodos();
  }, []); // 처음 한 번만 실행되도록 빈 배열을 넣음

  const [showRoutine, setShowRoutine] = useState(false);
  const [showTodo, setShowTodo] = useState(false);

  // 스크롤 잠금
  useEffect(() => {
    if (showRoutine || showTodo) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showRoutine, showTodo]);

  // 루틴 팝업 열기 핸들러
  const handleRoutineArrowClick = () => {
    setShowRoutine(false);
    setShowTodo(true);
  };

  // 투두 팝업 열기 핸들러
  const handleTodoArrowClick = () => {
    setShowRoutine(true);
    setShowTodo(false);
  };

  // 팝업 닫기 핸들러
  const handlePopupClose = () => {
    setShowRoutine(false);
    setShowTodo(false);
    fetchRoutinesAndTodos();
  };

  // 루틴 제출 핸들러
  const handleRoutineSubmit = async (newRoutines) => {
    if (signId) {
      try {
        await postDiary(newRoutines, signId);
        const updatedRoutines = await axios.get('https://api.usdiary.site/contents/routines');
        setRoutines(updatedRoutines.data);
      } catch (error) {
        console.error('Failed to update routines:', error);
      }
    }
  };

  // 투두 제출 핸들러
  const handleTodoSubmit = async (newTodos) => {
    if (signId) {
      try {
        await postDiary(newTodos, signId);
        const updatedTodos = await axios.get('https://api.usdiary.site/contents/todos');
        setTodos(updatedTodos.data);
      } catch (error) {
        console.error('Failed to update todos:', error);
      }
    }
  };

  return (
    <div>
      <div className="city_back-button" onClick={onBack}>&lt;&lt;&nbsp;&nbsp;Hide</div>
      <div className="checklist">
        <div className="checklist-title">
          <div className="checklist-title-name">Check List</div>
          <div
            className="checklist-title-plusbtn"
            onClick={() => diary ? null : setShowRoutine(true)}
            style={{ cursor: diary ? 'not-allowed' : 'pointer', opacity: diary ? 0.5 : 1 }} // 비활성화 스타일
          >
            +
          </div>
        </div>

        <div className="checklist-routine">
          <div className="checklist-routine-top">
            <div className="checklist-routine-top-circle"></div>
            <div className="checklist-routine-top-name">Routine</div>
            <div className="checklist-routine-top-num">{routines.length}</div>
          </div>
          <hr />
          <div className="checklist-routine-bottom">
            {routines.length > 0 ? (
              routines.map((routine, index) => (
                <div className="checklist-routine-bottom-box" key={routine.routine_id}>
                  <div className="checklist-routine-bottom-box-toggleSwitch">
                    <input
                      type="checkbox"
                      id={`routine-toggle-${index}`}
                      hidden
                      checked={routine.is_completed}
                      readOnly
                    />
                    <label htmlFor={`routine-toggle-${index}`}>
                      <span></span>
                    </label>
                  </div>
                  <div className="checklist-routine-bottom-box-title">{routine.routine_title}</div>
                  <div className="checklist-routine-bottom-box-content">{routine.description}</div>
                </div>
              ))
            ) : (
              <div>루틴이 없습니다.</div> // 데이터가 없을 때의 메시지
            )}
          </div>
        </div>

        <div className="checklist-todo">
          <div className="checklist-todo-top">
            <div className="checklist-todo-top-circle"></div>
            <div className="checklist-todo-top-name">To Do</div>
            <div className="checklist-todo-top-num">{todos.length}</div>
          </div>
          <hr />
          <div className="checklist-todo-bottom">
            {todos.length > 0 ? (
              todos.map((todo, index) => (
                <div className="checklist-todo-bottom-box" key={todo.todo_id}>
                  <div className="checklist-todo-bottom-box-toggleSwitch">
                    <input
                      type="checkbox"
                      id={`todo-toggle-${index}`}
                      hidden
                      checked={todo.is_completed}
                      readOnly
                    />
                    <label htmlFor={`todo-toggle-${index}`}>
                      <span></span>
                    </label>
                  </div>
                  <div className="checklist-todo-bottom-box-title">{todo.todo_title}</div>
                  <div className="checklist-todo-bottom-box-content">{todo.description}</div>
                </div>
              ))
            ) : (
              <div>루틴이 없습니다.</div> // 데이터가 없을 때의 메시지
            )}
          </div>
        </div>

        {showRoutine && (
          <Routine
            routines={routines}
            onSubmit={handleRoutineSubmit}
            onClose={handlePopupClose}
            onArrowClick={handleRoutineArrowClick}
          />
        )}

        {showTodo && (
          <Todo
            todos={todos}
            onSubmit={handleTodoSubmit}
            onClose={handlePopupClose}
            onArrowClick={handleTodoArrowClick}
          />
        )}
      </div>
    </div>
  );
};

export default CheckList;
