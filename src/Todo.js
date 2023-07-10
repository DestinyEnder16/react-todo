import { v4 as uuidv4 } from 'uuid';
// import { PencilLine } from '@phosphor-icons/react';
import { PencilLine, Trash } from '@phosphor-icons/react';

import { useRef, useState } from 'react';
import { useImmerReducer } from 'use-immer';

export default function Todo() {
  // HOOKS IMPORTANT

  // just to select the input field in the DOM
  const myRef = useRef(null);

  // Getting data from the user's local storage.
  const data = JSON.parse(window.localStorage.getItem('todo'));

  const [tasks, dispatch] = useImmerReducer(tasksReducer, data || []);

  const [text, setText] = useState('');

  const [message, setMessage] = useState('welcome');

  // handles storage management
  function handleStorage(object) {
    window.localStorage.setItem('todo', JSON.stringify(object));
  }

  // This function handles the adding, deleting, filtering and deleting of tasks
  function tasksReducer(draft, action) {
    switch (action.type) {
      case 'add': {
        draft.push({ done: false, name: action.text, id: action.id });

        // update the local storage
        handleStorage(draft);
        break;
      }

      case 'delete': {
        const newTasks = data.filter((task) => task.id !== action.id);

        // update the local storage
        handleStorage(newTasks);
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
        handleStorage(newTasks);

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
            return 1;
          } else if (a.done === false && b.done === true) {
            return -1;
          } else {
            return 0;
          }
        });

        console.log(sortedTasks);
        handleStorage(sortedTasks);
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

    handleStorage(tasks);
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

  // clearing the user's local storage
  function handleClear() {
    const confirm = window.confirm('Do you really want to clear your todo?');

    if (confirm) {
      window.localStorage.clear();
      window.location.reload();
    }
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

  // setting the notification message
  let notification = '';
  if (message === 'welcome') {
    notification = 'Welcome!';
  } else if (message === 'add') {
    notification = 'New Task Added!';
  } else {
    notification = 'Task Deleted.';
  }

  return (
    <>
      <div className={`notification-bar ${message}`}>
        <span>{notification}</span>
      </div>

      <h1>Must-Do!!</h1>

      <div className="todo">
        <input
          type="search"
          placeholder="Search for a task"
          value={text}
          onChange={handleTextChange}
          disabled={data ? false : true}
        />

        <ul id={tasks ? 'todo-list' : ''}>
          {tasks
            ? tasks.map((task) => {
                return (
                  <li key={uuidv4()} className="task">
                    <div
                      onClick={() => {
                        document
                          .querySelectorAll('.action-button')
                          .forEach((task) => {
                            task.classList.toggle('visible');
                          });
                      }}
                    >
                      <input
                        type="checkbox"
                        defaultChecked={task.done ? true : false}
                        className="checkbox"
                        onChange={() => handleCheckBoxUpdate(task.id)}
                      />
                      <label>{task.name}</label>
                    </div>

                    <div id="action-button__group">
                      <Button
                        handleAction={() => {
                          handleDelete(task.id);
                          setMessage('delete');
                        }}
                        className={'action-button'}
                      >
                        <Trash size={25} color="#bb2139" />
                      </Button>

                      <Button
                        handleAction={() => handleEdit(task.id, task.name)}
                        className={'action-button'}
                        isDisabled={task.done ? true : false}
                      >
                        <PencilLine size={25} color="#1a0" />
                      </Button>
                    </div>
                  </li>
                );
              })
            : null}
        </ul>

        {/* TASK BUTTONS */}
        <div className="flex-col">
          <div id="action-buttons">
            <Button handleAction={handleClick} className={'special-button'}>
              Add New
            </Button>

            <Button handleAction={handleClear} className={'special-button'}>
              Clear
            </Button>

            <Button handleAction={handleSort} className={'special-button'}>
              Sort
            </Button>
          </div>

          <div id="input-todo">
            <input
              type="text"
              placeholder="Enter Your Task Here"
              ref={myRef}
              required
            />

            <button
              type="submit"
              onClick={(e) => {
                handleAdd(myRef.current.value);
                setMessage('add');
              }}
              className="special-button submit"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Button({ handleAction, className, children, isDisabled = false }) {
  return (
    <>
      <span
        onClick={handleAction}
        className={className}
        disabled={isDisabled}
        type="button"
      >
        {/* <PencilLine size={32} color="#2cacb5" />{' '} */}
        {children}
      </span>
    </>
  );
}
