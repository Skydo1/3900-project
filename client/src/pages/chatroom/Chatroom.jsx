import React, { useState, useRef, useLayoutEffect } from 'react'
import './chatroom.css'
import { useNavigate } from "react-router-dom";
import settings from "../../images/settings.png";
import emoji from "../../images/emoji.png";
import send from "../../images/send.png";
import edit from "../../images/edit.png";
import scroll_down from "../../images/scroll_down.png";
import scroll_up from "../../images/scroll_up.png";
import { url } from "../../utils/constants";
import { toast } from 'react-toastify';
import axios from 'axios';

const Chatroom = () => {

    document.body.style.overflow='hidden'
    const [chatrooms, setChatrooms] = useState([]);
    const [message, setMessage] = useState('');
    const [group_name, setGroup_name] = useState('');
    const [member, setMember] = useState('');
    const [showchat, setShowchat] = useState(false);
    const [showedit, setShowedit] = useState(false);
    const [cid, setCid] = useState(0);
    const [currchat, setCurrchat] = useState([]);
    const [isgroup, setIsgroup] = useState(false);
    const [details, setDetails] = useState({'members': [], 'managers': []})
    const navigate = useNavigate();
    const token = localStorage.getItem('token')

    const headers = { 
        'Content-Type': 'application/json',
    }

    useState(() => {
        // Make an HTTP GET request to the backend API endpoint
        axios.post(url + "/user_chatrooms", { token }, { headers })
          .then((response) => {
            setChatrooms(response.data);
          })
          .catch(error => {
            console.error('Error fetching user details', error);
          })
    });

    function showEdit() {
        if (showedit) {
            setShowedit(false);
        } else {
            setShowedit(true);
        }
    }

    function displaySettings(c_id) {
        if (c_id === 0) {
            setCid(0)
            setIsgroup(false)
        } else {
            axios.post(url + "/chatroom_details", { token, c_id }, { headers })
            .then((response) => {
                setDetails(response.data)
            })
            .catch(error => {
                console.error('Error fetching user details', error);
            })
            setShowchat(false);
            setIsgroup(true)
        }
        setShowchat(false);
    }

    function displayChat(c_id) {
        axios.post(url + "/load_messages", { token, c_id }, { headers })
          .then((response) => {
            setCid(c_id)
            setCurrchat(response.data);
            console.log(response.data)
            setShowedit(false);
          })
          .catch(error => {
            console.error('Error fetching user details', error);
          })
        setShowchat(true);
    }

    function createChatroom() {
        axios.post(url + "/create_chatroom", { token, roomname: group_name }, { headers })
            .then((response) => {
                window.location.reload()
            })
            .catch(error => {
                console.error('Error cancel hosted event', error);
            });
    }

    function sendMsg() {
        axios.post(url + "/send_message", { token, c_id: cid, message }, { headers })
            .then((response) => {
                setMessage("")
                displayChat(cid)               
            })
            .catch(error => {
                console.error('Error cancel hosted event', error);
            });
    }

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
          sendMsg()
        }
    }

    function addMember() {
        axios.post(url + "/chatroom_invite", { token, c_id: cid, username: member }, { headers })
        .then((response) => {
            displaySettings(cid)
        })
        .catch(error => {
            console.error('Error cancel hosted event', error);
        });
        setMember('')
    }

    function createDM() {
        axios.post(url + "/send_dm", { token, username: member }, { headers })
        .then((response) => {
            window.location.reload()
        })
        .catch(error => {
            console.error('Error cancel hosted event', error);
        });
        setMember('')
    }

    function leaveChat() {
        axios.post(url + "/leave_chat", { token, c_id: cid }, { headers })
        .then((response) => {
            window.location.reload()
        })
        .catch(error => {
            console.error('Error cancel hosted event', error);
        });
    }

    function addManager(username) {
        axios.post(url + "/add_manager", { token, c_id: cid, username }, { headers })
        .then((response) => {
            displaySettings(cid)
        })
        .catch(error => {
            console.error('Error cancel hosted event', error);
        });
    }

    function removeManager(username) {
        axios.post(url + "/remove_manager", { token, c_id: cid, username }, { headers })
        .then((response) => {
            displaySettings(cid)
        })
        .catch(error => {
            console.error('Error cancel hosted event', error);
        });
    }

    function removeMember(username) {
        axios.post(url + "/remove_member", { token, c_id: cid, username }, { headers })
        .then((response) => {
            displaySettings(cid)
        })
        .catch(error => {
            console.error('Error cancel hosted event', error);
        });
    }

    function removeMsg(message_id) {
        axios.post(url + "/remove_message", { token, c_id: cid, message_id:message_id }, { headers })
        .then((response) => {
            displayChat(cid)
            toast.success("Message removed")
        })
        .catch(error => {
            console.error('Error cancel hosted event', error);
        });
    }

    function pinMsg(message_id, isPin) {
        if (isPin) {
            axios.post(url + "/unpin_message", { token, c_id: cid, message_id:message_id }, { headers })
            .then((response) => {
                displayChat(cid)
                toast.success("Message unpinned")
            })
            .catch(error => {
                console.error('Error cancel hosted event', error);
            });
        } else {
            axios.post(url + "/pin_message", { token, c_id: cid, message_id:message_id }, { headers })
            .then((response) => {
                displayChat(cid)
                toast.success("Message pinned")
            })
            .catch(error => {
                console.error('Error cancel hosted event', error);
            });
        }
    }

    const chat_bottom = useRef(null);
    const chat_top = useRef(null);

    const scrollToTop = () => {
        chat_top?.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToBottom = () => {
        chat_bottom?.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useLayoutEffect(() => {
        if (showedit) {
            return;
        } else if (showchat) {
            chat_bottom?.current?.scrollIntoView({ behavior: 'smooth' });
        } else {
            chat_top?.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }); 

    return (

        <div className="split-screen">
            <div className="left-pane">
                {chatrooms.map((item) => (
                    <div className="chat-group" onClick={() => displayChat(item.c_id)}>
                        <h2>{item.name}</h2>
                    </div>
                ))}
                <button className="group-create-button" onClick={() => displaySettings(0)}>OPEN A NEW CHAT</button>
            </div>
            <div className="right-pane">
                <div className="chat-top">
                    <img
                    src={settings} alt="images"
                    className="settings"
                    onClick={() => displaySettings(cid)}/>
                    <img
                    src={edit} alt="images"
                    className="settings"
                    onClick={showEdit}/>
                    <img
                    src={scroll_up} alt="images"
                    className="settings"
                    onClick={scrollToTop}/>
                    <img
                    src={scroll_down} alt="images"
                    className="settings"
                    onClick={scrollToBottom}/>
                </div>
                <div className = "tiny-space" ref={chat_top}></div>
                {!showchat?
                    <div>
                        {!isgroup?
                            <div>
                                <h1 className="create-chat">Create a group</h1>
                                <div className="group-name-container">
                                    <label className="group-name-label">Group Name:</label>
                                    <input
                                        className= "group-name"
                                        type="message"
                                        value={group_name}
                                        placeholder='Your group name'
                                        onChange={(e) => setGroup_name(e.target.value)}
                                    />
                                    <button className="group-name-change" onClick={createChatroom}>CREATE</button>
                                </div>
                                <h1 className="create-chat">Send a private message</h1>
                                <div className="group-name-container">
                                    <label className="group-name-label">Username:</label>
                                    <input
                                        className= "group-name"
                                        type="message"
                                        value={member}
                                        placeholder='Their username here'
                                        onChange={(e) => setMember(e.target.value)}
                                    />
                                    <button className="group-name-change" onClick={createDM}>CREATE</button>
                                </div>
                            </div>
                        
                        :
                            <div>
                                <div className="group-name-container">
                                    <label className="group-name-label">Group Name:</label>
                                    <input
                                        className= "group-name"
                                        type="message"
                                        value={group_name}
                                        placeholder={details.name}
                                        onChange={(e) => setGroup_name(e.target.value)}
                                    />
                                    <button className="group-name-change" onClick={createChatroom}>change</button>
                                </div>
                                <div className="group-members-container">
                                    <h3>Created by: {details.creator}</h3>
                                    <h3>Admin:</h3>
                                    {details.managers.map((item) => (
                                        <div className="member-container">
                                            <h4>{item}</h4>
                                            <div className="member-button-container">
                                                <button className="member-button" onClick={() => removeManager(item)}>demote</button>
                                            </div>
                                        </div>
                                    ))}
                                    <h3>Group Members:</h3>        
                                    {details.members.map((item) => (
                                        <div className="member-container">
                                            <h4>{item.username}</h4>
                                            <div className="member-button-container">
                                                <button className="member-button" onClick={() => addManager(item.username)}>promote</button>
                                                <button className="member-button" onClick={() => removeMember(item.username)}>kick</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="group-name-container">
                                    <label className="group-name-label">Invite members:</label>
                                    <input
                                        className= "group-name"
                                        type="message"
                                        value={member}
                                        placeholder="Username of new member"
                                        onChange={(e) => setMember(e.target.value)}
                                    />
                                    <button className="group-name-change" onClick={addMember}>ADD</button>
                                </div>
                                <button className="group-create-button" onClick={leaveChat}>leave group</button>
                                <div className="space"></div>
                            </div>
                        
                        }
                    </div>
                    :<div>
                        {currchat.map((item) => (
                            <div>
                                {!item.isPin?
                                    <div>
                                        {!item.isSender?
                                            <div className="chat-content round chat-left">
                                                <h4>{item.sender}:</h4>
                                                <p>{item.content}</p>
                                            </div>
                                        :
                                            <div className="chat-content round chat-right">
                                                <h4>{item.sender}:</h4>
                                                <p>{item.content}</p>
                                            </div>
                                        }
                                    </div>
                                :
                                    <div>
                                        <div className="chat-content round chat-pin">
                                            <h3>PINNED</h3>
                                            <h4>{item.sender}:</h4>
                                            <p>{item.content}</p>
                                        </div>
                                    </div>
                                }
                                {!showedit?
                                    <div></div>
                                :
                                    <div className="message-edit-container">
                                        <button className="member-button" onClick={() => pinMsg(item.id, item.isPin)}>PIN/UNPIN</button>
                                        <button className="member-button" onClick={() => removeMsg(item.id)}>DELETE</button>
                                    </div>
                                }
                            </div>
                        ))}
                        <div className="space" ></div>
                        <div className = "tiny-space" ref={chat_bottom}></div>
                        <div className="chat-bottom">
                            <img
                            src={emoji} alt="images"
                            className="emoji"/>
                            <input
                                className="message-box round"
                                type="message"
                                value={message}
                                placeholder='Type a message'
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <img
                            src={send} alt="images"
                            onClick={sendMsg}
                            className="send"/>
                        </div>
                    </div>
                }
            </div>
        </div>
    )
}

export default Chatroom