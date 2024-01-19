'''python file to define AccessError and InputError'''
from werkzeug.exceptions import HTTPException

class AccessError(HTTPException):
    '''AccessError class with code 400 and message'''
    code = 400
    message = 'No message specified'

class InputError(HTTPException):
    '''InputError class with code 400 and message'''
    code = 400
    message = 'No message specified'
