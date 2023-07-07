import './profile_mobile.css'
import { FormOutlined } from '@ant-design/icons';
import { useEffect, useState, useRef } from 'react';
import cookie from 'react-cookies'
import locales from '../../locales/locales.js'
import Request from '../../request.ts';
import get_default_language from '../../utils/get_default_language.js'
import { useHistory } from 'react-router-dom';
import { Input } from 'antd';



function App() {
  const [language, setLanguage] = useState(get_default_language());
  const [editing, setEditing] = useState(null);
  const inputNickname = useRef(null);
  const inputEmail = useRef(null);
  const [nickname, setNickname] = useState(cookie.load('nickname'));
  const [email, setEmail] = useState(cookie.load('email'));
  const navigate = useHistory()
  
  const goToHome = () => {
    navigate.push('/')
  }
  
  const editField = (field) => {
    setEditing(field);
    if (field === 'nickname') {
      setTimeout(() => {
        inputNickname.current && inputNickname.current.focus()
      }, 10)
    } else if (field === 'email') {
      setTimeout(() => {
        inputEmail.current && inputEmail.current.focus()
      }, 10)
    }
  }

  const onCommit = (e) => {
    const value = e.target.value;
    if (editing === 'nickname') {
      setNickname(value);
      cookie.save('nickname', value, { path: '/' })
    } else if (editing === 'email') {
      setEmail(value);
      cookie.save('email', value, { path: '/' })
    }
    setEditing(null);
    const request = new Request()

    request.post('/api/user/update', {
      nickname: nickname,
      email: email
    }).then(res => {
      console.log(res)
    })
  }

  return (
    <div className='profile-container'>
      <div className='profile-header' onClick={goToHome}>
        <img src={require("../../assets/logo.png")} alt=""/>
      </div>
      <div className='profile-body'>
        <div className='profile-body-avatar'>
          <img src={require("../../assets/avatar.jpeg")} alt=""/>
        </div>
        <div className='profile-body-item'>
          <div className='profile-body-item-title'>{ locales(language)['nickname'] }：</div>
          <div className='profile-body-item-content'>
            { 
              editing === 'nickname' ? <Input className="mobileInput" ref={inputNickname} defaultValue={nickname} placeholder={ locales(language)['input_nickname'] } onBlur={ onCommit } /> :<span>
                { nickname || '-' } &nbsp; <FormOutlined onClick={ (e) => editField('nickname') } />
              </span>
            }
          </div>
        </div>
        <div className='profile-body-item'>
          <div className='profile-body-item-title'>{ locales(language)['username'] }：</div>
          <div className='profile-body-item-content'>
          { cookie.load('userName') || '暂无' }
          </div>
        </div>
        <div className='profile-body-item'>
          <div className='profile-body-item-title'>{ locales(language)['email'] }: </div>
          <div className='profile-body-item-content'>
          { 
              editing === 'email' ? <Input className="mobileInput" ref={inputEmail} defaultValue={email} placeholder={ locales(language)['input_email'] } onBlur={ onCommit } /> :<span>
                { email || '-' } &nbsp; <FormOutlined onClick={ (e) => editField('email') } />
              </span>
            }
          </div>
        </div>
      </div>
      
    </div>
  );
}

export default App;
