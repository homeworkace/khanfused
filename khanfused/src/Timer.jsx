import React, { useState, useEffect } from 'react';
import './Timer.css'; 
import timer from './Assets/timer.svg';

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
      <img src = {timer} alt = "Time Left:" className="timer-icon" />
      <span className="timer-text">{timeLeft}</span>
    </div>
  );
};

export default Timer;
