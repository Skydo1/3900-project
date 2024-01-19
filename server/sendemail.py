from email.mime.multipart import MIMEMultipart 
from email.mime.text import MIMEText
from email.header import Header
import smtplib

def send_recpit(date, title, email, location, price, input_seat):

    subject = 'Thanks for booking'

    sender_email = 'whatever0601@163.com'

    worker = smtplib.SMTP_SSL(host="smtp.163.com", port=465)
    worker.ehlo()
    worker.login(user="whatever0601@163.com", password="TGVJRREHLEPJITGH")

    object = MIMEMultipart()

    subject = Header("thanks for booking", "utf-8").encode()
    object['Subject'] = subject
    object['From'] = "whatever0601@163.com"
    object['To'] = email

    if input_seat == "":

        message = MIMEText(f'Thanks for booking the event!\n Event: {title}\n Date: {date}\n Location: {location}\n You spent ${price} on the booking!', 'plain')
    else:
        message = MIMEText(f'Thanks for booking the event!\n Event: {title}\n Date: {date}\n Location: {location}\n Seat number is {input_seat}\n You spent ${price} on the booking!', 'plain')

    object.attach(message)
    worker.sendmail(sender_email, email, object.as_string())
    worker.quit()


def canceled_succ(title,email):
    subject = 'Cancel Confirmation'

    sender_email = 'whatever0601@163.com'

    worker = smtplib.SMTP_SSL(host="smtp.163.com", port=465)
    worker.ehlo()
    worker.login(user="whatever0601@163.com", password="TGVJRREHLEPJITGH")

    object = MIMEMultipart()

    subject = Header("You have sucessfully cancelled your booking", "utf-8").encode()
    object['Subject'] = subject
    object['From'] = "whatever0601@163.com"
    object['To'] = email

    message = MIMEText(f' the event title {title} has been canncelled successfully', 'plain')
    
    object.attach(message)
    worker.sendmail(sender_email, email, object.as_string())
    worker.quit()