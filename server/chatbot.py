from models import User, Event, Chatbot
from db import db
from datetime import datetime
import urllib.parse

def chat(message, username):
    try: 
        # check if the username is None or not 
        user = User.query.filter_by(username=username).first()
        userID = user.id
        # check if the user talked to the chatbot before    
        
        chatbots = Chatbot.query.all()
        for chatbot in chatbots:
            if chatbot.talkto == str(userID):
                print("efhwefuihwiufhwiuh")
                return start_chat(message, userID, chatbot)
        
        return new_chat(message, userID)
    except:
        return "please login first"
        

def start_chat(message, userID, chatbot):
    #pre message in dictonary
    COMMANDS = {
    "recommand": process_recommend_message,
    "suggest": process_recommend_message,
    "go": process_travel_message,
    "location": process_travel_message,
    "coming": process_upcoming_events_message,
    "my": process_user_events_message,
    "hi": process_greeting_message,
    "hello": process_greeting_message,
    "help": process_help_message,
    "joke": process_joke_message,
    "thanks": process_goodbye_message,
    "bye": process_goodbye_message,
    "fuck": process_insult_message,
    }
    # can you recoomand/ suggest me same type of event as eventtitle.
    # check if the sent message needs to be processed
    processed = False
    last_sent = ""                                   
    if chatbot.send_mess != "":
        history_sent = chatbot.send_mess.split('*')
        last_sent = history_sent[-1]

    if last_sent == "02" and "/" in message.strip():
        processed = True
        result_string = process_sent_02(message)
        

    if last_sent == "01" and ":" in message.strip():
        processed = True
        result_string = process_sent_01(message)

    if not processed:
        for key, process_func in COMMANDS.items():
            if key in message.strip().lower():
                result_string = process_func(userID)
                break
            else:
                result_string = "Don't get it, please ask again"

    
    chatbot.send_mess = chatbot.send_mess + '*' + result_string
    chatbot.rec_mess = chatbot.rec_mess + '*' + message
    db.session.commit()

    if result_string == "01":
        result_string = recommand_event_step1()
    elif result_string == "02":
        result_string = requst_event_name()
    
    return result_string


def requst_event_name():
        return"please input you location and eventtitle in format: yourlocation/eventtitle"


def new_chat(message, userID):
    newChat = Chatbot(talkto = userID)
    db.session.add(newChat)
    db.session.commit()
    return start_chat(message, userID, newChat)

def recommand_event_step1():
    return"choose what kind of recommandation do you want ? [same host? what time or what type of event] If based on Host reply host:hostname if based on time reply time:dd/mm/yy if based on type reply type:EventType"

def upcoming_or_not(event_time):
    current_datetime = datetime.now()
    datetime1 = datetime.strptime(event_time, "%Y-%m-%dT%H:%M:%S.%fZ")
    if datetime1 > current_datetime:
        return True
    else:
        return False

def compare_time(event_time, input_time):
    # Set current_datetime to a specific string representation
    current_datetime = datetime.strptime(input_time, "%d/%m/%y")

    datetime1 = datetime.strptime(event_time, "%Y-%m-%dT%H:%M:%S.%fZ")
    
    # Calculate the time difference between the two timestamps
    if datetime1.date() == current_datetime.date():
        return True
    return False

def time_difference(event_time):
    current_datetime = datetime.now()
    datetime1 = datetime.strptime(event_time, "%Y-%m-%dT%H:%M:%S.%fZ")
    return datetime1 - current_datetime

def get_google_maps_directions_url(origin, destination):
    # Replace the spaces in the locations with plus signs for the URL
    origin = urllib.parse.quote(origin)
    destination = urllib.parse.quote(destination)

    # Google Maps API base URL for directions
    base_url = "https://www.google.com/maps/dir/"

    # Combine the origin and destination to create the full URL
    full_url = f"{base_url}{origin}/{destination}"

    return full_url

def get_history(username):
    try:
        user = User.query.filter_by(username=username).first()
        userID = user.id
        chatbots = Chatbot.query.all()
        myList = []
        for chatbot in chatbots:
            if chatbot.talkto == str(userID):
                chatbot_his = chatbot.send_mess.split('*')
                user_his = chatbot.rec_mess.split('*')
                for bot_message, user_message in zip(chatbot_his, user_his):
                    if bot_message == "01":
                        this_message = "choose what kind of recommandation do you want ? [same host? what time or what type of event] If based on Host reply host:hostname if based on time reply time:dd/mm/yy if based on type reply type:EventType"
                    elif bot_message == "02":
                        this_message = "please input you location and eventtitle in format: yourlocation/eventtitle"
                    else:
                        this_message = bot_message
                    myList.append({'bot': this_message, 'user': user_message})
        return myList

    except:
        return "nothing"
    

def process_user_events_message(userID):
    re_mess = []
    flag = False
    user = User.query.filter_by(id = userID).first()
    events = user.user_event
    for event in events:
        flag = True
        re_mess.append("EventTitle: " + event.title + " http://localhost:3000/event/" + str(event.id))
    result_string = "\n".join(re_mess)
    if flag == False:
        return "you have not booked for any events"
    return result_string


def process_upcoming_events_message(userID):
     # 01 is the recommand step1()
    events = Event.query.all()
    sorted_events = sorted(events, key=lambda event: time_difference(event.start))
    flag = False
    re_mess = []
    for event in sorted_events:
        if upcoming_or_not(event.start):
            flag = True
            re_mess.append("EventTitle: " + event.title + " http://localhost:3000/event/" + str(event.id))
    result_string = "\n".join(re_mess)
    if flag:
        return result_string
    return "no events are coming"

def process_recommend_message(userID):
    return "01"

def process_travel_message(userID):
    return "02"


def process_greeting_message(userID):
    return "Hi, I am chatbot, how can i help you today?"


def process_help_message(userID):
    return "I can help you with finding events, find location and other stuffs, why don't you try to type suggest to see what I can get for you"


def process_joke_message(userID):
    return "Comp3900 is due soon, have you done it?"


def process_goodbye_message(userID):
    return "I am glad that I coudld help, see you !"

def process_insult_message(userID):
    return "you are pathetic"

def process_sent_02(message):
    parts = message.split("/")
    result1 = parts[0]
    result2 = parts[1]
    try:
        event = Event.query.filter_by(title=result2).first()
        directions_url = get_google_maps_directions_url(result1, event.location)
        result_string = str("This is the google url: " + directions_url)
    except:
        result_string = "sorry no such event"
    return result_string

def process_sent_01(message):
    parts = message.split(":")
    result = parts[1]
    re_mess = []
    flag = False
    events = Event.query.all()
    if "host" in message.strip().lower():
        for event in events:
            if result == event.host:
                flag = True
                re_mess.append("EventTitile:" + event.title + " " + "http://localhost:3000/event/" + str(event.id))
        result_string = "\n".join(re_mess)
        if flag:
            return result_string
        return "no such host"
    
    elif "time" in message.strip().lower():
        for event in events:
            try:
                if compare_time(event.start, result):
                    flag = True
                    re_mess.append("EventTitile:" + event.title + " " + "http://localhost:3000/event/" + str(event.id))
            except:
                return "wrong fromat try like this 22/02/23"
        result_string = "\n".join(re_mess)
        if flag:
            return result_string
        return "no event start at this time"
    
    elif "type" in message.strip().lower():
        for event in events:
            if result == event.eventType:
                flag = True
                re_mess.append("EventTitile:" + event.title + " " + "http://localhost:3000/event/" + str(event.id))
        result_string = "\n".join(re_mess)
        if flag:
            return result_string
        return "no such type"
    
    return "Don't get it please ask again"