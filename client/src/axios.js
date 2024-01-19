import axios from 'axios';
import _ from 'lodash';

import { url } from './utils/constants';
import { toast } from 'react-toastify';

const DEFAULT_ERROR_TEXT = 'An error occured. Try again later'

axios.defaults.baseURL = url;
axios.defaults.headers.put['Content-Type'] = 'application/json';
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.delete['Content-Type'] = 'application/json';

// temporarily cancel all requests until backend is ready
const CancelToken = axios.CancelToken;

axios.interceptors.request.use((request) => {
    // if (request.method === 'put' || request.method === 'post' || request.method === 'delete') {
    //     request.data = qs.stringify(request.data);
    // }
    return request;
});

const errorHandler = (error) => {
    console.error(error);

    let message = DEFAULT_ERROR_TEXT;

    if (error.response) {
        const found = error.code === "ERR_BAD_REQUEST"
        const response_message = found && typeof error.response.data.message === 'string'
        if (response_message) (
            message = error.response.data.message.replace(/(<p[^>]+?>|<p>|<\/p>)/img, "")
        )
    }


    toast.error(message);

    return Promise.reject({ ...error })
}

const responseHandler = (response) => {
    return response;
}

axios.interceptors.response.use(responseHandler, errorHandler);