from db import db
from error import InputError
from models import User, Event
from sqlalchemy.sql import func, or_

# search an event sorted by title
def searchDetails_title(keyword, tags):
    eventlist = Event.query.all()
    print(keyword)
    mylist = []
    if len(eventlist) == 0:
        raise InputError('no events have been created yet')  
    #change to cap
    if tags == 'all' or tags == "":
        for event in eventlist:
            if (keyword.lower() in event.title.lower()) :
                e_id = event.id
                title = event.title
                date = event.start
                location = event.location
                description = event.brief_desc
                event.searched = event.searched + 1
                mylist.append({'title': title, 'location' : location, 'date': date, 'description' : description, 'e_id' : e_id})
            

    elif keyword is None:
        eventlist = Event.query.order_by(Event.searched.desc()).order_by(Event.title.asc()).order_by(Event.start.asc()).all()
        # algorithm to determin top6 search results
        num = 1
        for event in eventlist:
            if num <= 6:
                event.searched += 1
                db.session.commit()
                mylist.append({'title': event.title, 'location' : event.location, 'date': event.start, 'description' : event.brief_desc, 'e_id' : event.id, 'searchtime' : event.searched})
                num += 1
        print(mylist)
        return mylist

    else:
        for event in eventlist:
            
            if str(event.eventType) == str(tags) and (keyword in event.title):
                title = event.title
                e_id = event.id
                date = event.start
                location = event.location
                description = event.brief_desc
                event.searched = event.searched + 1
                mylist.append({'title': title, 'location' : location, 'date': date, 'description' : description, 'e_id' : e_id})
    db.session.commit()
    sorted_by_title = sorted(mylist, key=lambda x: ( x['title']))
    print(sorted_by_title)
    return sorted_by_title

# search an event sorted by date
def searchDetails_date(keyword, tags):
    eventlist = Event.query.all()
    mylist = []
    if len(eventlist) == 0:
        raise InputError('no events have been created yet')  
    #change to cap
    if tags == 'all' or tags == "":
        for event in eventlist:
            if (keyword.lower() in event.title.lower()) :
                e_id = event.id
                title = event.title
                date = event.start
                location = event.location
                description = event.brief_desc
                event.searched = event.searched + 1
                mylist.append({'title': title, 'location' : location, 'date': date, 'description' : description, 'e_id' : e_id})
    
    elif keyword is None:
        eventlist = Event.query.order_by(Event.searched.desc()).order_by(Event.title.asc()).order_by(Event.start.asc()).all()
        # algorithm to determin top6 search results
        num = 1
        for event in eventlist:
            if num <= 6:
                event.searched += 1
                db.session.commit()
                mylist.append({'title': event.title, 'location' : event.location, 'date': event.start, 'description' : event.brief_desc, 'e_id' : event.id, 'searchtime' : event.searched})
                num += 1
        return mylist
            
    else:
        for event in eventlist:

            if str(event.eventType) == str(tags) and (keyword in event.title):
                title = event.title
                e_id = event.id
                date = event.start
                location = event.location
                description = event.brief_desc
                event.searched = event.searched + 1
                mylist.append({'title': title, 'location' : location, 'date': date, 'description' : description, 'e_id' : e_id})
    db.session.commit()
    sorted_by_date = sorted(mylist, key=lambda x: (x['date']))
    return sorted_by_date

# returns the top 6 search results
def thetop6():
    mylist = []
    eventlist = []
    eventlist = Event.query.order_by(Event.searched.desc()).order_by(Event.title.asc()).order_by(Event.start.asc()).all()
    
    if len(eventlist) != 0:
        num = 1
        for event in eventlist:
        # for num in range(1, 7):
            if num <= 6:
                mylist.append({'title': event.title, 'location' : event.location, 'date': event.start, 'description' : event.brief_desc, 'e_id' : event.id, 'searchtime' : event.searched})
                num += 1
    return mylist

# given a user, recommends them a list of events
def recommand(token):
    user = User.query.filter_by(token = token).first()
    try:
        eventlist = user.user_event
    except:
        return None
    tags = []
    hosts = []
    bookedEvent = []
    user_host_event = Event.query.filter_by(host = user.username).all()
    for uhe in user_host_event:
        bookedEvent.append(uhe.id)
    for event in eventlist:
        if event.id not in bookedEvent:
            bookedEvent.append(event.id)
        if event.eventType not in tags:
            tags.append(event.eventType)
        if event.host not in hosts:
            hosts.append(event.host)
    # algorithm gets events with same host and same type to recommend
    events = Event.query.filter(or_(Event.eventType.in_(tags), Event.host.in_(hosts))).filter(Event.id.notin_(bookedEvent)).order_by(Event.start.asc()).all()
    mylist = []
    if len(events) != 0:
        for ev in events:
            check = 0
            for h in hosts:
                if (ev.eventType in tags) or (ev.host == h):
                    check = 1
                if check == 1:
                    mylist.append({ev.id: ev.title})
                    break
    return mylist
