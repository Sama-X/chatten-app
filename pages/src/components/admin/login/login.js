import './login.css'
import { useEffect, useState } from 'react';
import cookie from 'react-cookies'
import get_default_language from '../../../utils/get_default_language.js'


function App() {
  let info = navigator.userAgent;
  let isPhone = /mobile/i.test(info);
  const [language, setLanguage] = useState(get_default_language());
  const [value, setValue] = useState(10)


  const changeValue = (e) => {
    console.log(parseInt(e.target.value))
    let v = e.target.value.replace(/[^\d]/g, "");
    if(v==''){
        v = 0
    }
    setValue(parseInt(v))
  }


  return (
    <div className='admin-login-container'>
      <div className='admin-login-header'><img src={require("../../../assets/logo.png")} alt=""/></div>
      <div className='admin-login-frame'>
        <div className='admin-login-title'>登录</div>
        <div className='admin-login-spec'>账号</div>
        <input className='admin-login-input' placeholder='请输入用户名' />
        <div className='admin-login-spec'>密码</div>
        <input className='admin-login-input' type='password' placeholder='请输入密码' />
        <div className='admin-login-btn'>登录</div>
      </div>
    </div>

  );
}

export default App;
