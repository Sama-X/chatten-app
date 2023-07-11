import './index.css';
import React, {
  memo,
  forwardRef,
  useState,
} from "react";

import { Input, message, Spin } from 'antd';
import { Link, useHistory } from 'react-router-dom'


import Request from '../../request.ts';
import locales from '../../locales/locales.js'
import get_default_language from '../../utils/get_default_language.js'


export default memo(
  forwardRef(({ onChange }, ref) => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [canNext, setCanNext] = useState(false);

    const [newPwd, setNewPwd] = useState("");
    const [newPwdAgain, setNewPwdAgain] = useState("");

    const [spinStatus, setSpinStatus] = useState(false);
    const language = get_default_language()
    
    const history = useHistory()

    const getNewPwd = (e) => {
      setNewPwd(e.target.value)
    }

    const getNewPwdAgain = (e) => {
      setNewPwdAgain(e.target.value)
    }

    const getUsername = (e) => {
      setUsername(e.target.value)
    }

    const getEmail = (e) => {
      setEmail(e.target.value)
    }

    // Min length 6, max length 16, at least one number and one letter, support for special symbols
    const validatePassword = (value) => {
      const reg = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d][\s\S]{6,16}$/;
      if (!reg.test(value)) {
        message.error(locales(language)['password_format_error'])
        return false;
      }
      return true;
    }

    const validateMobile = (value) => {
      const reg = /^1\d{10}$/;
      if (!reg.test(value)) {
        message.error(locales(language)['invalidMobile'])
        return false;
      }
      return true;
    }

    const validateEmail = (value) => {
      const reg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
      if (!reg.test(value)) {
        message.error(locales(language)['invalid_email'])
        return false;
      }
      return true;
    }

    const validNewPwdIsSame = () => {
      if(newPwd !== newPwdAgain){
        message.error(locales(language)['password_inconsistent'])
        return false;
      }
      return true;
    }

    const onCommit = () => {
      let request = new Request()
      if (!canNext) {
        if (!validateMobile(username)) return
        if (!validateEmail(email)) return
        request.post('/api/v1/users/check-username/', {
          username: username,
          email: email,
        }).then(res => {
          if(res.code === 0){
            setCanNext(true)
          }else{
            message.error(res.msg)
          }
        })
      } else {
        if (!validatePassword(newPwd)) return
        if (!validNewPwdIsSame()) return
        setSpinStatus(true)
        request.post('/api/v1/users/forgot-password/', {
          username: username,
          email: email,
          password: newPwd
        }).then(res => {
          if(res.code === 0){
            message.success(res.msg)
            history.push('/Login')
          }else{
            message.error(res.msg)
          }
          setSpinStatus(false)
        }).catch(err => {
          setSpinStatus(false)
          message.error(locales(language)['forget_password_fail'])
        })
      }
    }
    return (
        <div className="forgot-pwd-container mobile-forgot">
            {
              spinStatus ?
              <div className="example">
                <Spin />
              </div>
              : ''
            }
            <div className="forgot-pwd-header">
                <img className="leftLogo" src={require("../../assets/logo.png")} alt=""/>
                <Link to='/'>
                    <img className="rightClose" src={require("../../assets/close.png")} alt=""/>
                </Link>
            </div>
            <div className="mobileCode">
              <div className="forgot-pwd-title">
                  {locales(language)['forgetPassword']}
              </div>
              {
                canNext ? <Input.Password type="password" onChange={getNewPwd} onBlur={(e) => {validatePassword(e.target.value)}} className="mobileInputPassword" placeholder={locales(language)['change_new_pwd']}/> : <Input type="text" onChange={getUsername} onBlur={(e) => {validateMobile(e.target.value)}} className="mobileInput" placeholder={locales(language)['input_mobile']}/>
              }
              {
                canNext? <Input.Password type="password" onChange={getNewPwdAgain} onBlur={validNewPwdIsSame} className="mobileInputPassword" placeholder={locales(language)['change_new_pwd_again']}/>: <Input type="text" onChange={getEmail} onBlur={(e) => {validateEmail(e.target.value)}} className="mobileInput" placeholder={locales(language)['input_email']}/>

              }
              <div><img className="sendCode" onClick={onCommit} src={require("../../assets/rightBtn.png")} alt=""/></div>
            </div>
        </div>
    );
  })
);