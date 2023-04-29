// import { useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { useRef, useState } from 'react';
import { useImmerReducer } from 'use-immer';
// import useImmerReducer from 'use'

export default function Todo() {
  // HOOKS IMPORTANT
  const myRef = useRef(null);

  const data = JSON.parse(window.localStorage.getItem('todo'));

  const [tasks, dispatch] = useImmerReducer(tasksReducer, data || []);

  const [text, setText] = useState('');

  const [state, setState] = useState('welcome');

  function tasksReducer(draft, action) {
    switch (action.type) {
      case 'add': {
        draft.push({ done: false, name: action.text, id: action.id });
        window.localStorage.setItem('todo', JSON.stringify(draft));
        break;
      }

      case 'delete': {
        const newTasks = data.filter((task) => task.id !== action.id);
        window.localStorage.setItem('todo', JSON.stringify(newTasks));
        return newTasks;
      }

      case 'update': {
        let foundTask = data.find((task) => {
          if (task.id === action.id) {
            return task;
          } else {
            return false;
          }
        });

        foundTask.done = true;

        const newTasks = data.filter((task) => task.id !== action.id);
        newTasks.push(foundTask);
        window.localStorage.setItem('todo', JSON.stringify(newTasks));

        break;
      }

      case 'search': {
        let foundTask = [];

        if (action.info !== 'retrieve') {
          let task = data.find((task) =>
            task.name.toLowerCase().includes(action.text.toLowerCase())
              ? task
              : false
          );
          task !== undefined ? foundTask.push(task) : foundTask.push(...data);
        }

        return foundTask ? foundTask : data;
      }

      case 'sort': {
        const sortedTasks = data.sort((a, b) => {
          if (a.done === true && b.done === false) {
            return -1;
          } else if (a.done === false && b.done === true) {
            return 1;
          } else {
            return 0;
          }
        });

        console.log(sortedTasks);
        window.localStorage.setItem('todo', JSON.stringify(sortedTasks));
        return sortedTasks;
      }

      case 'retrieve': {
        return data;
      }

      default: {
        console.error('Action is unidentified');
      }
    }
  }

  function handleClick() {
    document.querySelector('#input-todo').classList.add('active');
    myRef.current.focus();
  }

  function handleDelete(taskId, task) {
    dispatch({
      type: 'delete',
      id: taskId,
      text: task,
    });

    window.localStorage.setItem('todo', JSON.stringify(tasks));
  }

  function handleEdit(id, text) {
    handleDelete(id);
    handleClick();
    myRef.current.value = text;
  }

  function handleAdd(text) {
    if (text.length > 1) {
      dispatch({
        type: 'add',
        id: uuidv4(),
        text: text,
      });

      myRef.current.value = '';
      document.querySelector('#input-todo').classList.remove('active');
    } else {
      myRef.current.focus();
    }
  }

  function handleTextChange(e) {
    const text = e.target.value;
    console.log(text);
    setText(text);

    if (text.length === 0) {
      dispatch({ type: 'retrieve' });
    } else {
      dispatch({
        type: 'search',
        text,
      });
    }
  }

  function handleClear() {
    window.localStorage.clear();
    window.location.reload();
  }

  function handleCheckBoxUpdate(taskId) {
    dispatch({
      type: 'update',
      id: taskId,
    });
  }

  function handleSort() {
    dispatch({
      type: 'sort',
    });
  }

  let message = '';
  if (state === 'welcome') {
    message = 'Welcome!';
  } else if (state === 'add') {
    message = 'New Task Added!';
  } else {
    message = 'Task Deleted.';
  }

  return (
    <>
      <div className={`notification-bar ${state.toLowerCase()}`}>
        <span>{message}</span>
      </div>

      <h1>Todo!</h1>
      <div className="todo">
        <input
          type="search"
          placeholder="Search for a task"
          value={text}
          onChange={handleTextChange}
          disabled={data ? false : true}
        />

        <ul id="todo-list">
          {tasks
            ? tasks.map((task) => {
                return (
                  <li key={uuidv4()} className="task">
                    <div
                      onClick={() => {
                        document
                          .querySelectorAll('.action-button')
                          .forEach((button) => {
                            button.classList.toggle('visible');
                          });
                      }}
                      id="task"
                    >
                      <input
                        type="checkbox"
                        defaultChecked={task.done ? true : false}
                        className="checkbox"
                        onChange={() => handleCheckBoxUpdate(task.id)}
                      />
                      <span>{task.name}</span>
                    </div>

                    <div id="action-button__group">
                      <Button
                        handleAction={() => {
                          handleDelete(task.id);
                          setState('delete');
                        }}
                        className={'special-button action-button'}
                      >
                        Delete Task
                      </Button>

                      <Button
                        handleAction={() => handleEdit(task.id, task.name)}
                        className={'special-button action-button'}
                        isDisabled={task.done ? true : false}
                      >
                        Edit Task
                      </Button>
                    </div>
                  </li>
                );
              })
            : null}
        </ul>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-evenly',
            marginTop: '5rem',
          }}
        >
          <Button handleAction={handleClick} className={'special-button'}>
            Add A New Task
          </Button>

          <Button handleAction={handleClear} className={'special-button'}>
            Clear Tasks
          </Button>

          <Button handleAction={handleSort} className={'special-button'}>
            Sort Tasks
          </Button>
        </div>

        <div id="input-todo">
          <input
            type="text"
            placeholder="Enter Your Text Here"
            ref={myRef}
            required
          />

          <button
            type="submit"
            onClick={(e) => {
              handleAdd(myRef.current.value);
              setState('add');
            }}
            className="special-button"
          >
            Submit
          </button>
        </div>
      </div>
    </>
  );
}

function Button({ handleAction, className, children, isDisabled = false }) {
  return (
    <>
      <button
        onClick={handleAction}
        className={className}
        disabled={isDisabled}
      >
        {children}
      </button>
    </>
  );
}
