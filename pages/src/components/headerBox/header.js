import './header.css'
import { Drawer, Menu } from 'antd';
import { PlusCircleFilled, MessageOutlined } from '@ant-design/icons';
import { useState } from 'react';

import { Link } from 'react-router-dom'

function getItem(label, key, icon, children, type) {
  return {
    key,
    icon,
    children,
    label,
    type,
  };
}

const items = [
  getItem('SamaGPT', 'sub1', '', [
    getItem('创建新对话…', '5',<PlusCircleFilled />),
    getItem('解释量子力学', '6',<MessageOutlined />),
    getItem('人工智能的发展前景', '7',<MessageOutlined />),
    getItem('解释量子力学', '8',<MessageOutlined />),
  ]),
  {
    type: 'divider',
  },
];

const App = () => {
  const [open, setOpen] = useState(false);
  const [placement] = useState('left');
  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };
  const menuClick = (e) => {
    console.log('click ', e);
  };
  const LoginFunc = () => {

  }

  return (
    <div>
      <div className="headerBox">
        <div className="headerLeft" onClick={showDrawer}>
          <img src={require("../../assets/leftMenu.png")} alt=""/>
        </div>
        <div className="headerRight" onClick={LoginFunc}>
          <img src={require("../../assets/noLoginIcon.png")} alt=""/>
          <div><Link to='/Login'>登录</Link></div>
        </div>
      </div>
      <>
        {/* <Space>
          <Button type="primary" onClick={showDrawer}>
            Open
          </Button>
        </Space> */}
        <Drawer
          width={'77%'}
          placement={placement}
          closable={false}
          onClose={onClose}
          open={open}
          key={placement}
          rootStyle={{background:'rgba(48, 50, 60, 0.4)'}}
          style={{background:'#202123',color:'white'}}
        >
          <div className="drawHeaderBox">
            <img src={require("../../assets/leftLogo.png")} alt=""/>
            <div>BETA</div>
          </div>

          <div>
            <Menu
              onClick={menuClick}
              style={{
                width: '100%',
                background:'#202123',
                color:'white',
              }}
              defaultSelectedKeys={['1']}
              defaultOpenKeys={['sub1']}
              mode="inline"
              items={items}
              theme="#202123"
            />

            <div className="otherMenuBox">
              <div className="otherMenuItem">
                <div className="otherMenuLeft">
                  <img src={require("../../assets/delete.png")} alt=""/>
                  <div>
                    清除聊天记录
                  </div>
                </div>
              </div>
              <div className="otherMenuItem">
                <div className="otherMenuLeft">
                  <img src={require("../../assets/mian.png")} alt=""/>
                  <div>
                    <div className='otherMenuRight'>
                      <div className='otherMenuRightDiv'>剩余体验次数<span className='leftNumber'>3/10</span></div>
                      <div className='otherMenuRightItem'>
                        <img src={require("../../assets/share.png")} alt=""/>
                        <div>
                          分享
                        </div>
                      </div>
                    </div>
                    <div className='leftBottom'>每分享给1个好友，可增加1次</div>
                  </div>
                </div>

              </div>
            </div>
            <div className='memberBox'>
              <img src={require("../../assets/huiyuan.png")} alt=""/>
              {/* <Image
                width={'100%'}
                src={require("../../assets/huiyuan.png")}
              /> */}
            </div>
          </div>
        </Drawer>
      </>
    </div>
  );
};
export default App;