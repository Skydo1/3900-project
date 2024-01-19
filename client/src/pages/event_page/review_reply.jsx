import { React, useState } from 'react'
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { url } from "../../utils/constants";
import "./event_page.css"
import '../Booking.css'

const CommentReply = ({ commentId, comment, onReply }) => {
  const e_id = useParams().id;
  const [reply, setReply] = useState('');
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [showEditBox, setShowEditBox] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);

  const handleToggleReplyBox = () => {
    setShowReplyBox(!showReplyBox);
  };

  const handleToggleEditBox = () => {
    setShowEditBox(!showEditBox);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const username = localStorage.getItem('username')
    const body = { username, e_id, reply, commentId }
    const headers = { 
      'Content-Type': 'application/json',
    }

    axios.post(url + '/reply_review', body, { headers })
    .then(response => {
      window.location.reload();
      onReply(commentId, response.data);
      setReply('');
      setShowReplyBox(false);
    })
    .catch(error => {
      console.error('Error saving reply:', error);
      // Handle error if needed
    });
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    const body = { commentId, editedContent }
    const headers = { 
      'Content-Type': 'application/json',
    }

    axios.post(url + '/edit_review', body, { headers })
    .then(response => {
      window.location.reload();
      onReply(commentId, response.data);
      setReply('');
      setShowEditBox(false);
    })
    .catch(error => {
      console.error('Error saving reply:', error);
      // Handle error if needed
    });
  };

  const handleDelete = async (e) => {
    const body = { commentId, e_id }
    const headers = { 
      'Content-Type': 'application/json',
    }

    axios.post(url + '/delete_review', body, { headers })
    .then(response => {
      window.location.reload();
    })
    .catch(error => {
      console.error('Error delete review:', error);
      // Handle error if needed
    });
  };

 

  return (
      <div>
        {/* Button to toggle the comment box visibility */}

        {comment.commitby === localStorage.getItem('username')
          ?<div style={{ display: 'flex' }}>
            <button className='reply-button' style={{ marginLeft: '10px' }} onClick={handleToggleEditBox}>
              {showEditBox ? 'Cancel Edit' : 'Edit'}
            </button>
            <button className='reply-button' style={{ marginLeft: '10px' }} onClick={handleDelete}>Delete</button>
            <button className='reply-button' style={{ marginLeft: '610px' }} onClick={handleToggleReplyBox}>
              {showReplyBox ? 'Cancel Reply' : 'Reply'}
            </button>
          </div>
          :<button className='reply-button' onClick={handleToggleReplyBox}>
            {showReplyBox ? 'Cancel Reply' : 'Reply'}
          </button>
        } 
        {showEditBox && (
          <form>
            <div>
              <textarea
                className='review-input'
                value={editedContent}
                placeholder='Edit your reply here......'
                onChange={(e) => setEditedContent(e.target.value)}
              ></textarea>
            </div>
            <button type="submit" className='reply-button' onClick={handleEdit}>Confirm</button>
          </form>
        )}
        {showReplyBox && (
          <form>
            <div>
              <textarea
                className='review-input'
                value={reply}
                placeholder='Type your reply here......'
                onChange={(e) => setReply(e.target.value)}
              ></textarea>
            </div>
            <button type="submit" className='reply-button' onClick={handleSubmit}>Send Reply</button>
          </form>
        )}
      </div>
  );
};

export default CommentReply;