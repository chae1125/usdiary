import React, { useState, useEffect } from 'react';
import '../../assets/css/checklist.css';
import right_arrow from '../../assets/images/right_arrow.png';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { PropTypes } from 'prop-types';

const Todo = ({ onClose, onArrowClick, onSubmit }) => {
  const [todos, setTodos] = useState([]);
  const [signId, setSignId] = useState(null);

  // Fetch to-dos for the current date
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

    const fetchTodos = async () => {
      try {
        const response = await axios.get(`https://api.usdiary.site/contents/todos`, {
          params: { date: currentDate },
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetchedTodos = Array.isArray(response.data.data) ? response.data.data.slice(0, 3) : [];
        setTodos(fetchedTodos.length > 0 ? fetchedTodos : []);
      } catch (error) {
        console.error('Failed to fetch todos:', error);
      }
    };

    fetchTodos();
  }, []);

  // Add new to-do (up to 3)
  const handleAddTodo = () => {
    if (todos.length < 3) {
      const newTodo = { todo_title: '', description: '', is_completed: false };
      setTodos((prevTodos) => [...prevTodos, newTodo]);
    } else {
      alert('To-dos can only be added up to 3 items.');
    }
  };

  // Update title or description
  const handleTodoChange = (index, field, value) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo, idx) =>
        idx === index ? { ...todo, [field === 'title' ? 'todo_title' : 'description']: value } : todo
      )
    );
  };

  // Toggle completion
  const handleToggleChange = (index) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo, idx) => (idx === index ? { ...todo, is_completed: !todo.is_completed } : todo))
    );
  };

  // Delete to-do
  const handleDeleteTodo = (index) => {
    const todoToDelete = todos[index];

    if (!todoToDelete || !todoToDelete.todo_id) {
      console.error('No to-do to delete.');
      return;
    }

    axios.delete(`https://api.usdiary.site/contents/todos/${todoToDelete.todo_id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(() => {
        setTodos((prevTodos) => prevTodos.filter((_, idx) => idx !== index));
      })
      .catch((error) => {
        console.error('Error deleting todo:', error);
      });
  };

  // Save todos
  const handleSave = async () => {
    try {
      await Promise.all(
        todos.map((todo) => {
          if (todo.todo_id) {
            return axios.delete(`https://api.usdiary.site/contents/todos/${todo.todo_id}`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
          }
          return Promise.resolve();
        })
      );

      const newTodosPromises = todos
        .filter(todo => todo.todo_title || todo.description)
        .map((todo) => {
          const formattedDate = new Date().toISOString().split('T')[0];

          return axios.post(
            "https://api.usdiary.site/contents/todos",
            {
              todo_title: todo.todo_title,
              description: todo.description,
              is_completed: todo.is_completed,
              date: formattedDate,
            },
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
          );
        });

      const createdTodos = await Promise.all(newTodosPromises);
      console.log("New todos added:", createdTodos.map((res) => res.data));
    } catch (error) {
      console.error("Error saving todos:", error);
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
          <div className="todo">
            <div className="todo-top">
              <div className="todo-top-title">
                <div className="todo-top-title-circle"></div>
                <div className="todo-top-title-name">To Do</div>
              </div>
              <img src={right_arrow} className="routine-arrow" alt="right_arrow" onClick={onArrowClick} />
            </div>
            <hr />
            <div className="todo-middle">
              {todos.map((todo, index) => (
                <div className="todo-middle-box" key={index}>
                  <div className="todo-middle-box-1">
                    <input
                      type="checkbox"
                      id={`toggle-${index}`}
                      hidden
                      checked={todo.is_completed}
                      onChange={() => handleToggleChange(index)}
                    />
                    <label htmlFor={`toggle-${index}`} className="todo-middle-box-toggleSwitch">
                      <span className="todo-middle-box-toggleButton"></span>
                    </label>
                  </div>
                  <div className="todo-middle-box-2">
                    <input
                      className="todo-middle-box-title"
                      type="text"
                      placeholder="To do"
                      value={todo.todo_title || ""}
                      onChange={(e) => handleTodoChange(index, 'title', e.target.value)}
                      spellCheck="false"
                    />
                  </div>
                  <div className="todo-middle-box-3">
                    <input
                      className="todo-middle-box-content"
                      type="text"
                      placeholder="내용을 입력하시오."
                      value={todo.description || ''}
                      onChange={(e) => handleTodoChange(index, 'description', e.target.value)}
                      spellCheck="false"
                    />
                  </div>
                  <div className="todo-middle-box-delete" onClick={() => handleDeleteTodo(index)}>
                    삭제
                  </div>
                </div>
              ))}
              {todos.length < 3 && (
                <div className="todo-middle-plusbtn" onClick={handleAddTodo}>
                  투두 추가하기
                </div>
              )}
            </div>
            <div className="todo-savebtn" onClick={handleSave}>Save</div>
          </div>
        </div>
      </div>
    </div>
  );
};

Todo.propTypes = {
  onClose: PropTypes.func.isRequired,
  onArrowClick: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default Todo;

export const deleteTodo = async (todo_id) => {
  try {
    await axios.delete(`https://api.usdiary.site/contents/todos/${todo_id}`);
  } catch (error) {
    console.error('Failed to delete todo:', error);
    throw error;
  }
};

export const updateTodo = async (todo_id, todo) => {
  try {
    const response = await axios.put(`https://api.usdiary.site/contents/todos/${todo_id}`, todo);
    return response.data.data;
  } catch (error) {
    console.error('Failed to update todo:', error);
    throw error;
  }
};
