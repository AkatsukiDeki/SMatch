// src/components/chat/StickerPicker.js
import React, { useState } from 'react';
import './StickerPicker.css';

const StickerPicker = ({ onStickerSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const stickers = [
    '😊', '😂', '🥰', '😎', '🤔', '👏', '🎉', '🚀',
    '📚', '🎓', '💡', '⭐', '🔥', '💯', '❤️', '👍',
    '👋', '🎯', '💪', '🤝', '🙏', '✍️', '🧠', '🌟'
  ];

  const categories = {
    'Эмоции': ['😊', '😂', '🥰', '😎', '🤔', '❤️'],
    'Действия': ['👏', '🎉', '🚀', '👍', '👋', '💪'],
    'Учеба': ['📚', '🎓', '💡', '⭐', '✍️', '🧠'],
    'Разное': ['🔥', '💯', '🎯', '🤝', '🙏', '🌟']
  };

  const handleStickerClick = (sticker) => {
    onStickerSelect(sticker);
    setIsOpen(false);
  };

  return (
    <div className="sticker-picker">
      <button
        className="sticker-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Стикеры"
      >
        😊
      </button>

      {isOpen && (
        <div className="sticker-popup">
          <div className="sticker-header">
            <h4>Выберите стикер</h4>
            <button
              className="close-btn"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>

          <div className="sticker-categories">
            {Object.entries(categories).map(([category, categoryStickers]) => (
              <div key={category} className="sticker-category">
                <h5>{category}</h5>
                <div className="sticker-grid">
                  {categoryStickers.map((sticker, index) => (
                    <button
                      key={index}
                      className="sticker-btn"
                      onClick={() => handleStickerClick(sticker)}
                    >
                      {sticker}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StickerPicker;