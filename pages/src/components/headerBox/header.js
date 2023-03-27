import './header.css'
import { Drawer, Menu, message, Spin } from 'antd';
import { PlusCircleFilled, MessageOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import Request from '../../request.ts';
import { Link } from 'react-router-dom'
import cookie from 'react-cookies'
import { useHistory } from 'react-router-dom';


function getItem(label, key, icon, children, type) {
  return {
    key,
    icon,
    children,
    label,
    type,
  };
}

// const items = [
//   getItem('SamaGPT', 'sub1', '', [
//     getItem('创建新对话…', '5',<PlusCircleFilled />),
//     getItem('解释量子力学', '6',<MessageOutlined />),
//     getItem('人工智能的发展前景', '7',<MessageOutlined />),
//     getItem('解释量子力学', '8',<MessageOutlined />),
//   ]),
//   {
//     type: 'divider',
//   },
// ];

const App = () => {
  const isToken = cookie.load('token')
  const history = useHistory()
  const [userName, setUserName] = useState('');
  const [open, setOpen] = useState(false);
  const [items, setItem] = useState([]);
  const [placement] = useState('left');
  const [spinStatus, setSpinStatus] = useState(false);

  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };
  const menuClick = (e) => {
    if(e.key == '1' && e.domEvent.target.textContent == '创建新对话…'){
      console.log(e,'click')
      linkSkip()
    }
  };
  const linkSkip =  () => {
    const isTokenStatus = cookie.load('token') ? true : false
    if(isTokenStatus) {
      history.push({pathname: '/ChatPage', state: { test: 'login' }})
    }else{
      console.log('12')
      setSpinStatus(true)
      let request = new Request({});
      request.post('/api/v1/users/anonymous/').then(function(resData){
        cookie.save('userName', resData.data.nickname, { path: '/' })
        cookie.save('userId', resData.data.id, { path: '/' })
        cookie.save('token', resData.data.token, { path: '/' })
        setTimeout(function(){
          setSpinStatus(false)
          history.push({pathname: '/ChatPage', state: { test: 'signin' }})
        },1000)
      })
    }
  }
  const getHistory = () => {

      let request = new Request({});
      request.get('/api/v1/chat/records/', {
        page: 1,
        offset: 20,
        order:'-id,-msg_type'
      }).then(function(resData){
        let menuSetitemList = [getItem('创建新对话…', 1,<PlusCircleFilled />)]
        for(let i in resData.data){
          menuSetitemList.push(getItem(resData.data[i].question, (i+2),<MessageOutlined />),)
        }
        setItem([getItem('SamaGPT', 'sub1', '', menuSetitemList)])
      })
  }
  const noFunction = () => {
    message.info('Not yet open, please look forward to...')
  }
  useEffect(()=>{
    if(isToken){
      const authName = (cookie.load('userName') && cookie.load('userName') != 'null') ? cookie.load('userName') : '未命名'
      setUserName(authName)
      getHistory()
    }else{
      let menuSetitemList = [getItem('创建新对话…', 1,<PlusCircleFilled />)]
      setItem([getItem('SamaGPT', 'sub1', '', menuSetitemList)])
    }
  }, [])

  return (
    <div>
      {
        spinStatus ?
        <div className="exampleSpin">
          <Spin />
        </div>
        : ''
      }
      <div className="headerBox">
        <div className="headerLeft" onClick={showDrawer}>
          <img src={require("../../assets/leftMenu.png")} alt=""/>
        </div>
        {
          isToken ?
            <div className="headerRight">
              <img src={require("../../assets/noLoginIcon.png")} alt=""/>
              <div>{ userName }</div>
            </div>
            :
            <div className="headerRight">
              <img src={require("../../assets/noLoginIcon.png")} alt=""/>
              <div><Link to='/Login'>登录</Link></div>
              <span>/</span>
              <div><Link to='/SignIn'>注册</Link></div>
            </div>
        }
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
          style={{background:'#202123',color:'white'}}
        >
          {/* rootStyle={{background:'rgba(48, 50, 60, 0.4)'}} */}
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
                <div className="otherMenuLeft" onClick={noFunction}>
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
                      <div className='otherMenuRightItem' onClick={noFunction}>
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
            <div className='memberBox' onClick={noFunction}>
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