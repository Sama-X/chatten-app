import './login.css'
import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom'

import { message } from 'antd'


import cookie from 'react-cookies'
import get_default_language from '../../../utils/get_default_language.js'
import Request from '../../../requestAdmin.ts';


function App() {
  let info = navigator.userAgent;
  const [language, setLanguage] = useState(get_default_language());
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  let request = new Request({});


  let navigate = useHistory()

  useEffect(()=>{
    let username = cookie.load('username')
    if(username){
      navigate.push("/admin")
    }
  }, [])


  const changeUsername = (e) => {
    console.log(parseInt(e.target.value))
    setUsername(e.target.value)
  }

  const changePassword = (e) => {
    console.log(parseInt(e.target.value))
    setPassword(e.target.value)
  }

  const submit = () => {
    request.post('/api/v1/admin/token/', {"username": username, "password": password}).then((res)=>{
      console.log("login=", res)
      if(res.code == 0){
        cookie.save('admin_token', res.data.token, { path: '/' })
        cookie.save('admin_username', res.data.nickname, { path: '/' })
        cookie.save('admin_userid', res.data.id, { path: '/' })
        navigate.push("/admin")
      }else{
         message.error('用户名或者密码错误')
      }
    })
  }

  return (
    <div className='admin-login-container'>
      <div className='admin-login-header'><img src={require("../../../assets/logo.png")} alt=""/></div>
      <div className='admin-login-frame'>
        <div className='admin-login-title'>登录</div>
        <div className='admin-login-spec'>账号</div>
        <input className='admin-login-input' onChange={changeUsername} placeholder='请输入用户名' />
        <div className='admin-login-spec'>密码</div>
        <input className='admin-login-input' onChange={changePassword} type='password' placeholder='请输入密码' />
        <div className='admin-login-btn' onClick={submit}>登录</div>
      </div>
    </div>

  );
}

export default App;
