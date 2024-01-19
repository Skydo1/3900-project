import React, { useState, useEffect, useRef} from "react";
import { useLocation } from 'react-router-dom';
import axios from "axios";
import "./Chatbot.css";
import { url } from "../../utils/constants";

const Chatbot = () => {
  const [isChatboxLarge, setIsChatboxLarge] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loadedMessagesCount, setLoadedMessagesCount] = useState(2); // 每次加载的消息数量
  const chatboxRef = useRef(null);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false); 
  const commonPhrases = [
    "recommand",
    "upcoming events",
    "my booking",
    "how do i go to",
    // Add more common phrases here
  ];
  const location = useLocation();

  const sendCommonPhrase = (phrase) => {
    // Create a new message object for the common phrase and set the sender to "user"
    const newMessage = { text: phrase, sender: "user" };

    // Append the new message to the messages state
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    // Clear the input text
    setInputText("");

    // Send the common phrase as a message to the chatbot
    const token = localStorage.getItem("username");
    const body = { token: token, message: phrase };
    const headers = {
      "Content-Type": "application/json",
    };

    axios
      .post(url + "/chat_message", body, { headers })
      .then((response) => {
        // Upon receiving a response from the chatbot, create a new message object for the bot's response
        const botResponse = { text: response.data, sender: "bot" };

        // Append the bot's response to the messages state
        setMessages((prevMessages) => [...prevMessages, botResponse]);
      })
      .catch((error) => {
        console.error("Error sending message:", error);
      });
  };

  useEffect(() => {
    // Set isChatbotOpen to true if the current path is the homepage, otherwise set it to false
    setIsChatbotOpen(location.pathname === '/');
    setIsChatboxLarge(location.pathname === '/');
    chat_history(location.pathname === '/')
  }, [location.pathname]);


  useEffect(() => {
    const savedChatHistory = JSON.parse(localStorage.getItem("chatHistory"));
    if (savedChatHistory) {
      setMessages(savedChatHistory);
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(messages));
  }, [messages]);

  const sendMessage = () => {
    if (inputText.trim() === "") return;
    const newMessage = { text: inputText, sender: "user" };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputText("");
    const token = localStorage.getItem('username');
    const body = { token: token, message: inputText }; // 更新 body 对象
    const headers = { 
      'Content-Type': 'application/json',
    };
    axios.post(url + "/chat_message", body, { headers })
      .then((response) => {
        const botResponse = { text: response.data, sender: "bot" };
        setMessages((prevMessages) => [...prevMessages, botResponse]);
      })
      .catch((error) => {
        console.error("Error sending message:", error);
      });
  };

  useEffect(() => {
    const chatboxElement = chatboxRef.current;
    if (chatboxElement) {
      chatboxElement.scrollTop = chatboxElement.scrollHeight;
    }
  }, [messages]);

  const loadMoreMessages = (event) => {
    const { scrollTop } = event.target;
    if (scrollTop === 0 && loadedMessagesCount < messages.length) {
      // Increase the count by a larger number to load more messages at once
      setLoadedMessagesCount((prevCount) => prevCount + 1); // You can adjust the number as needed
    }
  };
  
  const handleToggleSize = () => {
    chat_history();
    setIsChatboxLarge(!isChatboxLarge);
    setIsChatbotOpen((prevState) => !prevState);
   
  };

const chat_history =() => {
  const headers = { 
    'Content-Type': 'application/json',
  }
  const token = localStorage.getItem('username');
  axios.post(url + '/message_history' ,{token:token}, {
    headers
  })
  .then(response => {
    const newMessages = [];

    // Loop through each entry in response.data
    for (const entry of response.data) {
      // Extract bot and user messages from the entry
      const { bot, user } = entry;

      // Create message objects for bot and user
      const userResponse = { text: user, sender: "user" };
      const botResponse = { text: bot, sender: "bot" };

      // Add bot and user messages to the newMessages array
      newMessages.push(userResponse);
      newMessages.push(botResponse);
    }

    // Update the messages state using the newMessages array
    setMessages(prevMessages => [...prevMessages, ...newMessages]);

   console.log(messages);
  })
  .catch(error => {
    console.error('Error sending messages:', error);
  });
}

const formatMessageLinks = (text) => {
    // Regular expression to detect URLs in the text
    const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
  
    // Replace URLs with anchor tags and provide the URL in the href attribute
    const formattedText = text.replace(urlRegex, (url) => `<a href="${url}" target="_blank">${url}</a>`);
    return formattedText;
  };
  

  return (
    <div>
      {isChatbotOpen ?(
      <div className={`chatbot-container ${isChatboxLarge ? "large" : ""}`}>
        <div className="chattext">Hi! I am chatbot.You can ask questions here</div>
        <div className="chatbox" ref={chatboxRef} onScroll={loadMoreMessages}>
        {messages.map((message, index) => (
    <div key={index} className={`message ${message.sender}`}>
      {message.text && (
        <div dangerouslySetInnerHTML={{ __html: formatMessageLinks(message.text) }} />
      )}
            </div>
          ))}
          <div className="common-phrases">
        {commonPhrases.map((phrase, index) => (
          <button
            className="common-phrase-btn"
            key={index}
            onClick={() => sendCommonPhrase(phrase)}
          >
            {phrase}
          </button>
        ))}
      </div>
        <div className="input-container">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
          />
          <button onClick={sendMessage}>Send</button>
          <button onClick={handleToggleSize}>
            {isChatboxLarge ? "Hide" : "Expand"}
          </button>
        </div>
        </div>
        </div>
        ) : (
          <button className="open-button" onClick={handleToggleSize}>Chatbot</button>
        )}
    </div>
     
  );
};

export default Chatbot;