from models import User, Chatroom, Message
from db import db
from error import AccessError, InputError

# gets a list of chatrooms a user is part of
def userChatrooms(token):
    user = checkToken(token)
    myList = []
    for chatroom in user.user_chatroom:     
        myList.append({'c_id': chatroom.id, 'name': chatroom.name, 'creator': chatroom.creator, 'managers': chatroom.managers})
    
    return myList

# creates a chatroom between host and username
def sendDM(token, username):
    user = checkToken(token)
    checkUser(username)
    c_id = createChatroom(token, user.username + " and " + username)
    inviteMember(token, c_id, username)
    return c_id

# creates a chatroom with roomname
def createChatroom(token, roomname):
    user = checkToken(token)
    if (roomname is None) or (roomname == '') or (roomname.isspace()):
        raise InputError('Chatroom  is required.')
    new_chatroom = Chatroom(name = roomname,
                         creator = user.id,
                         managers = str(user.id))
    
    user.user_chatroom.append(new_chatroom)
    db.session.add(new_chatroom)
    db.session.commit()
    return new_chatroom.id

# returns a list of messages in chatroom
def loadMessages(token, c_id):
    user = checkToken(token)
    chatroom = checkChatroom(c_id)
    myList = []
    pins = Message.query.filter_by(pin = 1).all()
    for pin in pins:
        if pin.chatroom_id == c_id:
            sender = User.query.filter_by(id = pin.sender).first()
            isSender = False
            if user.id == sender.id:
                isSender = True
            myList.append({'id': pin.id, 'content': pin.content, 'sender': sender.username, 'isSender': isSender, 'isPin': True})
    for message in chatroom.messages:
        if message.pin != 1:
            sender = User.query.filter_by(id = message.sender).first()
            isSender = False
            if user.id == sender.id:
                isSender = True
            myList.append({'id': message.id, 'content': message.content, 'sender': sender.username, 'isSender': isSender, 'isPin': False})
    
    return myList

# inserts a message into the chatroom
def sendMessage(token, chatroom_id, message):
    sender = checkToken(token)
    chatroom = checkChatroom(chatroom_id)
    checkMsg(message)
    new_message = Message(content = message,
                            sender = sender.id,
                            chatroom = chatroom)
    chatroom.messages.append(new_message)
    db.session.add(new_message)
    db.session.commit()
    return new_message.id

# returns details about the chatroom    
def chatroomDetails(token, c_id):
    user = checkToken(token)
    chatroom = checkChatroom(c_id)
    if not memberInChatroom(user, chatroom):
        raise InputError('You are not a member of this chatroom')
    
    creator = User.query.filter_by(id = chatroom.creator).first()
    
    myList = []
    for member in chatroom.chatroom_user:
        myList.append({'username': member.username, 'role': "Admin"})

    myList2 = []
    for manager in getManagers(chatroom):
        u = User.query.filter_by(id = int(manager)).first()
        myList2.append(u.username)

    return {'name': chatroom.name, 'creator': creator.username, 'members': myList, "managers": myList2}

# invites user to join chatroom 
def inviteMember(token, chatroom_id, username):
    host = checkToken(token)
    chatroom = checkChatroom(chatroom_id)
    if not hostInChatroom(host, chatroom):
        raise AccessError('No operation permission.')
        
    user = checkUser(username)
    if memberInChatroom(user, chatroom):
        raise InputError('User has been in the chatroom already.')
    else:
        user.user_chatroom.append(chatroom)
    db.session.commit()
    return {}

# user is removed from chatroom
def leaveChat(token, chatroom_id):
    user = checkToken(token)
    chatroom = checkChatroom(chatroom_id)
    if user.id == chatroom.creator:
        raise InputError('You cannot leave your own chat')
    if memberInChatroom(user, chatroom):
        user.user_chatroom.remove(chatroom)
    else:
        raise InputError('You have not joined this chatroom.')
    db.session.commit()
    return {}

# promote a user
def addManager(token, chatroom_id, username):
    requester = checkToken(token)
    chatroom = checkChatroom(chatroom_id)
    # if not hostInChatroom(requester, chatroom):
    if requester.id != chatroom.creator:
        raise AccessError('No operation permission.')

    user = checkUser(username)
    if not memberInChatroom(user, chatroom):
        raise InputError('Cannot add member who is not in the chatroom as a manager.')
    elif hostInChatroom(user, chatroom):
        raise InputError('User has been the creator or manager of this chatroom already.')
    elif len(getManagers(chatroom)) == 3:
        raise InputError('A maximum of three administrators can be added.')
    else:
        chatroom.managers = chatroom.managers + ',' + str(user.id)
    db.session.commit()
    return {}

# demote a user
def removeManager(token, chatroom_id, username):
    requester = checkToken(token)
    chatroom = checkChatroom(chatroom_id)
    # if not hostInChatroom(requester, chatroom):
    if requester.id != chatroom.creator:
        raise AccessError('No operation permission.')
        
    user = checkUser(username)
    if not memberInChatroom(user, chatroom):
        raise InputError('Cannot remove member who is not in the chatroom as a manager.')
    elif user.id == chatroom.creator:
        raise InputError('User is the creator of this chatroom.')
    elif not hostInChatroom(user, chatroom):
        raise InputError('User is not the manager of this chatroom already.')
    else:
        managerList = getManagers(chatroom)
        managerList.remove(str(user.id))
        if len(managerList) == 0:
            chatroom.managers = None
        else:
            chatroom.managers = ','.join(managerList)
    db.session.commit()
    
    return {}

# kick a user
def removeMember(token, chatroom_id, username):
    host = checkToken(token)
    chatroom = checkChatroom(chatroom_id)
    if not hostInChatroom(host, chatroom):
        raise AccessError('No operation permission.')
        
    user = checkUser(username)
    if user.id == chatroom.creator:
        raise InputError('You cannot kick the creator out')
    if not memberInChatroom(user, chatroom):
        raise InputError('User has not joined this chatroom.')
    else:
        user.user_chatroom.remove(chatroom)
    db.session.commit()
    return {}

# delete message
def deleteMsg(token, chatroom_id, message_id):
    user = checkToken(token)
    chatroom = checkChatroom(chatroom_id)
    if not hostInChatroom(user, chatroom):
        raise AccessError('No operation permission.')
        
    message = getMessage(message_id)
    chatroom.messages.remove(message)
    db.session.delete(message)
    db.session.commit()
    return {}

# pin message
def pinMessage(token, chatroom_id, message_id):
    user = checkToken(token)
    chatroom = checkChatroom(chatroom_id)
    if not hostInChatroom(user, chatroom):
        raise AccessError('No operation permission.')
        
    message = getMessage(message_id)
    if message.chatroom != chatroom:
        raise InputError('The message is not in this chatroom.')
    elif message.pin == 1:
        raise InputError('The message has been pinned.')
        
    pin_num = len(Message.query.filter_by(pin = 1).all())
    if pin_num == 4:
        raise InputError('Too many pinned messages.')
    message.pin = 1
    db.session.commit()
    return {}

# unpin message
def unpinMessage(token, chatroom_id, message_id):
    user = checkToken(token)
    chatroom = checkChatroom(chatroom_id)
    if not hostInChatroom(user, chatroom):
        raise AccessError('No operation permission.')
        
    message = getMessage(message_id)
    if message.chatroom != chatroom:
        raise InputError('The message is not in this chatroom.')
    elif message.pin == 0:
        raise InputError('The message is not pinned.')
    message.pin = 0
    db.session.commit()
    return {}

# helper functions
# Or write these 3 functions into 1
def checkToken(token):
    user = User.query.filter_by(token = token).first()
    if user is None:
        raise AccessError('User not exist.')
    else:
        return user

def checkUser(username):
    user = User.query.filter_by(username = username).first()
    if user is None:
        raise AccessError('User not exist.')
    else:
        return user

def checkChatroom(chatroom_id):
    chatroom = Chatroom.query.filter_by(id = chatroom_id).first()
    if chatroom is None:
        raise InputError('Chatroom not exist.')
    else:
        return chatroom

def memberInChatroom(user, chatroom):

    if chatroom in user.user_chatroom:
        return True
    return False

def hostInChatroom(user, chatroom):
    # chatroom = checkChatroom(chatroom_id)
    
    if chatroom not in user.user_chatroom:
        raise AccessError('No operation permission.')
    managerlist = getManagers(chatroom)
    if (chatroom.creator == user.id) or (str(user.id) in managerlist):
        # raise AccessError('No operation permission.')
        return True
    return False

def getManagers(chatroom):
    if chatroom.managers == None:
        return []
    return chatroom.managers.split(',')

def checkMsg(message):
    if (message is None) or (message == '') or (message.isspace()):
        raise InputError('Cannot send blank messages.')
    if len(message) > 1500 or len(message) < 1:
        raise InputError('The message content should be between 0 and 1500 words.')
    return

def getMessage(message_id):
    message = Message.query.filter_by(id = message_id).first()
    if message is None:
        raise InputError('Message not exists.')
    else:
        return message