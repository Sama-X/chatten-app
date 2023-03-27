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
import { loginAccount } from '../../api/index.js';
import cookie from 'react-cookies'
import Request from '../../request.ts';
// import { useHistory } from 'react-router-dom';

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
        const myreg = /^[1][3,4,5,7,8][0-9]{9}$/;
        if (!myreg.test(e.target.value)) {
            // error
            message.error('Mobile phone number is not compliant')
            return false;
        } else {
            // success
            setMobileVal(e.target.value)
            return true;
        }
    }
    const sendCodeFunc = () => {
        console.log(mobileVal,'mobileVal')
        const myreg = /^[1][3,4,5,7,8][0-9]{9}$/;
        if (!myreg.test(mobileVal)) {
            // error
            message.error('Mobile phone number is not compliant')
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
      const myreg = /^[1][3,4,5,7,8][0-9]{9}$/;
      if (!myreg.test(mobileVal)) {
          // error
          message.error('Mobile phone number is not compliant')
          return false;
      }
      if(!passwordOne){
        message.error('Please input a password')
        return false;
      }
      setSpinStatus(true)
      let request = new Request({});
      request.post('/api/v1/users/token/', {
        mobile: mobileVal,
        password: passwordOne
      }).then(function(resData){
        if(resData.code == 0){
          cookie.save('userName', resData.data.nickname, { path: '/' })
          cookie.save('userId', resData.data.id, { path: '/' })
          cookie.save('token', resData.data.token, { path: '/' })
          cookie.save('experience', resData.data.experience, { path: '/' })
          message.success(resData.msg)
          setTimeout(function(){
            setSpinStatus(false)
            history.push({pathname: '/', state: { test: 'login' }})
          },1000)
        }else{
          setSpinStatus(false)
          message.error(resData.msg)
        }
      })
    }
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
                <img className="leftLogo" src={require("../../assets/loginLogo.png")} alt=""/>
                <Link to='/'>
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
                        快速登录
                    </div>
                    <div>
                      <InputNumber onPressEnter={sendCodeNext} onBlur={sendCodeNext}  className="mobileInput" placeholder="请输入手机号"/>
                    </div>
                    {/* <div> */}
                      <Input.Password type="password" onBlur={passWordOneChange} className="mobileInputPassword" placeholder="请输入密码"/>
                    {/* </div>
                    <div> */}
                      {/* <Input.Password type="password" onBlur={passWordTwoChange} className="mobileInputPassword" placeholder="请再次输入密码"/> */}
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