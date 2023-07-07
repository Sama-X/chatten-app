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


// import { useHistory } from 'react-router-dom';

export default memo(
  forwardRef(({ onChange }, ref) => {
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
    const validatePassword = (value) => {
      const reg = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d][\s\S]{6,16}$/;
      if (!reg.test(value)) {
        message.error(locales(language)['password_format_error'])
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

    const changePassword = () => {
      if (!validatePassword(newPwd)) {
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
        if(res.code === 0){
          message.success(res.msg)
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
        <div className="change-pwd-container mobile-change">
            {
              spinStatus ?
              <div className="example">
                <Spin />
              </div>
              : ''
            }
            <div className="change-pwd-header">
                <img className="leftLogo" src={require("../../assets/logo.png")} alt=""/>
                <Link to='/'>
                    <img className="rightClose" src={require("../../assets/close.png")} alt=""/>
                </Link>
            </div>
            <div className="mobileCode">
              <div className="change-pwd-title">
                  {locales(language)['change_password']}
              </div>
              <Input.Password type="password" onChange={getOldPwd} onBlur={getOldPwd} className="mobileInputPassword" placeholder={locales(language)['change_old_pwd']}/>
              <Input.Password type="password" onChange={getNewPwd} onBlur={(e) => {validatePassword(e.target.value)}} className="mobileInputPassword" placeholder={locales(language)['change_new_pwd']}/>
              <Input.Password type="password" onChange={getNewPwdAgain} onBlur={validNewPwdIsSame} className="mobileInputPassword" placeholder={locales(language)['change_new_pwd_again']}/>
              <div><img className="sendCode" onClick={changePassword} src={require("../../assets/rightBtn.png")} alt=""/></div>
            </div>
        </div>
    );
  })
);