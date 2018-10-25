import axios from 'axios';
import Constants from '../constants';

const api = axios.create({
    baseURL: Constants.url.base,
    timeout: 12000,
    headers: {
        'Connection': 'close',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',        
    }
});


function setToken(AUTH_TOKEN) {
    console.log(AUTH_TOKEN);
    api.defaults.headers.common['Authorization'] = 'Bearer ' + AUTH_TOKEN;
}
function cancelToken(){
  var CancelToken = axios.CancelToken;
  var source = CancelToken.source();
}

export {
    api,
    setToken
}
