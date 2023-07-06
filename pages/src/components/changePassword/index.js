import React, {
  memo,
  useImperativeHandle,
  forwardRef,
  useState,
  useRef,
  useCallback,
} from "react";

import { Input, message, InputNumber, Spin } from 'antd';
import { Link, useHistory } from 'react-router-dom'


import styles from "./login.css";
import cookie from 'react-cookies'
import Request from '../../request.ts';
import locales from '../../locales/locales.js'
import get_default_language from '../../utils/get_default_language.js'


// import { useHistory } from 'react-router-dom';

export default memo(
  forwardRef(({ onChange }, ref) => {
    const inputRef = useRef(null);
    const fieldList = useRef(null);
    const [oldPwd, setOldPwd] = useState("");
    const [newPwd, setNewPwd] = useState("");
    const [newPwdAgain, setNewPwdAgain] = useState("");

    const [spinStatus, setSpinStatus] = useState(false);
    const language = get_default_language()
    
    const history = useHistory()

    const getOldPwd = (e) => {
      setOldPwd(e.target.value)
    }

    const getNewPwd = (e) => {
      setNewPwd(e.target.value)
    }

    const getNewPwdAgain = (e) => {
      setNewPwdAgain(e.target.value)
    }

    // Min length 6, max length 16, at least one number and one letter, support for special symbols
    const validatePassword = (pwd) => {
      const reg = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d][\s\S]{6,16}$/;
      return reg.test(pwd);
    }

    const validNewPwdIsSame = () => {
      if(newPwd !== newPwdAgain){
        message.error(locales(language)['password_inconsistent'])
        return false;
      }
      return true;
    }

    const changePassword = () => {
      if (!validatePassword(newPwd)) {
        message.error(locales(language)['password_format_error'])
        return;
      }
      if (!validNewPwdIsSame()) {
        return;
      }
      setSpinStatus(true)
      let request = new Request()
      request.post('/api/v1/users/change-password/', {
        old_password: oldPwd,
        new_password: newPwd,
        new_password_again: newPwdAgain,
      }).then(res => {
        console.log(res);
        if(res.code === 0){
          message.success(locales(language)['change_password_success'])
          history.push('/')
        }else{
          message.error(res.msg)
        }
        setSpinStatus(false)
      }).catch(err => {
        console.log(err);
        setSpinStatus(false)
        message.error(locales(language)['change_password_fail'])
      })
    }
    return (
        <div className="mobileAndCode mobileLogin">
            {
              spinStatus ?
              <div className="example">
                <Spin />
              </div>
              : ''
            }
            <div className="loginHeader">
                <img className="leftLogo" src={require("../../assets/logo.png")} alt=""/>
                <Link to='/'>
                    <img className="rightClose" src={require("../../assets/close.png")} alt=""/>
                </Link>
            </div>
            <div className="mobileCode">
              <div className="quickLogin">
                  {locales(language)['change_password']}
              </div>
              <Input.Password type="password" onChange={getOldPwd} onBlur={getOldPwd} className="mobileInputPassword" placeholder={locales(language)['change_old_pwd']}/>
              <Input.Password type="password" onChange={getNewPwd} onBlur={getNewPwd} className="mobileInputPassword" placeholder={locales(language)['change_new_pwd']}/>
              <Input.Password type="password" onChange={getNewPwdAgain} onBlur={getNewPwdAgain} className="mobileInputPassword" placeholder={locales(language)['change_new_pwd_again']}/>
              <div><img className="sendCode" onClick={changePassword} src={require("../../assets/rightBtn.png")} alt=""/></div>
            </div>
        </div>
    );
  })
);