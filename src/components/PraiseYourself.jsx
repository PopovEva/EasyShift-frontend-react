// src/components/PraiseYourself.jsx
import React, { useState } from 'react';
import Confetti from 'react-confetti';

const PraiseYourself = ({
  buttonLabel = "Praise Yourself!",
  confettiDuration = 5000,
  buttonClass = "btn btn-info"
}) => {
  const [showConfetti, setShowConfetti] = useState(false);

  const handlePraise = () => {
    setShowConfetti(true);
    // Отключаем конфетти через confettiDuration миллисекунд
    setTimeout(() => {
      setShowConfetti(false);
    }, confettiDuration);
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Показываем конфетти, если showConfetti = true */}
      {showConfetti && (
        <Confetti
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999 }}
        />
      )}
      {/* Кнопка, запускающая конфетти */}
      <button className={buttonClass} onClick={handlePraise}>
        {buttonLabel}
      </button>
    </div>
  );
};

export default PraiseYourself;