import axios from 'axios'

// logon
export const loginAccount = (data) => axios.post('/api/v1/users/register/', data);





export const getCategoriesAsync = (params) => axios.get('/api/v1/virtual/devices/info/?limit=20&page=1', {
    params: params
});

export const addCategoriesAsync = data => axios.post('/categroy/addCategroy', data);
export const ceshi = data => axios.post('/ext/bc/P', data);