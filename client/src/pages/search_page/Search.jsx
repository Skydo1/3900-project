import React, { useState, useEffect } from 'react'
import 'react-datepicker/dist/react-datepicker.css';
import { url } from "../../utils/constants";
import axios from 'axios';
import '../discovery.css'

const Search = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterOption, setFilterOption] = useState('');
    const [searchTops, setsearchTops] = useState([]);
    const [search, setSearch] = useState('')

    const headers = { 
      'Content-Type': 'application/json',
    }

    useState(() => {
      // Make an HTTP GET request to the backend API endpoint
      axios.get(url + "/display_search", { headers })
        .then((response) => {
          setSearch(response.data)
          console.log(response.data)
        })
        .catch(error => {
          console.error('Error fetching search details', error);
        })
    });

    const searchData = {
      searchTerm,
      filterOption
    };

      useEffect(() => {
        axios.post(url + '/discovery', searchData, { headers })
          .then(response => {
            const data = response.data;
            setsearchTops(data);
          })
          .catch(error => {
            console.error('Error fetching search detail:', error);
          });
      }, []);

      const discovery_searchTerm_title = () => {
        const headers = { 
          'Content-Type': 'application/json',
        }
        axios.post(url + '/discovery/title/' + searchTerm, searchData,{
          headers
        })
        .then(response => {
          const data = response.data;;
          setsearchTops(data);
        })
        .catch(error => {
          console.error('Error fetching search detail:', error);
        });
      };
      
      const discovery_searchTerm_date = () => {
        const headers = { 
          'Content-Type': 'application/json',
        }
        axios.post(url + '/discovery/date/' + searchTerm, searchData,{
          headers
        })
        .then(response => {
          const data = response.data;;
          setsearchTops(data);
        })
        .catch(error => {
          console.error('Error fetching search details:', error);
        });
      };
  


  return (
    <div className="search-page">
      <div className="search-bar">
        <input
          type="text"
          placeholder="SEARCH..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={filterOption}
          onChange={(e) => setFilterOption(e.target.value)}
        >
          <option>all</option>
          <option>Concert</option>
            <option>Dinner</option>
            <option>Festival</option>
            <option>Networking/Gathering</option>
            <option>Party</option>
            <option>Seminar/Talk</option>
            <option>Sport</option>
            <option>Other</option>
        </select>
        <button
          type="button"
          onClick={() => {
            // Check if searchTerm contains letters or numbers using a regular expression
            const containsLettersOrNumbers = /[a-zA-Z0-9]/.test(searchTerm);
            if (!searchTerm || !containsLettersOrNumbers) {
              return; // Return early without performing the search
            }
            discovery_searchTerm_title();
          }}
          disabled={!searchTerm}
        >
        SEARCH
      </button>
      </div>
      <div style={{ display: 'flex' }}>
      <div style={{ flex: 1.5 }}>
          <div className="filter-button">
            <button type="button" onClick={discovery_searchTerm_title} disabled={!searchTerm} >FILTER BY TITLE</button>
          </div>
          <div className="filter-button">
            <button type="button" onClick={discovery_searchTerm_date} disabled={!searchTerm}>FILTER BY DATE</button>
          </div>
      </div>
      
        <div style={{ flex: 20}}>  
            <ul className="results-list">
              {searchTops.map((item) => (
                <li key={item.id} className="result-item">
                  <h2 className="result-title">
                  <a href={"/event/" + item.e_id}>
                    Title: {item.title}
                    </a></h2>
                  <div className="result-container">
                    <img 
                      src={url + search[item.e_id]}
                      className="search-img"/>
                    <div className="result-details">
                      <h3>Location: {item.location}</h3>
                      <h3>Date: {new Date(item.date).toString().replace(/ *\([^)]*\) */g, "")}</h3>
                      <h3>Description: {item.description}</h3>
                    </div>
                  </div>
                </li>
              ))}
              </ul>
        </div>
      </div>
        
    </div>

  )
}
export default Search;