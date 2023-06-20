import React, {
  memo,
  useImperativeHandle,
  forwardRef,
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";

import { Input, message, InputNumber, Spin } from 'antd';
import { Link } from 'react-router-dom'


import styles from "./signIn.css";
import { loginAccount } from '../../api/index.js';
import cookie from 'react-cookies'
import Request from '../../request.ts';
import { useHistory } from 'react-router-dom';
import locales from '../../locales/locales.js'
import get_default_language from '../../utils/get_default_language.js'


export default memo(
  forwardRef(({ onChange }, ref) => {
    const inputRef = useRef(null);
    const fieldList = useRef(null);
    const [inputVal, setInputVal] = useState("");
    const [mobileVal, setMobileVal] = useState("");
    const [passwordOne, setPasswordOne] = useState("");
    const [passwordTwo, setPasswordTwo] = useState("");
    const [codeBoxStatus, setCodeBoxStatus] = useState(false);
    const [spinStatus, setSpinStatus] = useState(false);
    const [shareStatus, setShareStatus] = useState(false);
    const language = get_default_language()
    const history = useHistory()
    useImperativeHandle(ref, () => {
      return {
        changeInput: (val) => {
          changeHandle({
            target: {
              value: val,
            },
          });
        },
      };
    });

    const calcCursorPosition = useCallback(() => {
      // 这里需要获取ref的value值，不然onchange的时候会有异步问题
      const length = inputRef.current.value.length;
      if (length < 6) {
        fieldList.current.children[length].classList.add(
          styles["field-item-focus"]
        );
      }
    }, [inputVal]);

    const removeCursor = useCallback(() => {
      let newArr = Array.from(fieldList.current.children);
      newArr.forEach((item) => {
        if (
          Array.from(item["classList"]).some((r) =>
            r.includes("field-item-focus")
          )
        ) {
          item.classList.remove(
            Array.from(item["classList"]).find((r) =>
              r.includes("field-item-focus")
            )
          );
        }
      });
    }, [inputVal]);

    const changeHandle = useCallback(
      (e) => {
        // 监听input输入事件，只支持输入数字，过滤非数字字符
        let v = e.target.value.replace(/[^\d]/g, "");

        v = v.length > 6 ? v.substr(0, 6) : v;
        // 这里需要改变inputRef.currnet的值，不然input的值会超出四位
        inputRef.current.value = v;
        onChange && onChange(v); //传递给父组件
        setInputVal(v);
        // 考虑粘贴情况，循环赋值
        // 移除旧光标
        removeCursor();
        // 计算新光标出现位置
        calcCursorPosition();
      },
      [inputVal]
    );

    const blurHandle = useCallback(() => {
      removeCursor();
    }, [inputVal]);

    const focusHandle = useCallback(() => {
      calcCursorPosition();
    }, [inputVal]);
    const sendCodeNext = (e) => {
        const myreg = /^1[3456789]\d{9}$/;
        if (!myreg.test(e.target.value)) {
            // error
            message.error(locales(language)['invalidMobile'])
            return false;
        } else {
            // success
            setMobileVal(e.target.value)
            return true;
        }
    }
    const sendCodeFunc = () => {
        const myreg = /^1[3456789]\d{9}$/;;
        if (!myreg.test(mobileVal)) {
            // error
            message.error(locales(language)['invalidMobile'])
            return false;
        } else {
            // success request
            setCodeBoxStatus(true)
            return true;
        }
    }
    const passWordOneChange = (e) => {
      setPasswordOne(e.target.value)
    }
    const passWordTwoChange = (e) => {
      setPasswordTwo(e.target.value)
    }
    const signInFunc = () => {
      const myreg = /^1[3456789]\d{9}$/;;
      if (!myreg.test(mobileVal)) {
          // error
          message.error(locales(language)['invalidMobile'])
          return false;
      }
      if(!passwordOne){
        message.error(locales(language)['input_password'])
        return false;
      }else if(passwordOne.length < 6){
        message.error(locales(language)['min_password'])
        return false;
      }else if(passwordOne !== passwordTwo){
        message.error(locales(language)['password_inconsistent'])
        return false;
      }
      setSpinStatus(true)
      let request = new Request({});
      request.post('/api/v1/users/register/', {
        username: mobileVal,
        password: passwordTwo,
        invite_code: cookie.load('invite_code') ? cookie.load('invite_code') : null,
      }).then(function(resData){
        if(resData.code == 0){
          cookie.save('userName', '*'+mobileVal.slice(-4), { path: '/' })
          // cookie.save('userName', resData.data.nickname, { path: '/' })
          cookie.save('userId', resData.data.id, { path: '/' })
          cookie.save('token', resData.data.token, { path: '/' })
          // cookie.save('experience', resData.data.experience, { path: '/' })
          setTimeout(function(){
            setSpinStatus(false)
            history.push({pathname: '/', state: { test: 'signin' }})
          },1000)
        }else{
          setSpinStatus(false)
          message.error(resData.msg)
        }
      })
    }
    useEffect(()=>{
      if(history.location.pathname.indexOf("=") > -1 || history.location.search.indexOf("=") > -1 ){
        setShareStatus(true)
      }else{
        setShareStatus(false)
      }
    })
    return (
        <div className="mobileAndCode">
            {
              spinStatus ?
              <div className="example">
                <Spin />
              </div>
              : ''
            }
            <div className="loginHeader">
                <img className="leftLogo" src={require("../../assets/logo.png")} alt=""/>
                <Link to={ shareStatus ? '/' : '/Login'}>
                    <img className="rightClose" src={require("../../assets/close.png")} alt=""/>
                </Link>
            </div>
            {
                codeBoxStatus ?
                    <div>
                        <div className="inputBox">
                            <div className="quickLogin">
                                输入验证码
                            </div>
                            {/* code-yanzheng */}
                            <div className="field-list" ref={fieldList}>
                                <div className="field-item">{inputVal[0]}</div>
                                <div className="field-item">{inputVal[1]}</div>
                                <div className="field-item">{inputVal[2]}</div>
                                <div className="field-item">{inputVal[3]}</div>
                                <div className="field-item">{inputVal[4]}</div>
                                <div className="field-item">{inputVal[5]}</div>
                            </div>
                            <input
                                ref={inputRef}
                                className="field-input"
                                onChange={changeHandle}
                                onBlur={blurHandle}
                                onFocus={focusHandle}
                                type="text"
                            />
                        </div>
                    </div>
                :
                <div className="mobileCode">
                    {/* mobile */}
                    <div className="quickLogin">
                    {locales(language)['register']}
                    </div>
                    <div>
                      <InputNumber onChange={setMobileVal} onPressEnter={sendCodeNext} onBlur={sendCodeNext}  className="mobileInput" placeholder={locales(language)['input_mobile']}/>
                    </div>
                    {/* <div> */}
                      <Input.Password type="password" onChange={passWordOneChange} onBlur={passWordOneChange} className="mobileInputPassword" placeholder={locales(language)['input_password']}/>
                    {/* </div>
                    <div> */}
                      <Input.Password type="password" onBlur={passWordTwoChange} className="mobileInputPassword" placeholder={locales(language)['input_password_again']}/>
                    {/* </div> */}
                    {/* <InputNumber onPressEnter={sendCodeNext} onBlur={sendCodeNext}  className="mobileInput" placeholder="请输入手机号"/> */}
                    {/* <img className="sendCode" onClick={sendCodeFunc} src={require("../../assets/rightBtn.png")} alt=""/> */}
                    <div><img className="sendCode" onClick={signInFunc} src={require("../../assets/rightBtn.png")} alt=""/></div>
                </div>
            }

        </div>
    );
  })
);