import { React, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { url } from "../../utils/constants";
import "./event_page.css"
import '../Booking.css'

const CommentForm = ({ onAddComment }) => {
  const e_id = useParams().id;
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const username = localStorage.getItem('username')
    const body = { username, e_id, review, rating }
    const headers = { 
      'Content-Type': 'application/json',
    }
    try {
      // Make a POST request to your backend API to add the comment
      const response = await axios.post('/review', body, { headers });

      // Call the callback function to add the comment to the frontend
      onAddComment(response.data);
      
      // Clear the form fields after submitting
      setReview('')
      setRating(0)
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <form>
      <h2>Reviews</h2>
      <div style={{borderTop: '1px solid #aaa', width: '1000px'}}></div>
      <div className='review-container'>
        <h3>Your Rating And Review</h3>
        <div className="rating-container">
          <div className="stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${star <= rating ? 'selected' : ''}`}
                onClick={() => setRating(star)}
              >
                ★
              </span>
            ))}
          </div>
          <p>{rating} of 5</p>
        </div>
        <br/>
        <div className='Payment'>
          <textarea
            value={review}
            rows="3"
            placeholder='Type your review here......'
            className='review-input'
            onChange={(e) => setReview(e.target.value)}
          />
        </div>
        <button type="submit" className='comment-button' onClick={handleSubmit}>ADD COMMENT</button>
        
      </div>
      <div style={{borderTop: '1px solid #aaa', width: '1000px'}}></div>
      
    </form>
  );
};

export default CommentForm;