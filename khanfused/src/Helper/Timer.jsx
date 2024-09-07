import React, { useState, useEffect } from 'react';
import './Timer.css'; 
import timer from '../Assets/timer.svg';

const Timer = ({ duration, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (onTimeUp) {
        onTimeUp();
      }
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, onTimeUp]);

  return (
    <div className="timer-container">
      <img
      src={timer}
      alt="Timer Icon"
      className={`timer-icon ${timeLeft <= 5 ? 'shake' : ' '}`} 
      />
      <span className={`timer-text" ${timeLeft <= 5 ? 'red-text' : 'timer-text'}`}> {timeLeft}</span>
    </div>
  );
};


export default Timer;