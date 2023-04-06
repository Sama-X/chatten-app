import './header.css'
import { Drawer, Menu, message, Spin, Popconfirm, Modal, Button } from 'antd';
import { PlusCircleFilled, MessageOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import Request from '../../request.ts';
import { Link } from 'react-router-dom'
import cookie from 'react-cookies'
import { useHistory } from 'react-router-dom';
import Content from '../contentBox/content.js'
import Footer from '../footerBox/footer.js'

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
//   getItem('chatGPT', 'sub1', '', [
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
  const experience = cookie.load('experience') ? cookie.load('experience') : 10
  const totalExeNumber = cookie.load('totalExeNumber') ? cookie.load('totalExeNumber') : 0
  const history = useHistory()
  const [userName, setUserName] = useState('');
  const [open, setOpen] = useState(false);
  const [items, setItem] = useState([]);
  const [placement] = useState('left');
  const [spinStatus, setSpinStatus] = useState(false);
  const [widthNumber, setWidthNumber] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  let info = navigator.userAgent;
  let isPhone = /mobile/i.test(info);


  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };
  const menuClick = (e) => {
    console.log(e,'click')
    if(e.key == '01' && e.domEvent.target.textContent == '创建新对话…'){
      // console.log(e,'click')
      linkSkip()
    }else{
      cookie.save('topicId', e.keyPath[1], { path: '/' })
      history.push({pathname: '/ChatPage', state: { test: 'login' }})
    }
  };
  const linkSkip =  () => {
    const isTokenStatus = cookie.load('token') ? true : false
    if(isTokenStatus) {
      history.push({pathname: '/ChatPage', state: { test: 'login' }})
    }else{
      // console.log('12')
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
      request.get('/api/v1/topics/?page=1&offset=20&order=-id').then(function(resData){

        cookie.save('experience', resData.experience, { path: '/' })
        cookie.save('totalExeNumber', resData.used_experience, { path: '/' })

        let menuSetitemList = [getItem('创建新对话…', '01',<PlusCircleFilled />)]
        for(let i in resData.data){
          let subItem = []
          request.get('/api/v1/topics/'+resData.data[i].id+'/records/?page=1&offset=20&order=id').then(function(resItemData){
            for(let j in resItemData.data){
              subItem.push(getItem("  "+resItemData.data[j].question, resItemData.data[j].add_time))
            }
          })
          menuSetitemList.push(getItem(resData.data[i].title, resData.data[i].id,<MessageOutlined />,subItem))
        }
        setItem([getItem('chatGPT', 'sub1', '', menuSetitemList)])
        console.log(items,'j')
      })
  }
  const noFunction = () => {
    message.info('Not yet open, please look forward to...')
  }
  const signOut = () => {
    setSpinStatus(true)
    cookie.save('userName', '', { path: '/' })
    cookie.save('userId', '', { path: '/' })
    cookie.save('token', '', { path: '/' })
    cookie.save('experience', '', { path: '/' })
    cookie.save('totalExeNumber', '', { path: '/' })
    message.success('Exit succeeded')
    setTimeout(function(){
      setSpinStatus(false)
    },1000)
  }
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const menuItemClick = (e) => {
    console.log(e,'hgjkl')
  }
  useEffect(()=>{
    if(isPhone){
      setWidthNumber('77%')
    }else{
      setWidthNumber('400px')
    }
    if(isToken){
      const authName = (cookie.load('userName') && cookie.load('userName') != 'null') ? cookie.load('userName') : '访客'
      setUserName(authName)
      getHistory()
    }else{
      let menuSetitemList = [getItem('创建新对话…', 1,<PlusCircleFilled />,[])]
      setItem([getItem('chatGPT', 'sub1', '', menuSetitemList)])
      cookie.save('experience', '10', { path: '/' })
      cookie.save('totalExeNumber', '0', { path: '/' })
    }
  }, [])

  return (
    <div>
    {
      isPhone ?
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
            // <div className="headerRight" onClick={signOut}>
              <Popconfirm
              placement="leftTop"
              className="headerRight"
              title='Do you want to log out'
              description=''
              onConfirm={signOut}
              okText="Yes"
              cancelText="No"
            >
              <img src={require("../../assets/noLoginIcon.png")} alt=""/>
              <div>{ userName }</div>
            </Popconfirm>
            // </div>
            :
            <div className="headerRight">
            {/* <div className="headerRight" onClick={showModal}> */}
              <img src={require("../../assets/noLoginIcon.png")} alt=""/>
              <div><Link to='/Login'>登录</Link></div>
              {/* <span>/</span>
              <div>注册</div> */}
            </div>
        }
      </div>
      <>
        <Drawer
          width={'300px'}
          placement={placement}
          closable={false}
          onClose={onClose}
          open={open}
          key={placement}
          style={{background:'#202123',color:'white'}}
        >
          <div className="drawHeaderBox">
            <img src={require("../../assets/logo.png")} alt=""/>
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
                  <img src={require("../../assets/reply.png")} alt=""/>
                  <div>
                    <div className='otherMenuRight'>
                      <div className='otherMenuRightDiv'>体验次数<span className='leftNumber'>{totalExeNumber ? totalExeNumber : 0}/{experience ? experience : 10}</span></div>
                      <div className='otherMenuRightItem' onClick={noFunction}>
                        <img src={require("../../assets/share.png")} alt=""/>
                        <div>
                          分享
                        </div>
                      </div>
                    </div>
                    <div className='leftBottom'>每分享给1个好友，可增加10次</div>
                  </div>
                </div>

              </div>
            </div>
            <div className='memberBox' onClick={noFunction}>
              <div className='memberHeaderBg'>
                <div className='memberHeader'>
                  <img src={require("../../assets/vipHeader.png")} alt=""/>
                  <div>成为会员</div>
                </div>
              </div>
              <div className='memberBottomBox'>
                <div className='memberBottom'>
                  <div className='memberBoItem'>
                    <img src={require("../../assets/infinite.png")} alt=""/>
                    <div>无限次数</div>
                  </div>
                  <div className='memberBoItem'>
                    <img src={require("../../assets/faster.png")} alt=""/>
                    <div>更快响应</div>
                  </div>
                  <div className='memberBoItem'>
                    <img src={require("../../assets/stabilize.png")} alt=""/>
                    <div>更稳定</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Drawer>
      </>
      <Modal
        title="登录/注册"
        open={isModalOpen}
        footer={null}
        style={{top: "30%"}}
        onCancel={handleCancel}
        closable
      >
        <div style={{display: 'flex', justifyContent: 'space-around', margin: '20px 0'}}>
          <Button type="primary"><Link to='/Login'>登录</Link></Button>
          <Button type="default"><Link to='/SignIn'>注册</Link></Button>
        </div>
      </Modal>
    </div>
    :
    <div style={{display: 'flex',width: '100%'}}>
      <div style={{width: '30%', paddingTop: '15px',}}>
          <div className="drawHeaderBox" style={{marginBottom: '12px'}}>
              <img src={require("../../assets/logo.png")} alt=""/>
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
                    <img src={require("../../assets/reply.png")} alt=""/>
                    <div>
                      <div className='otherMenuRight'>
                        <div className='otherMenuRightDiv'>体验次数<span className='leftNumber'>{totalExeNumber ? totalExeNumber : 0}/{experience ? experience : 10}</span></div>
                        <div className='otherMenuRightItem' onClick={noFunction}>
                          <img src={require("../../assets/share.png")} alt=""/>
                          <div>
                            分享
                          </div>
                        </div>
                      </div>
                      <div className='leftBottom'>每分享给1个好友，可增加10次</div>
                    </div>
                  </div>

                </div>
              </div>
              <div className='memberBox' onClick={noFunction}>
                <div className='memberHeaderBg'>
                  <div className='memberHeader'>
                    <img src={require("../../assets/vipHeader.png")} alt=""/>
                    <div>成为会员</div>
                  </div>
                </div>
                <div className='memberBottomBox'>
                  <div className='memberBottom'>
                    <div className='memberBoItem'>
                      <img src={require("../../assets/infinite.png")} alt=""/>
                      <div>无限次数</div>
                    </div>
                    <div className='memberBoItem'>
                      <img src={require("../../assets/faster.png")} alt=""/>
                      <div>更快响应</div>
                    </div>
                    <div className='memberBoItem'>
                      <img src={require("../../assets/stabilize.png")} alt=""/>
                      <div>更稳定</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>
      {
        spinStatus ?
        <div className="exampleSpin">
          <Spin />
        </div>
        : ''
      }

      <div className="headerFooter"  style={{width: '70%'}}>
        <div className="headerBox" style={{height:'60px'}}>
          <div className="headerLeft" onClick={showDrawer}>
            {/* <img src={require("../../assets/leftMenu.png")} alt=""/> */}
          </div>
          {
            isToken ?
              // <div className="headerRight" onClick={signOut}>
                <Popconfirm
                placement="leftTop"
                className="headerRight"
                title='Do you want to log out'
                description=''
                onConfirm={signOut}
                okText="Yes"
                cancelText="No"
              >
                <img src={require("../../assets/noLoginIcon.png")} alt=""/>
                <div>{ userName }</div>
              </Popconfirm>
              // </div>
              :
              <div className="headerRight">
              {/* <div className="headerRight" onClick={showModal}> */}
                <img src={require("../../assets/noLoginIcon.png")} alt=""/>
                <div><Link to='/Login'>登录</Link></div>
                {/* <span>/</span>
                <div>注册</div> */}
              </div>
          }
        </div>
        <Content></Content>
        {/* chouti */}
        {/* <LeftBox></LeftBox> */}
        {/* footer */}
        <Footer style={{width:'70%',left:'30%'}}></Footer>
      </div>

      <>

      </>
      <Modal
        title="登录/注册"
        open={isModalOpen}
        footer={null}
        style={{top: "30%"}}
        onCancel={handleCancel}
        closable
      >
        <div style={{display: 'flex', justifyContent: 'space-around', margin: '20px 0'}}>
          <Button type="primary"><Link to='/Login'>登录</Link></Button>
          <Button type="default"><Link to='/SignIn'>注册</Link></Button>
        </div>
      </Modal>
    </div>
    }
    </div>
  );
};
export default App;