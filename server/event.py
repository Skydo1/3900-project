from datetime import datetime
from models import User, Event
from db import db
from error import AccessError, InputError
import smtplib
from email.mime.multipart import MIMEMultipart 
from email.mime.text import MIMEText
from email.header import Header
from PIL import Image
from chatroom import createChatroom
import os

# the function is used to check the user input, to see if they are valid or not 
def validate_input(title, start, end, brief_desc, seats, price):
    if title is None:
        raise InputError('Event title is required.')
    elif start is None:
        raise InputError('Event start time is required.')
    elif end is None:
        raise InputError('Event end time is required.')
    elif not check_time(start, end):
        raise InputError('Event end time must be later than the start time.')
    elif not check_creation(title, start[:-5]):
        raise InputError('Cannot make two events with the same date and title')
    elif len(brief_desc) > 30:
        raise InputError('Brief description is too long')
    elif seats is None:
        raise InputError('Seat capacity is required.')
    elif not seats.isnumeric():
        raise InputError('Seat capacity should be a number.')
    elif int(seats) <= 0:
        raise InputError('Seat capacity must be more than zero.')
    elif price is None:
        raise InputError('Event price is required.')
    elif not price.isnumeric():
        raise InputError('Price should be a number.')
    elif float(price) < 0:
        raise InputError('Event price must be equal to or more than 0.')

# funciton is used to created event
def eventCreate(title, location, etype, start, end, brief_desc, desc, host, seats, price, seatx, seaty):
   #double check, if the user can host event, not reachable, but in case
    user = User.query.filter_by(username=host).first()
    if user is None:
        raise AccessError('User does not exist.')

    # check input
    validate_input(title, start, end, brief_desc, seats, price)
    
    # check the if there is seats for this event
    if seats.isspace() or seats == '':
        seats = None

    # chatroom is need to created
    c_id = createChatroom(user.token, "Event:" + title)
    new_event = Event(title=title, location=location, eventType=etype, start=start, end=end, brief_desc=brief_desc, desc=desc, host=host, seats=seats, price=price, chatroom_id=c_id, seatx=str(seatx), seaty=str(seaty))
    db.session.add(new_event)
    db.session.commit()
    return new_event.id

def eventEdit(token, e_id, title, location, etype, start, end, brief_desc, desc, seats, price):
    user = User.query.filter_by(token=token).first()
    event = Event.query.filter_by(id=e_id).first()

    validate_input(title, start, end, brief_desc, seats, price)

    if not user or user.username != event.host:
        raise AccessError('Invalid token')

    event.title = title
    event.location = location
    event.eventType = etype
    event.start = start
    event.end = end
    event.brief_desc = brief_desc
    event.desc = desc
    event.seats = seats
    event.price = price
    db.session.commit()
    return event.id

# loads event details when given event_id
def eventDetails(e_id):
    event = Event.query.filter_by(id=e_id).first()
    #user = User.query.filter_by(id=event.host).first()
    return {
        'title': event.title,
        'location': event.location,
        'type': event.eventType,
        'start': event.start,
        'end': event.end,
        'brief_desc': event.brief_desc,
        'desc': event.desc,
        'host': event.host,
        'seats': event.seats,
        'price': event.price
    }

# gets list of events hosted by user
def gethostedlist(username):
    user = User.query.filter_by(username=username).first()
    events = Event.query.filter_by(host=username)
    myList = []
    #const myList = [{title: 'adadd', date: '1/2/2001', location: 'unsw', description: 'sfsfafaf'}, 
                    #{title: 'bbb', date: '1/2/2001', location: 'adkhd', description: 'sdffzccc'}]
    for event in events:
        title = event.title
        location = event.location
        date = event.start
        des = event.brief_desc
        myList.append({'e_id': event.id, 'title': title, 'location': location, 'date': date, 'des': des})
    return myList

# host cancelling event 
def cancelhost(eventId, token):
    event = Event.query.filter_by(id=eventId).first()
    host = User.query.filter_by(token=token).first()
    
    if host.username != event.host:
        raise InputError('Only the host is allowed to cancel this event')

    starttime = event.start
    if not compare_time(starttime):
        raise InputError('You cannot cancel the event as it has already started')

    for user in event.event_user:
        user.coins += int(event.price)

    message = "Dear guests, I am very sorry to notify that I have cancelled " + event.title + ". Sorry for the incovenience and all payments will be refunded. Thanks, " + host.username
    broadcastMessage(token, eventId, message)

    event.event_user = []
    Event.query.filter_by(id=eventId).delete()
    
    db.session.commit()
    return {}

# host broadcasting message to all guests
def broadcastMessage(token, eventId, message):
    event = Event.query.filter_by(id=eventId).first()
    host = User.query.filter_by(token=token).first()

    if host.username != event.host:
        raise InputError('Only the host is allowed to broadcast a message')

    subject = 'Whatevent Broadcast'

    sender_email = 'whatever0601@163.com'

    worker = smtplib.SMTP_SSL(host="smtp.163.com", port=465)
    worker.ehlo()
    worker.login(user="whatever0601@163.com", password="TGVJRREHLEPJITGH")

    for user in event.event_user:
        object = MIMEMultipart()

        subject = Header("Whatevent Broadcast", "utf-8").encode()
        object['Subject'] = subject
        object['From'] = "whatever0601@163.com"
        object['To'] = user.email
        message = MIMEText(message)
        object.attach(message)
        worker.sendmail(sender_email, user.email, object.as_string())
        
    worker.quit()

# upload custom photo as banner, search and seatmap
def uploadPhoto(banner, search, seatmap):

    # store in images directory
    if not os.path.isdir("./images"):
        os.makedirs("./images")
    
    if not banner == None:
        banner_name = banner.filename
        banner = Image.open(banner)
        path = "images/" + banner_name
        banner.save(path)

    if not search == None:
        search_name = search.filename
        search = Image.open(search)
        path = "images/" + search_name
        search.save(path)

    if not seatmap == None:
        seatmap_name = seatmap.filename
        seatmap = Image.open(seatmap)
        path = "images/" + seatmap_name
        seatmap.save(path)
    
    return {}

# returns relative path of banner
def displayBanner(e_id):

    banner = "./images/banner" + e_id + ".jpg"
    event = Event.query.filter_by(id=e_id).first()
    type = event.eventType

    if not os.path.isfile(banner):
        # stock photo
        banner_url = "/api/images/" + type.lower() + "_banner.jpg"
        return banner_url
    # unique filename 
    banner_url = "/api/images/banner" + e_id + ".jpg"
    return banner_url

# returns relative path of search
def displaySearch():

    search_imgs = {}

    for event in Event.query.all():
        e_id = event.id
        search = "./images/search" + str(e_id) + ".jpg"
        type = event.eventType

        if not os.path.isfile(search):
            # stock photo
            search_url = "/api/images/" + type.lower() + "_banner.jpg"
        else:  
            search_url = "/api/images/search" + str(e_id) + ".jpg"

        search_imgs[e_id] = search_url

    return search_imgs

# returns relative path of seatmaps
def displaySeatMap(e_id):
  
    seatmap = "./images/seatmap" + e_id + ".jpg"
    event = Event.query.filter_by(id=e_id).first()
    type = event.eventType

    if not os.path.isfile(seatmap):
        return ''
    # unique filename     
    seatmap_url = "/api/images/seatmap" + e_id + ".jpg"
    return seatmap_url


# =========================== helper functions =============================
# ==========================================================================

def check_time(start, end):
    from_time = datetime.strptime(start, "%Y-%m-%dT%H:%M:%S.%fz")
    to_time = datetime.strptime(end, "%Y-%m-%dT%H:%M:%S.%fz")
    return to_time > from_time

def check_creation(title, start):
    events = Event.query.all()
    for event in events:
        if(title == event.title and start == event.start[:-5]):
            return False
    
    return True

def compare_time(starttime):
    print(starttime)
    current_datetime = datetime.now()
    datetime1 = datetime.strptime(starttime, "%Y-%m-%dT%H:%M:%S.%fZ")
    #formatted_timestamp1 = datetime1.strftime("%Y-%m-%d %H:%M:%S.%f")

    #datetime2 = datetime.strptime(current_datetime, "%Y-%m-%d %H:%M:%S.%f")

    # Check if the first timestamp is 7 days or more before the second one
    if datetime1 > current_datetime:
        return True
    return False
