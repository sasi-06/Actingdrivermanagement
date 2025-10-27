import React,{ useState,useEffect } from 'react';
import './RatingModal.css';

const RatingModal = ({ bookingId,onSubmit,onClose }) => {
  const [rating,setRating] = useState(0);
  const [feedback,setFeedback] = useState('');
  const [hoveredRating,setHoveredRating] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if(rating === 0) {
      console.error('Please select a rating');
      return;
    }
    onSubmit(rating,feedback);
  };

  const handleRatingClick = (value) => {
    setRating(value);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="rating-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Rate Your Trip</h2>
        <p>How was your experience?</p>
        <div className="star-rating">
          {[1,2,3,4,5].map((star) => (
            <span
              key={star}
              className={`star ${(hoveredRating || rating) >= star ? 'filled' : ''}`}
              onClick={() => handleRatingClick(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
            >
              ★
            </span>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="rating-form">
          <div className="form-group">
            <label>Feedback (Optional)</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your experience..."
              rows="4"
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Skip
            </button>
            <button type="submit" className="submit-button">
              Submit Rating
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;
