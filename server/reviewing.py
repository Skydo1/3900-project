from models import User, Event, Rates
from db import db
from datetime import datetime
from error import AccessError, InputError

visited_count = 0

def review(input_event, username, givencotent, rating):
    rate = Rates.query.filter_by(created_by=username).first()
    if givencotent == '':
        raise InputError('You have to comment the event')

    event = Event.query.filter_by(id=input_event).first()
    # check if the user is authrosied to commit under this event
    user = User.query.filter_by(username=username).first()
    if not commability_check(user):
        raise AccessError('the user has not booked for this event')

    # parent and child commit do later with frontend
    current_time = datetime.now()

    # Convert the current time to a string in a specific format
    time_format = "%Y-%m-%d %H:%M:%S"  # YYYY-MM-DD HH:MM:SS format
    local_time_string = current_time.strftime(time_format)
    if rating == 0:
        raise InputError('You have to rate the event')

    else:
        rated_person = event.who_rated.split()
        for person in rated_person:
            if person == username:
                raise AccessError('You have already rated before, don not rate anymore')
        new_commit = Rates(parent_event = event.id,
                            created_by = username,
                            content = givencotent,
                            created_time = local_time_string,
                            rate = str(rating)
                            )
        event.rates = event.rates + ' ' + str(rating)
        event.who_rated = event.who_rated + ' ' + str(username)
    db.session.add(new_commit)
    db.session.commit()
    
    commit_id = ' ' + str(new_commit.id)
    event.comments = event.comments + commit_id

    db.session.commit()
    return {
        'id': new_commit.id,
        'commitby': new_commit.created_by,
        'commentTo': new_commit.parent_comments,
        'content': new_commit.content,
        'date': new_commit.created_time,
        'rate': new_commit.rate,
        'sub_comments': []
    }


def reply_review(input_event, username, givencotent, parent_commit):
    event = Event.query.filter_by(id=input_event).first()
    # check if the user is authrosied to commit under this event
    user = User.query.filter_by(username=username).first()
    if not commability_check(user):
        raise AccessError('the user has not booked for this event')
    parent = Rates.query.filter_by(id=int(parent_commit)).first()
    current_time = datetime.now()
    time_format = "%Y-%m-%d %H:%M:%S"  # YYYY-MM-DD HH:MM:SS format
    local_time_string = current_time.strftime(time_format)
    new_commit = Rates(parent_event = event.id,
                        created_by = username,
                        content = givencotent,
                        created_time = local_time_string,
                        parent_comments = parent.created_by
                        )
    db.session.add(new_commit)
    db.session.commit()
    commit_id = ' ' + str(new_commit.id)
    event.comments = event.comments + commit_id
    parent.child_comments = parent.child_comments + commit_id
    db.session.commit()
    return {
        'id': new_commit.id,
        'commitby': new_commit.created_by,
        'commentTo': new_commit.parent_comments,
        'content': new_commit.content,
        'date': new_commit.created_time,
        'rate': new_commit.rate,
        'sub_comments': []
    }

def getallreview(input_event):
    # not good, other situations need to be think of
    event = Event.query.filter_by(id=input_event).first()
    myList = []
    #const myList = [{commitby: 'adadd', content: '1/2/2001', rate: 5 stars}]
    comms = event.comments
    comms = comms.split()
    readed_comm = []
    myList = []
    readed_comm = set()  # Use a set to store read comments efficiently

    for comm in comms:
        global visited_count
        visited_count = 0
        main_comment = get_comment_with_subcomments(int(comm), readed_comm)
        if main_comment:
            print(visited_count)
            main_comment["commented_time"] = visited_count
            myList.append(main_comment)
    print(myList)
    return myList

def sort_comm_time(input_event):
    myList = getallreview(input_event)
    sorted_list = sorted(myList, key=lambda x: int(x['commented_time']), reverse=True)
    return sorted_list

def sort_date_ntoo(input_event):
    myList = getallreview(input_event)
    sorted_list = sorted(myList, key=lambda x: datetime.strptime(x['date'], "%Y-%m-%d %H:%M:%S"), reverse=True)
    return sorted_list
    
def sort_date_oton(input_event):
    myList = getallreview(input_event)
    sorted_list = sorted(myList, key=lambda x: datetime.strptime(x['date'], "%Y-%m-%d %H:%M:%S"))
    return sorted_list


def get_ave_rates(eventID):
    event = Event.query.filter_by(id=eventID).first()
    rates = event.rates.split()
    rates_int = [int(rate) for rate in rates]

    # Calculate the average rate
    if len(rates_int)-1 != 0:
        average_rate = sum(rates_int) / (len(rates_int) -1)
    else:
        average_rate = 0
    print(average_rate)
    return str(average_rate)


def edit_review(comment_id, input_content):
    #check if the user can edit
    comment = Rates.query.filter_by(id=comment_id).first()
    comment.content = input_content
    db.session.commit()
    return {
        'id': comment.id,
        'commitby': comment.created_by,
        'commentTo': comment.parent_comments,
        'content': comment.content,
        'date': comment.created_time,
        'rate': comment.rate,
        'sub_comments': []
    }

def delete_review(comment_id,e_id):
    #check if the user can delete
    comment = Rates.query.filter_by(id=comment_id).first()
    event = Event.query.filter_by(id=e_id).first()
    rated_person = event.who_rated.split()
    for person in rated_person:
        if person == comment.created_by:
            rated_person.remove(person)
    string_array = [str(element) for element in rated_person]
    joined_string = ' '.join(string_array)
    event.who_rated = ' ' + joined_string
            

    delet_list = []
    commnet = Rates.query.filter_by(id=comment_id).first()
    event = Event.query.filter_by(id=e_id).first()
    if commnet.child_comments != "":
        child_comm = commnet.child_comments.split()
        for child in child_comm:
            delet_list.append(child)
    delet_list.append(str(commnet.id))
    
    all_comms = event.comments.split()
    result_array = [x for x in all_comms if x not in delet_list]
    joined_string = ' '.join(result_array)
    event.comments = ' ' + joined_string
    
    for cid in delet_list:
        Rates.query.filter_by(id=int(cid)).delete()
    
    db.session.commit()
    return "done"

def commability_check(user):
    events = Event.query.all()
    for event in events:
        cus_list = event.customer.split()
        if(user.email in cus_list):
            return True
    return False


def get_comment_with_subcomments(comment_id, read_comments):
    comment = Rates.query.filter_by(id=comment_id).first()

    # Check if the comment has already been read to avoid infinite recursion
    if comment_id in read_comments:
        return None

    # If the comment is not found in the database, return None to handle the case
    if comment is None:
        return None

    # Mark the comment as read to avoid revisiting it later
    read_comments.add(comment_id)

    main_comm_dict = {
        'id': comment.id,
        'commitby': comment.created_by,
        'commentTo': comment.parent_comments,
        'content': comment.content,
        'date': comment.created_time,
        'rate': comment.rate,
        'commented_time': 0,
        'sub_comments': []
    }

    # Increase the visited_count by 1 for sub-comments
    global visited_count
    visited_count += 1

    # Check if there are sub-comments in this comment
    if comment.child_comments != "":
        subs = comment.child_comments.split()
        for sub_id in subs:
            sub_comment = get_comment_with_subcomments(int(sub_id), read_comments)
            if sub_comment:
                main_comm_dict['sub_comments'].append(sub_comment)

    return main_comm_dict