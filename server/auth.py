import re
from models import User, Event, Rates
from db import db
from flask_login import login_user, logout_user, current_user
import hashlib
from error import AccessError, InputError
import random
import smtplib
from email.mime.multipart import MIMEMultipart 
from email.mime.text import MIMEText
from email.header import Header
from flask_jwt_extended import create_access_token, unset_jwt_cookies, jwt_required, JWTManager

# register a user
def register(email, username, password1, password2):
    user = User.query.filter_by(email=email).first()
    if user:
        raise InputError('Email has already registered')
    elif not validate_username(username):
        raise InputError('Username has special character or more than 10 characters')
    elif not available_username(username):
        raise InputError('Username is taken')
    elif not validate_password(password1):
        raise InputError('Password must be at least 8 characters long and have both capital, low case letters')
    elif  password1 != password2:
        raise InputError('Two passwords not matched')
    else:
        new_user = User(email= email, username=username, password=hash_string(password1), auth_code=0, token='')
        access_token = create_access_token(identity=email)
        new_user.token = access_token
        new_user.coins = 10
        db.session.add(new_user)
        db.session.commit()
        return { 
            'token': access_token,
            'user_id': new_user.id
        }

# login a user
def login(email, password):
    user = User.query.filter_by(email=email).first()
    if user:
        if user.password != hash_string(password):
            raise InputError("Incorrect password, please try again!")
        else:
            access_token = create_access_token(identity=email)
            user.token = access_token
            db.session.commit()
            login_user(user, remember=True)
            return { 
                'token': access_token,
                'username': user.username
            }

    raise InputError("Email has not been registered")

# logout a user
@jwt_required()
def logout():
    # user_id = validate_token(token)
    unset_jwt_cookies("log out")
    logout_user()
    unset_jwt_cookies("logged out")
    return {}

# send an email with a verification code
def send_verification_code(email):
    # Generate a random 6-digit verification code
    verification_code = str(random.randint(100000, 999999))

    subject = 'Verification Code'

    sender_email = 'whatever0601@163.com'

    worker = smtplib.SMTP_SSL(host="smtp.163.com", port=465)
    worker.ehlo()
    worker.login(user="whatever0601@163.com", password="TGVJRREHLEPJITGH")

    object = MIMEMultipart()

    subject = Header("Verification Code", "utf-8").encode()
    object['Subject'] = subject
    object['From'] = "whatever0601@163.com"
    object['To'] = email

    message = MIMEText(f'Your verification code is: {verification_code}', 'plain')
    
    object.attach(message)
    worker.sendmail(sender_email, email, object.as_string())
    worker.quit()

    return verification_code

def password_reset_request(email):
    user = User.query.filter_by(email=email).first()
    if user:
        # Send the verification code
        verification_code = send_verification_code(email)
        user.auth_code = verification_code
        db.session.commit()
        
        return {
            'email': email,
            'reset_code': verification_code
        }
    else:
        raise InputError(
            description='email has not been registered')

# success if input code and verification code matches
def two_factor_auth(email, input_code):
    user = User.query.filter_by(email=email).first()
    reset_code = user.auth_code
    # Verify the code
    if str(input_code) == str(reset_code):
        token = create_access_token(identity=email)
        user.token = token
        db.session.commit()
        login_user(user, remember=True)
        return {
            'token': token,
            'username': user.username
        }
    
    raise InputError('Authentication failed!')

# change password after sucesssfully validating email
def password_reset(token, new_password, password2):
    user = User.query.filter_by(token=token).first()
    if not user:
        raise AccessError('Invalid token')
    if validate_password(new_password):
        if new_password == password2:
            user.password = hash_string(new_password)
            db.session.commit()
            return {}
        raise InputError('Two passwords not matched')
    raise InputError('Password must be at least 8 characters long and have both capital, low case letters')

# returns user details
def user_details(username):
    user = User.query.filter_by(username=username).first()
    return {
        'username': username,
        'email': user.email,
        'coins': user.coins
    }

# check if user token is valid
def authorize_user(token, username):
    user = User.query.filter_by(token=token).first()
    if user.username == username:
        return True
    return False

# edit user details
def edit_user(token, email, username):
    user = User.query.filter_by(token=token).first()
    user1 = User.query.filter_by(email=email).first()
    if user1 and user.email != email:
        raise InputError('Email has already registered')
    elif not validate_username(username):
        raise InputError('Username has special character or more than 10 characters')
    elif not available_username(username) and user.username != username:
        raise InputError('Username is taken')
    else:
        newuser_name = username
        old_username = user.username
        user.username = username
        
        for event in Event.query.filter_by(host=old_username).all():
            event.host = newuser_name

        # customers
        old_email = user.email
        user.email = email
        newcustomers = []
        newwaits = []
        newrated_people = []
        for event in user.user_event:
            customers = event.customer.split()
            waitlists = event.waitlist.split()
            rated_people = event.who_rated.split()
            for customer in customers:
                if old_email == customer:
                    newcustomers.append(email)
                else:
                    newcustomers.append(customer)
            string_array = [str(element) for element in newcustomers]
            joined_string = ' '.join(string_array)
            event.customer = ' ' + joined_string
               # waitlist is email
            for wait in waitlists:
                if old_email == wait:
                    newwaits.append(email)
                else:
                    newwaits.append(wait)
            string_array = [str(element) for element in newwaits]
            joined_string = ' '.join(string_array)
            event.waitlist = ' ' + joined_string

            for people in rated_people:
                if people == old_username:
                    newrated_people.append(newuser_name)
                else:
                    newrated_people.append(people)
            string_array = [str(element) for element in newrated_people]
            joined_string = ' '.join(string_array)
            event.who_rated = ' ' + joined_string

        #who rated is username
        
        #ceated_by is user name
        rate = Rates.query.filter_by(created_by=old_username).first()
        if rate != None:
            rate.created_by = newuser_name



        db.session.commit()
    
# =========================== helper functions =============================
# ==========================================================================


def validate_username(username):
    # Define the regular expression pattern
    pattern = r'^[a-zA-Z0-9]{1,10}$'  # Alphanumeric characters, length 1-10

    # Check if the username matches the pattern
    if re.match(pattern, username):
        return True
    else:
        return False

def available_username(username):
    username = User.query.filter_by(username=username).first()
    if username == None:
        return True
    else:
        return False

def validate_password(password):
    # Check if the password is at least 8 characters long
    if len(password) < 8:
        return False

    # Check if the password contains both uppercase and lowercase characters
    if not re.search(r'[a-z]', password) or not re.search(r'[A-Z]', password):
        return False

    # Password meets all requirements
    return True


def hash_string(string):
    # Create a SHA-256 hash object
    sha256_hash = hashlib.sha256()

    # Convert the string to bytes and update the hash object
    sha256_hash.update(string.encode('utf-8'))

    # Get the hexadecimal representation of the hash
    hashed_string = sha256_hash.hexdigest()

    return hashed_string

        