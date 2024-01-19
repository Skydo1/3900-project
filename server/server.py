from flask import Flask, request, jsonify, send_file
from flask_cors import CORS, cross_origin
from json import dumps
from db import createDb
from auth import register, login, password_reset, password_reset_request, two_factor_auth, user_details, authorize_user, edit_user
from flask_login import LoginManager
from models import User, Event
from event import eventCreate, eventDetails, eventEdit, gethostedlist, cancelhost, broadcastMessage, uploadPhoto, displayBanner, displaySearch, displaySeatMap
from booking import bookevent, getbookinglist, cancelbooking, topup
from datetime import timedelta, datetime, timezone
from flask_jwt_extended import JWTManager, create_access_token, get_jwt, get_jwt_identity, unset_jwt_cookies, jwt_required
from search import searchDetails_title, searchDetails_date, thetop6, recommand
from chatroom import *
from chatbot import chat,get_history
import os
import json
from reviewing import *

PORT = 8800
front_url = "http://localhost:3000"

# start app and create database
app = Flask(__name__)
createDb(app)

jwt = JWTManager(app)
login_manager = LoginManager()
login_manager.init_app(app)

image_directory = "./images"

@login_manager.user_loader
def load_user(user_id):
    # Load a user from the User model using the provided user_id
    return User.get(user_id)

app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)

CORS(app, origins=front_url, supports_credentials=True)

def default_handler(err):
    response = err.get_response()
    print('response', err, err.get_response())
    response.data = dumps({
        "code": err.code,
        "name": "System Error",
        "message": err.get_description(),
    })
    response.content_type = 'application/json'
    return response

app.config['TRAP_HTTP_EXCEPTIONS'] = True
app.register_error_handler(Exception, default_handler)


# EPIC 1 AUTH
@app.route('/register', methods=['POST'])
def auth_register():
    payload = request.get_json()
    email = payload['email']
    username = payload['username']
    password = payload['password']
    password2 = payload['password2']
    response = register(email, username, password, password2)
    return dumps(response)

@app.route('/login', methods=['POST'])
def auth_login():
    payload = request.get_json()
    email = payload['email']
    password = payload['password']
    response = login(email, password)
    return dumps(response)

@app.route("/logout", methods=["POST"])
def logout():
    response = jsonify({"msg": "logout successful"})
    unset_jwt_cookies(response)
    return response

@app.route('/sendemail', methods=['POST'])
def auth_password_reset_request():
    payload = request.get_json()
    email = payload['email']
    response = password_reset_request(email)
    return dumps(response)

@app.route('/verification', methods=['POST'])
def auth_two_factor_auth():
    payload = request.get_json()
    email = payload['email']
    input_code = payload['code']
    response = two_factor_auth(email, input_code)
    return dumps(response)

@app.route('/resetpassword', methods=['POST'])
def auth_password_reset():
    payload = request.get_json()
    token = payload['token']
    password = payload['password']
    password2 = payload['password2']
    response = password_reset(token, password, password2)
    return dumps(response)

@app.route('/edit_user', methods=['POST'])
def edit_user_details():
    payload = request.get_json()
    token = payload['token']
    email = payload['email']
    username = payload['username']
    response = edit_user(token, email, username)
    return dumps(response)

# EPIC 2 EVENT MANAGEMENT
@app.route('/event_create', methods=['POST'])
def createEvent_http():
    payload = request.get_json()
    title = payload['title']
    location = payload['location']
    etype = payload['etype']
    start = payload['start']
    end = payload['end']
    brief_desc = payload['brief_desc']
    desc = payload['desc']
    host = payload['host']
    seats = payload['seats']
    price = payload['price']    
    seatx = payload['column']
    seaty = payload['row']
    response = eventCreate(title, location, etype, start, end, brief_desc, desc, host, seats, price, seatx, seaty)
    return dumps(response)

@app.route('/display_seatmap', methods=['POST'])
def displaySeatMap_http():
    payload = request.get_json()
    e_id = payload['e_id']
    response = displaySeatMap( e_id )
    return dumps(response)

@app.route('/event_edit', methods=['POST'])
def editEvent_http():
    payload = request.get_json()
    token = payload['token']
    e_id = payload['e_id']
    title = payload['title']
    location = payload['location']
    etype = payload['etype']
    start = payload['start']
    end = payload['end']
    brief_desc = payload['brief_desc']
    desc = payload['desc']
    response = eventEdit(token, e_id ,title, location, etype, start, end, brief_desc, desc)
    return dumps(response)

@app.route('/broadcast_message', methods=['POST'])
def broadcast_message_http():
    payload = request.get_json()
    token = payload['token']
    e_id = payload['e_id']
    message = payload['message']
    response = broadcastMessage(token, e_id , message)
    return dumps(response)

# EPIC 3 CALENDAR DASHBOARD
@app.route('/upload_photo', methods=['POST'])
@cross_origin()
def uploadPhoto_http():
    banner = request.files.get('banner')
    search = request.files.get('search')
    seatmap = request.files.get('seatmap')
    response = uploadPhoto(banner, search, seatmap)
    return dumps(response)

@app.route('/display_banner', methods=['POST'])
def displayBanner_http():
    payload = request.get_json()
    e_id = payload['e_id']
    response = displayBanner( e_id )
    return dumps(response)

@app.route('/display_search', methods=['GET'])
def displaySearch_http():
    response = displaySearch()
    return dumps(response)

# EPIC 4 DISCOVERY
@app.route('/discovery', methods=['POST'])
def discovery_http():
    top6 = thetop6()
    return jsonify(top6)

@app.route('/discovery/title/<searchTerm>', methods=['POST'])
def discovery_title(searchTerm):
    # Retrieve the events from your database
    top6 = thetop6()
    
    if searchTerm == '':
        return jsonify(top6)
    else:
        payload = request.get_json()
        keyword = payload['searchTerm']
        etype = payload['filterOption']
        response = searchDetails_title(keyword, etype)
        return dumps(response)
    
@app.route('/discovery/date/<searchTerm>', methods=['POST'])
def discovery_date(searchTerm):
    # Retrieve the events from your database
    top6 = thetop6()
    
    if searchTerm == '':
        return jsonify(top6)
    else:
        payload = request.get_json()
        keyword = payload['searchTerm']
        etype = payload['filterOption']
        response = searchDetails_date(keyword, etype)
        return dumps(response)
    
@app.route('/recommendation', methods=['POST'])
def recommendation():
    payload = request.get_json()
    token = payload['token']
    response = recommand(token)
    return jsonify(response)

# EPIC 4 BOOKING
@app.route('/get_ticket', methods=['POST'])
def book_event_http():
    payload = request.get_json()
    token = payload['token']
    eventId = payload['e_id']
    input_email = payload['email']
    name = payload['name']
    mobile = payload['phoneNum']
    seatx = payload['column']
    seaty = payload['row']
    response = bookevent(token, mobile, eventId, input_email,seatx,seaty)
    return dumps(response)

@app.route('/booking_list', methods=['POST'])
def bookinglist():
    payload = request.get_json()
    token = payload['token']
    response = getbookinglist(token)
    return jsonify(response)

@app.route('/hosted_list', methods=['POST'])
def hostedlist():
    payload = request.get_json()
    username = payload['username']
    response = gethostedlist(username)
    return jsonify(response)

@app.route('/cancel_booking', methods=['POST'])
def cancel_booking():
    payload = request.get_json()
    token = payload['token']
    e_id = payload['e_id']
    response = cancelbooking(e_id, token)
    return dumps(response)

@app.route('/cancel_host', methods=['POST'])
def cancel_host():
    payload = request.get_json()
    token = payload['token']
    e_id = payload['e_id']
    response = cancelhost(e_id, token)
    return dumps(response)

@app.route('/top_up', methods=['POST'])
def top_up():
    payload = request.get_json()
    token = payload['token']
    amount = payload['amount']
    response = topup(token, amount)
    return dumps(response)

# EPIC 6 CHATROOM
@app.route('/send_message', methods=['POST'])
def send_message():
    payload = request.get_json()
    token = payload['token']
    c_id = payload['c_id']
    message = payload['message']
    response = sendMessage(token, c_id, message)
    return dumps(response)

@app.route('/user_chatrooms', methods=['POST'])
def user_chatrooms():
    payload = request.get_json()
    token = payload['token']
    response = userChatrooms(token)
    return dumps(response)

@app.route('/create_chatroom', methods=['POST'])
def create_chatroom():
    payload = request.get_json()
    token = payload['token']
    roomname = payload['roomname']
    response = createChatroom(token, roomname)
    return dumps(response)

@app.route('/load_messages', methods=['POST'])
def load_messages():
    payload = request.get_json()
    token = payload['token']
    c_id = payload['c_id']
    response = loadMessages(token, c_id)
    return dumps(response)

@app.route('/chatroom_details', methods=['POST'])
def chatroom_details():
    payload = request.get_json()
    token = payload['token']
    c_id = payload['c_id']
    response = chatroomDetails(token, c_id)
    return dumps(response)

@app.route('/chatroom_invite', methods=['POST'])
def chatroom_invite():
    payload = request.get_json()
    token = payload['token']
    c_id = payload['c_id']
    username = payload['username']
    response = inviteMember(token, c_id, username)
    return dumps(response)

@app.route('/send_dm', methods=['POST'])
def send_dm():
    payload = request.get_json()
    token = payload['token']
    username = payload['username']
    response = sendDM(token, username)
    return dumps(response)

@app.route('/leave_chat', methods=['POST'])
def leave_chat():
    payload = request.get_json()
    token = payload['token']
    c_id = payload['c_id']
    response = leaveChat(token, c_id)
    return dumps(response)

@app.route('/add_manager', methods=['POST'])
def add_manager():
    payload = request.get_json()
    token = payload['token']
    c_id = payload['c_id']
    username = payload['username']
    response = addManager(token, c_id, username)
    return dumps(response)

@app.route('/remove_manager', methods=['POST'])
def remove_manager():
    payload = request.get_json()
    token = payload['token']
    c_id = payload['c_id']
    username = payload['username']
    response = removeManager(token, c_id, username)
    return dumps(response)

@app.route('/remove_member', methods=['POST'])
def remove_member():
    payload = request.get_json()
    token = payload['token']
    c_id = payload['c_id']
    username = payload['username']
    response = removeMember(token, c_id, username)
    return dumps(response)

@app.route('/remove_message', methods=['POST'])
def remove_message():
    payload = request.get_json()
    token = payload['token']
    c_id = payload['c_id']
    message_id = payload['message_id']
    response = deleteMsg(token, c_id, message_id)
    return dumps(response)

@app.route('/pin_message', methods=['POST'])
def pin_message():
    payload = request.get_json()
    token = payload['token']
    c_id = payload['c_id']
    message_id = payload['message_id']
    response = pinMessage(token, c_id, message_id)
    return dumps(response)

@app.route('/unpin_message', methods=['POST'])
def unpin_message():
    payload = request.get_json()
    token = payload['token']
    c_id = payload['c_id']
    message_id = payload['message_id']
    response = unpinMessage(token, c_id, message_id)
    return dumps(response)

# EPIC 7 CHATBOT
@app.route('/chat_message', methods=['POST'])
def chatbot_message():
    payload = request.get_json()
    message = payload['message']
    username = payload['token']
    response = chat(message, username)
    return dumps(response)

@app.route('/message_history', methods=['POST'])
def gethis():
    payload = request.get_json()
    username = payload['token']
    response = get_history(username)
    return dumps(response)

# EPIC 8 REVIEW
@app.route('/review', methods=['POST'])
def rview_event():
    # no need to be email to do
    # but it is best to have email for me to do
    payload = request.get_json()
    event = payload['e_id']
    user = payload['username']
    content = payload['review']
    rate = payload['rating']
    response = review(event, user, content, rate)
    return dumps(response)

@app.route('/reply_review', methods=['POST'])
def reply_review_http():
    # no need to be email to do
    # but it is best to have email for me to do
    payload = request.get_json()
    event = payload['e_id']
    user = payload['username']
    content = payload['reply']
    parent_commit = payload['commentId']
    response = reply_review(event, user, content, parent_commit)
    return dumps(response)

# will be changed later on, just for testing
@app.route('/get_review', methods=['POST'])
def getreview():
    payload = request.get_json()
    event = payload['e_id']
    response = getallreview(event)
    return jsonify(response)
# may need to reply 

@app.route('/ntoo_reviews', methods=['POST'])
def get_ntoo_review():
    payload = request.get_json()
    event = payload['e_id']
    response = sort_date_ntoo(event)
    return jsonify(response)

@app.route('/oton_reviews', methods=['POST'])
def get_oton_review():
    payload = request.get_json()
    event = payload['e_id']
    response = sort_date_oton(event)
    return jsonify(response)

@app.route('/most_replied_reviews', methods=['POST'])
def get_most_replied_review():
    payload = request.get_json()
    event = payload['e_id']
    response = sort_comm_time(event)
    return jsonify(response)

@app.route('/edit_review', methods=['POST'])
def editReview():
    payload = request.get_json()
    comment_id = payload['commentId']
    input_content = payload['editedContent']
    response = edit_review(comment_id, input_content)
    return jsonify(response)

@app.route('/delete_review', methods=['POST'])
def deleteReview():
    payload = request.get_json()
    comment_id = payload['commentId']
    e_id = payload['e_id']
    response = delete_review(comment_id, e_id)
    return jsonify(response)

@app.route('/get_av_rate', methods = ['POST'])
def ave():
    payload = request.get_json()
    e_id = payload['e_id']
    response = get_ave_rates(e_id)
    return jsonify(response)

# =========================== api below =============================
# ==========================================================================

@app.route('/api/authorize_user', methods=['POST'])
def authorize_token():
    payload = request.get_json()
    token = payload['token']
    username = payload['username']
    response = authorize_user(token, username)
    return dumps(response)

@app.route('/api/event_details', methods=['POST'])
def event_details_http():
    payload = request.get_json()
    e_id = payload['e_id']
    response = eventDetails(e_id)
    return dumps(response)

@app.route('/api/user_details', methods=['POST'])
def user_profile():
    # Retrieve the events from your database
    payload = request.get_json()
    username = payload['username']
    response = user_details(username)
    return dumps(response)

@app.route('/api/events', methods=['GET'])
def get_events():
    # Retrieve the events from your database
    events = fetch_events_from_database()

    # Return the events as a JSON response
    return jsonify(events)

def fetch_events_from_database():
    events = Event.query.all()
    # event from sql database
    event_list = []
    for event in events:
        event_dict = {
            'title': event.title,
            'location': event.location,
            'eventType': event.eventType,
            'start': event.start,
            'end': event.end,
            'brief_desc': event.brief_desc,
            'desc': event.desc
        }
        event_list.append(event_dict)
    return event_list

@app.route('/api/get_event_id', methods=['POST'])
def getEvent():
    payload = request.get_json()
    title = payload['title']
    start = payload['start']
    events = Event.query.all()

    flag = False
    for event in events:
        if (title == event.title and start == event.start[:-5]):
           flag = True
           thiseventId = event.id

    if not flag:
        return jsonify({})
    return jsonify(thiseventId)


@app.route('/api/images/<path:filename>', methods=['GET'])
def getImage_http(filename):
    path = image_directory + '/' + filename
    if not os.path.isfile(path):
        return dumps(None)

    return send_file(path, mimetype='image/jpg')


@app.after_request
def refresh_expiring_jwts(response):
    try:
        exp_timestamp = get_jwt()["exp"]
        now = datetime.now(timezone.utc)
        target_timestamp = datetime.timestamp(now + timedelta(minutes=30))
        if target_timestamp > exp_timestamp:
            access_token = create_access_token(identity=get_jwt_identity())
            data = response.get_json()
            if type(data) is dict:
                data["access_token"] = access_token 
                response.data = json.dumps(data)
        return response
    except (RuntimeError, KeyError):
        # Case where there is not a valid JWT. Just return the original respone
        return response

if __name__ == '__main__':
    app.run(port=PORT, debug=True)