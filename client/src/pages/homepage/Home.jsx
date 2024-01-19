import React, { useState } from 'react';
import arrow_left from "../../images/arrow-left.png";
import arrow_right from "../../images/arrow-right.png";
import FullCalendar from '@fullcalendar/react' ;// must go before plugins
import dayGridPlugin from '@fullcalendar/daygrid' ;// a plugin!
import { url } from "../../utils/constants";
import axios from 'axios';
import "./Home.css"
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [recommendations, setRecommendations] = useState([""]);
  const [banner, setBanner] = useState('/api/images/home1.jpg')
  const [curr_banner, setCurr_banner] = useState(0)
  const [eTitle, setEtitle] = useState('')
  const [hyperlink, setHyperlink] = useState('')
  const navigate = useNavigate();

  const token = localStorage.getItem('token')
  const body = { token }
  const headers = { 
    'Content-Type': 'application/json',
  }

  useState(() => {
    // Make an HTTP GET request to the backend API endpoint

    const stock = [
      {'/api/images/home1.jpg': "DISCOVER WHAT'S HAPPENING"},
      {'/api/images/home2.jpg': "CREATE YOUR OWN EVENT!"},
      {'/api/images/home3.jpg': "SEARCHING FOR A SPECIFIC EVENT?"}
    ]
    setBanner('/api/images/home1.jpg')
    setEtitle("DISCOVER WHAT'S HAPPENING")
    setRecommendations(stock);

    if (token){
      axios.post(url + "/recommendation", body, { headers })
      .then((response) => {
        setRecommendations(stock.concat(response.data));
      })
      .catch(error => {
        console.error('Error fetching recommendations', error);
      })
    }
  });

  useState(() => {
    // Make an HTTP GET request to the backend API endpoint
    axios.get('/api/events')
      .then(response => {
        // Set the retrieved events in the component state
        setEvents(response.data);
      })
      .catch(error => {
        console.error('Error fetching events:', error);
      });
  }, []);

  const clickEvent = (title, start) => {
    const body2 = { title, start }
    axios.post('/api/get_event_id', body2, { headers })
      .then((response) => {
        const data = response.data;
        navigate("/event/" + data);
      })
      .catch((err) => {})

  }

  const clickRightArrow = event => {
    var next_banner = curr_banner + 1
    if (next_banner === recommendations.length) {
      next_banner = 0
      setCurr_banner(0)
    }

    if (next_banner < 3) {
      const keys= Object.keys(recommendations[next_banner])
      const stock_banner = keys[0]
      setBanner(stock_banner)
      setEtitle(recommendations[next_banner][stock_banner])
      setCurr_banner(next_banner)
    } else {
      const keys= Object.keys(recommendations[next_banner])
      const e_id = keys[0]
      const body = { e_id }
      const headers = { 
        'Content-Type': 'application/json',
      }
      axios.post(url + "/display_banner", body, { headers })
      .then((response) => {
        setBanner(response.data)
        setCurr_banner(next_banner)
        setEtitle(recommendations[next_banner][e_id])
        setHyperlink('/event/' + e_id)
      })
      .catch(error => {
        console.error('Error fetching event details', error);
      })
    }
  }

  const clickLeftArrow = event => {
    var next_banner = curr_banner - 1
    if (next_banner < 0) {
      next_banner = recommendations.length - 1
      setCurr_banner(recommendations.length - 1)
    }

    if (next_banner < 3) {
      const keys= Object.keys(recommendations[next_banner])
      const stock_banner = keys[0]
      setBanner(stock_banner)
      setEtitle(recommendations[next_banner][stock_banner])
      setCurr_banner(next_banner)
    } else {
      const keys= Object.keys(recommendations[next_banner])
      const e_id = keys[0]
      const body = { e_id }
      const headers = { 
        'Content-Type': 'application/json',
      }
      axios.post(url + "/display_banner", body, { headers })
      .then((response) => {
        setBanner(response.data)
        setCurr_banner(next_banner)
        setEtitle(recommendations[next_banner][e_id])
      })
      .catch(error => {
        console.error('Error fetching event details', error);
      })
    }
  }

  const navigateToHyperlink = event => {
    if (curr_banner === 0) {
      navigate('/search')
    } else if (curr_banner === 1 && !token) {
      navigate('/login')
    } else if (curr_banner === 1 && token)  {
      navigate('/event_create')
    } else if (curr_banner === 2) {
      navigate('/search')
    } else {
      navigate(hyperlink)
    }
  }

  return (
    <div style={{justifyContent: 'center'}}>
      <div className="banner-container">
        <img 
        src={url + banner}
        alt=""
        className="banner"/>
        <img 
        src={arrow_left} alt="images"
        className="arrow-left"
        onClick={clickLeftArrow}
        />
        <img 
        src={arrow_right} alt="images"
        className="arrow-right"
        onClick={clickRightArrow}
        />
        <h2 
        className="eTitle"
        onClick={navigateToHyperlink}>
        {eTitle}</h2>
      </div>
      <br/>
      <br/>
      <div className="calendar">
      <h1>Upcoming events</h1>
      <h2>Click on an event to get started!</h2>
      <FullCalendar
        plugins={[ dayGridPlugin ]}
        initialView="dayGridMonth"
        headerToolbar={{
          start: "title",
          center: "",
          end: "today prev,next"
        }}
        events={events}
        eventColor='#94618E'
        eventDisplay='block'
        eventClick={
          function(arg){
            var month = arg.event.start.getMonth() + 1
            if (month < 10) {
              month = '0' + month
            }
            var day = arg.event.start.getDate()
            if (day < 10) {
              day = '0' + day
            }
            clickEvent(arg.event.title, arg.event.start.toISOString().slice(0, -5))
          }
        }
      />
      </div>
    </div>
  )
}

export default Home;