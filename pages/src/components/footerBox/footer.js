import './footer.css'

import { Input, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { UpCircleFilled } from '@ant-design/icons';
import { Link } from 'react-router-dom'
import cookie from 'react-cookies'
import Request from '../../request.ts';
import { useHistory } from 'react-router-dom';

const App = () => {
  const isToken = cookie.load('token') ? true : false
  const [spinStatus, setSpinStatus] = useState(false);

  const history = useHistory()
  const onSearchFunc = (value) => {
    // console.log(value,'value');
  }
  const linkSkip =  () => {
    if(isToken) {
      history.push({pathname: '/ChatPage', state: { test: 'login' }})
    }else{
      let request = new Request({});
      setSpinStatus(true)
      request.post('/api/v1/users/anonymous/',{invite_code: cookie.load('invite_code') ? cookie.load('invite_code') : null,}).then(function(resData){
        setSpinStatus(false)
        cookie.save('userName', resData.data.nickname, { path: '/' })
        cookie.save('userId', resData.data.id, { path: '/' })
        cookie.save('token', resData.data.token, { path: '/' })
        history.push({pathname: '/ChatPage', state: { test: 'signin' }})
      })
    }
  }
  useEffect(()=>{

  }, [])
  return (
    <div className="footerBox">
      {
        spinStatus ?
        <div className="example">
          <Spin />
        </div>
        : ''
      }
      <div className="fixEdBox" onClick={linkSkip}>
      </div>
      {/* noToken */}
      <div className="footerTokenBox">
        {/* {
          isToken ? */}
          <div className="tokenInputBox">
            {/* <Input.Group className="tokenInputBox"> */}
            <Input
                onPressEnter={onSearchFunc}
                className="tokenInput"
                style={{
                  color: '#000000',
                  paddingRight: "50px",
                  width: "90%",
                  borderRadius: '10px',
                  textAlign: 'left',
                }}
              />
            {/* </Input.Group> */}
            <UpCircleFilled className="tokenIcon" style={{ fontSize: '28px',color: "#E84142" }}/>
          </div>

          {/* :
          <div className="noTokenBtn">
            <Link to='/Login'>登录</Link>
            <span>/</span>
            <Link to='/SignIn'>注册</Link>
            以开始聊天
          </div>
        } */}
        {/* <div  className="footerTokenContent">服务由 SAMA network 提供</div> */}
      </div>
    </div>
  );
};
export default App;