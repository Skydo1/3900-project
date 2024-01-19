import { React, useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { url } from "../../utils/constants";
import "./event_page.css"
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import '../Booking.css'
import CommentForm from './review_system';
// import RecursiveList from './review_list';
import CommentReply from './review_reply';

const Event_page = () => {

  const navigate = useNavigate();
  const e_id = useParams().id;
  const [data, setData] = useState("");
  const [banner, setBanner] = useState('')
  const [seatmap, setSeatmap] = useState('')
  const [reviewList, setReviewList] = useState([])
  const [aveRate, setAveRate] = useState('')

  const body = { e_id };
  const headers = { 
    'Content-Type': 'application/json',
  }

  useState(() => {
    // Make an HTTP GET request to the backend API endpoint
    axios.post(url + "/display_banner", body, { headers })
      .then((response) => {
        setBanner(response.data)
      })
      .catch(error => {
        console.error('Error fetching event details', error);
      })
  });

  useState(() => {
    // Make an HTTP GET request to the backend API endpoint
    axios.post(url + "/api/event_details", body, { headers })
      .then((response) => {
        setData(response.data);
      })
      .catch(error => {
        console.error('Error fetching event details', error);
      })
  });


  useState(() => {
    // Make an HTTP GET request to the backend API endpoint
    axios.post(url + "/display_seatmap", body, { headers })
      .then((response) => {
        setSeatmap(response.data)
      })
      .catch(error => {
        console.error('Error fetching event details', error);
      })
  });

  const editEvent = () => {
    navigate('/event_edit/' + e_id)
  }

  const broadcast = () => {
    navigate('/broadcast/' + e_id)
  }

  const joinEvent = () => {
    navigate("/buy_ticket/" + e_id);
  };

  // insecure method
  const isHost = data.host === localStorage.getItem('username')

  var start = new Date(data.start).toString().replace(/ *\([^)]*\) */g, "");
  var end = new Date(data.end).toString().replace(/ *\([^)]*\) */g, "");


  useState(() => {
    // Make an HTTP GET request to the backend API endpoint
    axios.post(url + "/get_av_rate", {e_id}, { headers })
      .then((response) => {
        setAveRate(response.data)
      })
      .catch(error => {
        console.error('Error fetching event details', error);
      })
  });

  useEffect(() => {
    axios.post(url + '/get_review', { e_id }, { headers })
      .then(response => {
        const data = response.data;
        setReviewList(data)
      })
      .catch(error => {
        console.error('Error fetching reviews:', error);
      });
  }, []);

  const handleNewToOldSort = () => {
    const headers = { 
      'Content-Type': 'application/json',
    }
    axios.post(url + '/ntoo_reviews', { e_id },{
      headers
    })
    .then(response => {
      console.log(response.data)
      const data = response.data;
      setReviewList(data);

    })
    .catch(error => {
      console.error('Error fetching recommendations:', error);
    });
  };

  const handleOldToNewSort = () => {
    const headers = { 
      'Content-Type': 'application/json',
    }
    axios.post(url + '/oton_reviews', { e_id },{
      headers
    })
    .then(response => {
      console.log(response.data)
      const data = response.data;
      setReviewList(data);

    })
    .catch(error => {
      console.error('Error fetching recommendations:', error);
    });
  };

  const handleReplySort = () => {
    const headers = { 
      'Content-Type': 'application/json',
    }
    axios.post(url + '/most_replied_reviews', { e_id },{
      headers
    })
    .then(response => {
      console.log(response.data)
      const data = response.data;
      setReviewList(data);

    })
    .catch(error => {
      console.error('Error fetching reviews:', error);
    });
  };

  const addComment = (comment) => {
    setReviewList([...reviewList, comment]);
  };

  function findCommentById(commentList, id) {
    for (const comment of commentList) {
      if (comment.id === id) {
        return comment;
      }
      if (comment.sub_comments.length > 0) {
        const subComment = findCommentById(comment.sub_comments, id);
        if (subComment) {
          return subComment;
        }
      }
    }
    return null;
  }

  const handleReply = ({ commentId, new_comment }) => {
    // Find the comment with the given commentId and add the reply
    const updatedComments = reviewList.map((comment) =>
      findCommentById(reviewList, commentId)
        ? comment.sub_comments.push(new_comment)
        : comment
    );
    setReviewList(updatedComments)
  };

  const RecursiveList = ({ data }) => {
    return (
      <div>
        {data.map((review) => (
          <div key={review} style={{ display: 'grid'}}>
            <div style={{ display: 'flex' }}>
              <div style={{ flex: 0.53 }}>
                {review.commentTo === '' && <strong>{review.commitby}</strong>}
                {review.commentTo === '' || <strong>{review.commitby} Replied To {review.commentTo}</strong>}
              </div>
              <strong>Created On {(new Date(review.date).toString().replace(/ *\([^)]*\) */g, ""))}</strong>
            </div>
            
            <div className='single-review'>
              <p>{review.content}</p>
            </div>
            <CommentReply commentId={review.id} comment={review} onReply={handleReply}/>
            {review.sub_comments.length > 0 && <RecursiveList data={review.sub_comments} />}
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div>
      <img 
        src={url + banner}
        className="banner"/>
      <br/>
      <h1>{data.title}</h1>
      <div className="stars" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-20px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            className={`star ${star <= aveRate ? 'selected' : ''}`}
          >
            ★
          </span>
        ))}
      </div>
      <div className='event-details'>
        <h2>Event Details</h2>
        {!isHost?
          <button className="join-button" type="button" onClick={joinEvent}>Join event</button>
        : <div className="button-container" >
            <button className="join-button" type="button" onClick={editEvent}>Edit Details</button>
            <button className="join-button" type="button" onClick={broadcast}>Broadcast message</button>
        </div>
        }

      </div>
      <div className="background-box">
        <h3>Host: {data.host}</h3>
        <h3>Location: {data.location}</h3>
        <h3>Time: {start} - {end}</h3>
        <h3>Type: {data.type}</h3>
      </div>
      <h2>About this event</h2>
      <h3>{data.desc}</h3>
      {seatmap && (
        <img 
        src={url + seatmap}
        className="seatmap" disabled={!seatmap}/>
      )}
      

      <br/>
      <CommentForm onAddComment={addComment} />

      <div className='sort-button-container'>
        <button className='sort-button' type="button" onClick={handleNewToOldSort}>Newest To Oldest</button>
        <button className='sort-button' type="button" onClick={handleOldToNewSort}>Oldest To Newest</button>
        <button className='sort-button' type="button" onClick={handleReplySort}>Most Replied</button>
        
      </div>
    
      <br/>
      <div className='review-container'>
        {reviewList.map((comment) => (
          <div key={comment.id} style={{ display: 'grid'}}>
            <div style={{ display: 'flex' }}>
              <div style={{ flex: 0.53 }}>
                <strong>{comment.commitby}</strong>
              </div>
              <strong>Created On {(new Date(comment.date).toString().replace(/ *\([^)]*\) */g, ""))}</strong>
            </div>
            <div className='single-review'>
              <p>{comment.content} </p>
              <div className="stars" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-20px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    className={`star ${star <= comment.rate ? 'selected' : ''}`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
            <CommentReply commentId={comment.id} comment={comment} onReply={handleReply}/>
            <RecursiveList data={comment.sub_comments} />
          </div>
        ))}
      </div>
      <br/>
      <br/>
      <br/>
    </div>
  )
}


export default Event_page