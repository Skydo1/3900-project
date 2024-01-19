from models import User, Event, Chatroom, Seatplace
from db import db
from error import InputError
from error import InputError
from datetime import datetime, timedelta
from sendemail import send_recpit, canceled_succ

def check_can_booking(email, customers, seatx, seaty, event, user):
    if email in customers:
        raise InputError('you have already booked for this event')
    if (seatx == "" and seatx != seaty) or (seaty == "" and seaty != seatx):
        raise InputError("Inputted wrong seat location")

    if seatx == "" and seaty == "":
        return True
    else:
        if (event.seatx == "" or event.seaty == ""):
            raise InputError("no need to select seat for this event")
        elif (int(seatx) > int(event.seatx) or int(seaty) > int(event.seaty) or int(seatx) <= 0 or int(seaty) <=0):
            raise InputError("incorrect map in put, the map only have x " + event.seatx + "y" + event.seaty)
 
        seat_place = str(int(seatx)*10 + int(seaty))
    if event.seated_pos != "" and seatx != "":
        seated_pl = event.seated_pos.split('/')
        for s in seated_pl:
            if s == seat_place:
                raise InputError("seats is already picked")

    if user.coins < int(event.price):
        raise InputError("You dont have enough coins")

def bookevent(token, mobile, eventId, input_email, seatx, seaty):
    # check if the user if joined into the waitlist
    joined_wl = '0'
    check = False
    # the user can logined in, no need for authtication
    event = Event.query.filter_by(id=eventId).first()
    user = User.query.filter_by(token=token).first()
    no_need_seats = False
    email = user.email
    customers = event.customer.split()
    
    no_need_seats = check_can_booking(email, customers, seatx, seaty, event, user)
        
    if(len(customers) >= int(event.seats)):
        #check if the customer is needed to join the waitlist
        join_waitlist(email,event)
        joined_wl = '1'
    else:
        # customer will be sucessfully booked
        if not no_need_seats:
            #customer needs seat
            seat_place = str(int(seatx)*10 + int(seaty))
            event.seated_pos = event.seated_pos + '/' + seat_place
            seat = Seatplace(useremail=email,
                    event=str(eventId),
                    seat = seat_place
                    )
            check = True
        email = ' ' + email
        event.customer += ' ' + email
        user.user_event.append(event)
        if check:
            send_recpit(event.start, event.title, email, event.location, event.price,seat_place)
        else:
            send_recpit(event.start, event.title, email, event.location, event.price,"")

        user.coins -= int(event.price)
        chatroom = Chatroom.query.filter_by(id = event.chatroom_id).first()
        user.user_chatroom.append(chatroom)
        if seatx != "":
            db.session.add(seat)
    db.session.commit()
    return {
        'has_joined_waitlist': joined_wl
    }

def cancelbooking(eventId, token):
    check = False
    event = Event.query.filter_by(id=eventId).first()
    canceleduser = User.query.filter_by(token=token).first()
    
    seatplace = Seatplace.query.filter_by(useremail=canceleduser.email).first()
    # findout if the customer quited has seat on him
    if seatplace is None:
        seatplace = ""
    email = canceleduser.email

    starttime = event.start
    if not compare_time(starttime):
        # check the time to be 7 days befor or not 
        raise InputError('you cannot canncel the event whith in 7days before it starts')
    customers = event.customer.split()
   
    #delete the user in the customers
    customers.remove(email)
    waitlists = event.waitlist.split()
    canceleduser.coins += int(event.price)
    # someone in the waitlist
    if waitlists != "":
        
        joined_customer = waitlists.pop(0)
        user = User.query.filter_by(email=joined_customer).first()
        #waitlist user joined this event to his database
        user.user_event.append(event)
        if seatplace != "":
            # give the exsiting seat to the merged in customer

            seatplace.useremail = user.email

            check = True

        # joined the list, need to renew event.customer
        customers.append(joined_customer)
        if check == True:
            # if has seat
            send_recpit(event.start, event.title, joined_customer, event.location, event.price,seatplace.seat)
        else:
            send_recpit(event.start, event.title, joined_customer, event.location, event.price,"")
        user.coins -= int(event.price)
        chatroom = Chatroom.query.filter_by(id = event.chatroom_id).first()
        user.user_chatroom.append(chatroom)

    #renew the customers list 
    string_array = [str(element) for element in customers]
    joined_string = ' '.join(string_array)
    event.customer = ' ' + joined_string
    db.session.commit()

    # delete the user event's in the cancel user 
    canceleduser.user_event.remove(event)

    if(len(event.waitlist.split()) == 0):
        # no one was in waitlist 
        try:
            # if not sucess, no seats
            seatsin = event.seated_pos.split('/')
            seatsin.remove(seatplace.seat)
            string_array = [str(element) for element in seatsin]
            joined_string = '/'.join(string_array)
            event.seated_pos = '/' + joined_string
            db.session.commit()
        except:
            event.waitlist = ""
    else:
        #renew waitlist
        string_array = [str(element) for element in waitlists]
        joined_string = ' '.join(string_array)
        event.waitlist = ' ' + joined_string
    canceled_succ(event.title, email)
    # this user delete event 
    db.session.commit()
    return getbookinglist(token)

def getbookinglist(token):
    user = User.query.filter_by(token=token).first()
    myList = []
    #const myList = [{title: 'adadd', date: '1/2/2001', location: 'unsw', description: 'sfsfafaf'}, 
                    #{title: 'bbb', date: '1/2/2001', location: 'adkhd', description: 'sdffzccc'}]
    events = user.user_event
    for event in events:
        title = event.title
        location = event.location
        date = event.start
        des = event.brief_desc
        myList.append({'e_id': event.id, 'title': title, 'location': location, 'date': date, 'des': des})
            
    return myList
    


def join_waitlist(email,event):
    waitlistnumber = event.waitlist.split()

    if email in waitlistnumber:
        raise InputError('You are already in the waitlist!')

    if(len(waitlistnumber) >= int(event.waitlistamount)):
        raise InputError('waitlist is full')
    email = ' ' + email
    event.waitlist += ' ' + email

def topup(token, amount):
    user = User.query.filter_by(token=token).first()
    user.coins += amount
    db.session.commit()

def compare_time(starttime):
    current_datetime = datetime.now()
    datetime1 = datetime.strptime(starttime, "%Y-%m-%dT%H:%M:%S.%fZ")
    time_diff = datetime1 - current_datetime
    if time_diff >= timedelta(days=7):
        return True
    return False