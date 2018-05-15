/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import RequestErrorMsg from "#SRC/js/components/RequestErrorMsg";

export const Error = ({error}) => {
  const message = error || "Unknown error";

  return (
    <div className="error-class">
      <RequestErrorMsg header={"Ups!"} message={message} />
    </div>
  );
};

export const AddTask = ({placeholder, onTaskAdd}) => {
  const onKeyHandler = (evt) => {
    if (evt.key === "Enter") {
      onTaskAdd(evt.target.value);
      evt.target.value = "";
    }
  };

  return (
    <header className="header">
      <input
        className="new-todo"
        autoComplete="off"
        placeholder={placeholder}
        onKeyPress={onKeyHandler}
      />
    </header>
  );
};

export const Loading = () => {
  return (<div className="cssload-thecube">
    Loading!
    <div className="cssload-cube cssload-c1"/>
    <div className="cssload-cube cssload-c2"/>
    <div className="cssload-cube cssload-c4"/>
    <div className="cssload-cube cssload-c3"/>
  </div>);
};

export const TaskItem = ({task, id, removeTask}) => {
  return (
    <li className="todo" key={id}>
      <div className="view">
        <input
          className="toggle"
          type="checkbox"
        />
        <label>{task.value}</label>
        <button className="destroy destroy-always" onClick={removeTask}/>
      </div>
    </li>
  );
};

export const TaskList = ({tasks, onTaskDelete}) => {
  const removeTask = id => () => {
    onTaskDelete(id);
  };

  return (
    <ul className="todo-list">
      {tasks.map((task) => {
        return <TaskItem key={task.id} task={task} removeTask={removeTask(task.id)}/>;
      })}
    </ul>
  );
};

export const Tasks = ({tasks, placeholder, onTaskAdd, onTaskDelete}) => {
  return (
    <div>
      <section className="todoapp">
        <AddTask placeholder={placeholder} onTaskAdd={onTaskAdd} />
        <TaskList tasks={tasks} onTaskDelete={onTaskDelete} />
      </section>
    </div>
  );
};
