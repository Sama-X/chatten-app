// import axios from 'axios';

// // axios.defaults.baseURL = 'http://192.168.0.188:9650';

// axios.defaults.baseURL = 'http://192.168.0.117:9003';//zhengshi
// // axios.defaults.baseURL = 'http://192.168.0.115:8000';//tan-bendi

// // axios.defaults.baseURL = 'http://business-api.citypro-tech.com';

// // lanjie
// axios.interceptors.response.use(
//     res => res.data,
//     err => Promise.reject(err)
// )
// const proBaseURL = 'http://chattop.club';//online
// const proBaseURL = 'http://192.168.0.117:9003';//tan-bendi
const proBaseURL  = 'http://47.122.41.201:8000/api/v1';

// const ENV = 'prod'    // dev或者prod

export const BASE_URL = proBaseURL;