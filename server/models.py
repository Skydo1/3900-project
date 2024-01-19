from db import db
from flask_login import UserMixin
from sqlalchemy.sql import func
from flask_sqlalchemy import SQLAlchemy

# many to many relationship user joins event
user_conn_event = db.Table('user_conn_event',
                      db.Column('id', db.Integer, primary_key = True),
                      db.Column('user_id', db.Integer, db.ForeignKey('user.id', ondelete = 'CASCADE')),
                      db.Column('event_id', db.Integer, db.ForeignKey('event.id', ondelete = 'CASCADE'))
                      )
# many to many relationship user joins chatroom
user_conn_chatroom = db.Table('user_conn_chatroom',
                      db.Column('id', db.Integer, primary_key = True),
                      db.Column('user_id', db.Integer, db.ForeignKey('user.id', ondelete = 'CASCADE')),
                      db.Column('chatroom_id', db.Integer, db.ForeignKey('chatroom.id', ondelete = 'CASCADE'))
                      )

# Database for User
class User(db.Model, UserMixin):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True)
    username = db.Column(db.String(150))
    password = db.Column(db.String(150))
    auth_code = db.Column(db.String(150))
    token = db.Column(db.String(600))
    coins = db.Column(db.Integer)
    user_event = db.relationship('Event',
                                 secondary = user_conn_event,
                                 backref = 'event_user',
                                 lazy = 'dynamic'
                                 )
    
    user_chatroom = db.relationship('Chatroom',
                                 secondary = user_conn_chatroom,
                                 backref = 'chatroom_user',
                                 lazy = 'dynamic'
                                 )

# Database for Event
class Event(db.Model):
    __tablename__ = 'event'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable = False)
    location = db.Column(db.String(150), nullable = True)
    eventType = db.Column(db.String(150), nullable = True)
    start = db.Column(db.String(150), nullable = False)
    end = db.Column(db.String(150), nullable = False)
    brief_desc = db.Column(db.String(150), nullable = True)
    desc = db.Column(db.String(150), nullable = True)
    # host is user name ???? why is it in??????
    host = db.Column(db.String(150), nullable = False)
    searched = db.Column(db.Integer, default = 0)
    # customer is email
    customer = db.Column(db.String(2000), default = "")
    seats = db.Column(db.String(150), nullable = True, default = '3')
    waitlistamount = db.Column(db.String(150), nullable=True, default='30')
    # waitlist is email
    waitlist = db.Column(db.String(2000), default = "")
    price = db.Column(db.String(150), nullable = False)
    chatroom_id = db.Column(db.Integer, nullable = True)
    comments = db.Column(db.String(2000), default = "")
    rates = db.Column(db.String(2000), default = "0")
    #who rated is username
    who_rated = db.Column(db.String(2000), default = "", nullable = False)
    seatx = db.Column(db.String(10), nullable = False)
    seaty = db.Column(db.String(10), nullable = False)
    seated_pos = db.Column(db.String(1000), default = "")

# Database for Chatroom
class Chatroom(db.Model):
    __tablename__ = 'chatroom'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable = False)
    creator = db.Column(db.Integer, nullable = False)
    managers = db.Column(db.String(150), nullable = True)
    # One to many relationship
    messages = db.relationship('Message', backref = 'chatroom')

# Database for Message
class Message(db.Model):
    __tablename__ = 'msg'
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(1500), nullable = False)
    sender = db.Column(db.Integer, nullable = False)
    pin = db.Column(db.Integer, default = 0)
    #sendTime = db.Column(db.String(150), nullable = False)
    chatroom_id = db.Column(db.Integer, db.ForeignKey('chatroom.id', ondelete = 'CASCADE'))

# Database for Chatbot
class Chatbot(db.Model):
    __tablename__ = 'Chatbot'
    id = db.Column(db.Integer, primary_key=True)
    talkto = db.Column(db.String(10), nullable = False)
    send_mess = db.Column(db.String(2000), default = "")
    rec_mess =  db.Column(db.String(2000), default = "")

# Database for Ratings
class Rates(db.Model):
    __tablename__ = 'rates'
    id = db.Column(db.Integer, primary_key=True)
    parent_event = db.Column(db.String(150), nullable = False)
    #ceated_by is user name
    created_by = db.Column(db.String(150), nullable = False)
    content = db.Column(db.String(150), nullable = False)
    parent_comments = db.Column(db.String(150), default = "")
    created_time = db.Column(db.String(150), nullable = False)
    liked = db.Column(db.String(150), nullable = True, default = '0')
    rate = db.Column(db.String(150), default = "0")
    child_comments = db.Column(db.String(2000), default = "")

# Database for Seatplace
class Seatplace(db.Model):
    __tablename__ = 'seatplace'
    id = db.Column(db.Integer, primary_key=True)
    useremail = db.Column(db.String(150), nullable = False)
    event = db.Column(db.String(5), nullable = False)
    seat = db.Column(db.String(10), nullable = False)