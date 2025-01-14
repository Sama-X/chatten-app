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
import copy from 'copy-to-clipboard';
import locales from '../../locales/locales.js'

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
//   getItem('ChatTEN', 'sub1', '', [
//     getItem('创建新对话…', '5',<PlusCircleFilled />),
//     getItem('解释量子力学', '6',<MessageOutlined />),
//     getItem('人工智能的发展前景', '7',<MessageOutlined />),
//     getItem('解释量子力学', '8',<MessageOutlined />),
//   ]),
//   {
//     type: 'divider',
//   },
// ];

const App = (data) => {
  const isToken = cookie.load('token')
  const experience = cookie.load('experience') ? cookie.load('experience') : 10
  const totalExeNumber = cookie.load('totalExeNumber') ? cookie.load('totalExeNumber') : 0
  const history = useHistory()
  const [userName, setUserName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [open, setOpen] = useState(false);
  const [items, setItem] = useState([]);
  const [placement] = useState('left');
  const [spinStatus, setSpinStatus] = useState(true);
  const [widthNumber, setWidthNumber] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const language = data.language
  const setLanguage = data.setLanguage

  let info = navigator.userAgent;
  let isPhone = /mobile/i.test(info);

  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };
  const menuClick = (e) => {
    if(e.key == '01' && e.domEvent.target.textContent == locales(language)['create_new_talk'] + '…'){

      linkSkip()
    }else if(e.domEvent.target.textContent == '  正在加载... ...'){
      message.info('Loading, please do not click')
      return
    }else{
      cookie.save('topicId', e.keyPath[1])
      cookie.load('topicId')
      // return
      history.push({pathname: '/ChatPage', state: { test: 'login' }})
    }
  };
  const linkSkip =  () => {
    const isTokenStatus = cookie.load('token') ? true : false
    if(isTokenStatus) {
      history.push({pathname: '/ChatPage', state: { test: 'login' }})
    }else{
      setSpinStatus(true)
      let request = new Request({});
      request.post('/api/v1/users/anonymous/',{
        invite_code: cookie.load('invite_code') ? cookie.load('invite_code') : null,
      }).then(function(resData){
        cookie.save('userName', resData.data.nickname, { path: '/' })
        cookie.save('userId', resData.data.id, { path: '/' })
        cookie.save('token', resData.data.token, { path: '/' })
        cookie.save('topicId', '')
        setTimeout(function(){
          setSpinStatus(false)
          history.push({pathname: '/ChatPage', state: { test: 'signin' }})
        },1000)
      })
    }
  }
  const historyMenu = async (e) => {

    if(e.length > 1){
      let request = new Request({});
      let itemsCopy = [...items]
      await request.get('/api/v1/topics/'+e[e.length-1]+'/records/?page=1&offset=20&order=id').then(function(resItemData){
        let subItem = []
        for(let j in resItemData.data){
          subItem.push(getItem("  "+resItemData.data[j].question, resItemData.data[j].add_time))
        }
        for(let i in itemsCopy[0].children){
          if(itemsCopy[0].children[i].key == e[e.length-1]){
            itemsCopy[0].children[i].children = subItem
          }
        }
        setTimeout(function(){
          setItem(itemsCopy)
        },700)
        return items
      })
    }
  }
  const getHistory = () => {
      let request = new Request({});
      setSpinStatus(true)
      let maxNumber = 100000000
      let minNumber = 0
      request.get('/api/v1/topics/?page=1&offset=20&order=-id').then(function(resData){

        // cookie.save('experience', resData.experience, { path: '/' })
        // cookie.save('totalExeNumber', resData.used_experience, { path: '/' })

        let menuSetitemList = [getItem(locales(language)['create_new_talk'] + '…', '01',<PlusCircleFilled />)]
        for(let i in resData.data){
          if(i < 9){
            let subItem = []
            // request.get('/api/v1/topics/'+resData.data[i].id+'/records/?page=1&offset=20&order=id').then(function(resItemData){
            //   for(let j in resItemData.data){
                  subItem.push(getItem("  正在加载... ...", Math.random()*(maxNumber-minNumber+1)+minNumber))
            //     subItem.push(getItem("  "+resItemData.data[j].question, resItemData.data[j].add_time))
            //   }
            // })
            // menuSetitemList.push(getItem(resData.data[i].title, resData.data[i].id,<MessageOutlined />,[]))
            menuSetitemList.push(getItem(resData.data[i].title, resData.data[i].id,<MessageOutlined />,subItem))
          }
        }
        setTimeout(function(){
          setSpinStatus(false)
          setItem([getItem('ChatTEN', 'sub1', '', menuSetitemList)])
        },1000)
      })
  }
  const noFunction = () => {
    message.info('Not yet open, please look forward to...')
  }

  const deleteTopic = () => {
    let request = new Request({});
    request.delete('/api/v1/topics/').then(function(resData){
      getHistory()
      message.success('Successfully cleared')
    })
  }

  const signOut = () => {
    setSpinStatus(true)
    cookie.save('userName', '', { path: '/' })
    cookie.save('userId', '', { path: '/' })
    cookie.save('token', '', { path: '/' })
    cookie.save('experience', '', { path: '/' })
    cookie.save('totalExeNumber', '', { path: '/' })
    let menuSetitemList = [getItem(locales(language)['create_new_talk'] + '…', '01',<PlusCircleFilled />)]
    setItem([getItem('ChatTEN', 'sub1', '', menuSetitemList)])
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
  const shareFunction = () => {
    if(isToken){
      if(userName == '访客' || userName== 'anonymous'){
        message.info('Anonymous users cannot share')
        setTimeout(function(){
          history.push({pathname: '/SignIn/?type=1'})
        },0)
        return
      }else{
        copy('http://hi.chattop.club/?invite_code='+inviteCode)
        message.success('Successfully copied, please share with friends')
      }
    }else{
      message.info('Please log in first and proceed with the sharing operation')
      setTimeout(function(){
        history.push({pathname: '/SignIn/?type=1'})
      },1000)
      return
    }
  }

  const chooseLanguage = () => {
    if(cookie.load('language') == '中文'){
      cookie.save('language', 'English')
      setLanguage('English')
    }else{
      cookie.save('language', '中文')
      setLanguage('中文')
    }
  };
  useEffect(()=>{
    if(history.location.search){
      let str = history.location.search.split('=')[1]
      cookie.save('invite_code', str)
      // cookie.save('userName', '', { path: '/' })
      // cookie.save('userId', '', { path: '/' })
      // cookie.save('token', '', { path: '/' })
    }else{
      cookie.save('invite_code', '')
    }
    if(isPhone){
      setWidthNumber('77%')
      setSpinStatus(false)
    }else{
      setSpinStatus(true)
      setWidthNumber('400px')
    }
    if(isToken){
      const authName = (cookie.load('userName') && cookie.load('userName') != 'null') ? cookie.load('userName') : locales(language)['anonymous']
      setUserName(authName)

      getHistory()
      let request = new Request({});
      request.get('/api/v1/users/profile/').then(function(resData){
        cookie.save('totalExeNumber', resData.data.used_experience)
        cookie.save('experience', resData.data.reward_experience+resData.data.experience)
        setInviteCode(resData.data.invite_code)
      })
    }else{
      setSpinStatus(false)
      let menuSetitemList = [getItem(locales(language)['create_new_talk'] + '…', '01',<PlusCircleFilled />)]
      setItem([getItem('ChatTEN', 'sub1', '', menuSetitemList)])
      cookie.save('experience', '10', { path: '/' })
      cookie.save('totalExeNumber', '0', { path: '/' })
    }
  }, [language])

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
            <div className="headerRight">
              <img src={require("../../assets/language.png")} alt=""/>
              <div className='language' onClick={chooseLanguage}>{language}</div>
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
            </div>

            // </div>
            :
            <div className="headerRight">
            {/* <div className="headerRight" onClick={showModal}> */}
            <img src={require("../../assets/language.png")} alt=""/>
            <div className='language' onClick={chooseLanguage}>{locales(language)['language']}</div>
              <div className="headerRight">
                <img src={require("../../assets/noLoginIcon.png")} alt=""/>
                <div><Link to='/Login'>{locales(language)['login']}</Link></div>
              </div>

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
            {
              items ?
              <Menu
                onClick={menuClick}
                onOpenChange={historyMenu}
                style={{
                  width: '100%',
                  background:'#202123',
                  color:'white',
                  maxHeight: '400px',
                  overflow: 'scroll'
                }}
                defaultSelectedKeys={['1']}
                defaultOpenKeys={['sub1']}
                mode="inline"
                items={items}
                theme="#202123"

              />
              :''
            }

            <div className="otherMenuBox">
              <div className="otherMenuItem">
                <div className="otherMenuLeft" onClick={deleteTopic}>
                  <img src={require("../../assets/delete.png")} alt=""/>
                  <div>
                    {locales(language)['clear_chat_hitstory']}
                  </div>
                </div>
              </div>
              <div className="otherMenuItem">
                <div className="otherMenuLeft">
                  <img src={require("../../assets/reply.png")} alt=""/>
                  <div style={{width:'90%'}}>
                    <div className='otherMenuRight'>
                      <div className='otherMenuRightDiv'>{locales(language)['experience_count']}<span className='leftNumber'>{totalExeNumber ? totalExeNumber : 0}/{experience ? experience : 10}</span></div>
                      <div className='otherMenuRightItem shareCursor' onClick={shareFunction}>
                        <img src={require("../../assets/share.png")} alt=""/>
                        <div>
                          {locales(language)['share']}
                        </div>
                      </div>
                    </div>
                    <div className='leftBottom'>{locales(language)['share_slogan']}</div>
                  </div>
                </div>

              </div>
            </div>
            <div className='memberBox' onClick={noFunction}>
              <div className='memberHeaderBg'>
                <div className='memberHeader'>
                  <img src={require("../../assets/vipHeader.png")} alt=""/>
                  <div>{locales(language)['vip']}</div>
                </div>
              </div>
              <div className='memberBottomBox'>
                <div className='memberBottom'>
                  <div className='memberBoItem'>
                    <img src={require("../../assets/infinite.png")} alt=""/>
                    <div>{locales(language)['unlimit']}</div>
                  </div>
                  <div className='memberBoItem'>
                    <img src={require("../../assets/faster.png")} alt=""/>
                    <div>{locales(language)['faster']}</div>
                  </div>
                  <div className='memberBoItem'>
                    <img src={require("../../assets/stabilize.png")} alt=""/>
                    <div>{locales(language)['stable']}</div>
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
          <Button type="primary"><Link to='/Login'>{locales(language)['login']}</Link></Button>
          <Button type="default"><Link to='/SignIn'>{locales(language)['register']}</Link></Button>
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
              {
                items ?
                <Menu
                  onClick={menuClick}
                  onOpenChange={historyMenu}
                  style={{
                    width: '100%',
                    background:'#202123',
                    color:'white',
                    maxHeight: '400px',
                    overflow: 'scroll'
                  }}
                  defaultSelectedKeys={['1']}
                  defaultOpenKeys={['sub1']}
                  mode="inline"
                  items={items}
                  theme="#202123"

                />
                :''
              }

              <div className="otherMenuBox">
                <div className="otherMenuItem">
                  <div className="otherMenuLeft" onClick={deleteTopic}>
                    <img src={require("../../assets/delete.png")} alt=""/>
                    <div>
                      {locales(language)['clear_chat_hitstory']}
                    </div>
                  </div>
                </div>
                <div className="otherMenuItem">
                  <div className="otherMenuLeft">
                    <img src={require("../../assets/reply.png")} alt=""/>
                    <div style={{width:'90%'}}>
                      <div className='otherMenuRight'>
                        <div className='otherMenuRightDiv'>{locales(language)['experience_count']}<span className='leftNumber'>{totalExeNumber ? totalExeNumber : 0}/{experience ? experience : 10}</span></div>
                        <div className='otherMenuRightItem shareCursor' onClick={shareFunction}>
                          <img src={require("../../assets/share.png")} alt=""/>
                          <div>
                           {locales(language)['share']}
                          </div>
                        </div>
                      </div>
                      <div className='leftBottom'>{locales(language)['share_slogan']}</div>
                    </div>
                  </div>

                </div>
              </div>
              <div className='memberBox' onClick={noFunction}>
                <div className='memberHeaderBg'>
                  <div className='memberHeader'>
                    <img src={require("../../assets/vipHeader.png")} alt=""/>
                    <div>{locales(language)['vip']}</div>
                  </div>
                </div>
                <div className='memberBottomBox'>
                  <div className='memberBottom'>
                    <div className='memberBoItem'>
                      <img src={require("../../assets/infinite.png")} alt=""/>
                      <div>{locales(language)['unlimit']}</div>
                    </div>
                    <div className='memberBoItem'>
                      <img src={require("../../assets/faster.png")} alt=""/>
                      <div>{locales(language)['faster']}</div>
                    </div>
                    <div className='memberBoItem'>
                      <img src={require("../../assets/stabilize.png")} alt=""/>
                      <div>{locales(language)['stable']}</div>
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
                <div className="headerRight">
                  <img src={require("../../assets/language.png")} alt=""/>
                  <div className='language' onClick={chooseLanguage}>{language}</div>
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
                </div>
               
              // </div>
              :
              <div className="headerRight">
              {/* <div className="headerRight" onClick={showModal}> */}
              <img src={require("../../assets/language.png")} alt=""/>
              <div className='language' onClick={chooseLanguage}>{language}</div>
                <div className='login-btn'>
                  <img src={require("../../assets/noLoginIcon.png")} alt=""/>
                  <div><Link to='/Login'>{locales(language)['login']}</Link></div>
                </div>

                {/* <span>/</span>
                <div>注册</div> */}
              </div>
          }
        </div>
        <Content language={language}></Content>
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
          <Button type="primary"><Link to='/Login'>{locales(language)['login']}</Link></Button>
          <Button type="default"><Link to='/SignIn'>{locales(language)['register']}</Link></Button>
        </div>
      </Modal>
    </div>
    }
    </div>
  );
};
export default App;