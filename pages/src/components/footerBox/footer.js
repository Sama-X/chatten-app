import './footer.css'

import { Button, Drawer, Radio, Space, Input } from 'antd';
import { useEffect, useState } from 'react';
import { UpCircleFilled } from '@ant-design/icons';

const App = () => {
  const [isToken, setToken] = useState(false);
  const { Search } = Input;
  const fetchData = () => {
    setToken(true)
  }
  const onSearchFunc = (value) => {
    console.log(value,'value');
  }
  useEffect(()=>{
    fetchData()
  }, [])
  return (
    <div className="footerBox">
      {/* noToken */}
      <div className="footerTokenBox">
        {
          isToken == true ?
          <Input.Group className="tokenInputBox">
            <Input onPressEnter={onSearchFunc} className="tokenInput"/>
            <UpCircleFilled className="tokenIcon" style={{ fontSize: '28px',color: "#E84142" }}/>
          </Input.Group>
          :
          <div className="noTokenBtn">注册/登录以开始聊天</div>
        }
        <div  className="footerTokenContent">服务由 SAMA network 提供</div>
      </div>
    </div>
  );
};
export default App;