import './header.css'
import { Drawer, Menu, message, Spin, Popconfirm, Modal, Button, Alert } from 'antd';
import { PlusCircleFilled, MessageOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import Request from '../../request.ts';
import { Link } from 'react-router-dom'
import cookie, { setRawCookie } from 'react-cookies'
import { useHistory } from 'react-router-dom';
import Content from '../contentBox/content.js'
import Footer from '../footerBox/footer.js'
import copy from 'copy-to-clipboard';
import locales from '../../locales/locales.js'
import QRCode from "qrcode.react";

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
  console.log(data.language);
  const isToken = cookie.load('token')
  const experience = cookie.load('experience') ? cookie.load('experience') : 10
  const points = cookie.load('points') ? cookie.load('points') : 0
  const totalExeNumber = cookie.load('totalExeNumber') ? cookie.load('totalExeNumber') : 0
  const history = useHistory()
  const [userName, setUserName] = useState('');
  const [openid, setOpenid] = useState('');
  const [nickname, setNickname] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [open, setOpen] = useState(false);
  const [items, setItem] = useState([]);
  const [placement] = useState('left');
  const [spinStatus, setSpinStatus] = useState(true);
  const [widthNumber, setWidthNumber] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [shareDrawer, setShareDrawer] = useState(false);

  const language = data.language
  const setLanguage = data.setLanguage

  const [execOnce, setExecOnce]= useState(0)


  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  const showWithdrawModal = () => {
    setIsWithdrawModalOpen(true);
  };

  const handleWithdrawOk = () => {
    setIsWithdrawModalOpen(false);
    let appid = 'wx638bec1594b09d2f'
    let redirect_uri = encodeURIComponent('https://pay.citypro-tech.com')
    window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appid + '&redirect_uri=' + redirect_uri + '&response_type=code&scope=snsapi_userinfo&state=123#wechat_redirect'
  };

  const handleWithdrawCancel = () => {
    setIsWithdrawModalOpen(false);
  };


  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };

  const menuClick = (e) => {
    console.log('e ==== ', e)
    if(e.key === 'new_topic' && e.domEvent.target.textContent === locales(language)['create_new_talk'] + '…'){
      linkSkip()
    }else{
      if (isNaN(e.key)) {
        linkSkip()
      } else {
        cookie.save('topicId', e.key)
        cookie.load('topicId')
      }
      history.push({pathname: '/ChatPage', state: { test: 'login' }})
    }
  };
  const linkSkip =  () => {
    cookie.save('topicId', '')
    const isTokenStatus = cookie.load('token') ? true : false
    console.log('token = ', isTokenStatus);
    if(isTokenStatus) {
      history.push({pathname: '/ChatPage', state: { test: 'signin' }})
    }else{
      history.push({pathname: '/login', state: { test: 'login' }})
      // setSpinStatus(true)
      // let request = new Request({});
      // request.post('/api/v1/users/anonymous/',{
      //   invite_code: cookie.load('invite_code') ? cookie.load('invite_code') : null,
      // }).then(function(resData){
      //   cookie.save('userName', resData.data.nickname, { path: '/' })
      //   cookie.save('userId', resData.data.id, { path: '/' })
      //   cookie.save('token', resData.data.token, { path: '/' })
      //   cookie.save('topicId', '')
      //   setTimeout(function(){
      //     setSpinStatus(false)
      //     history.push({pathname: '/ChatPage', state: { test: 'signin' }})
      //   },1000)
      // })
    }
  }
  const getHistory = () => {
      let request = new Request({});
      setSpinStatus(true)
      request.get('/api/v1/topics/?page=1&offset=20&order=-id').then(function(resData){
        // cookie.save('experience', resData.experience, { path: '/' })
        // cookie.save('totalExeNumber', resData.used_experience, { path: '/' })

        let menuSetitemList = [getItem(locales(language)['create_new_talk'] + '…', 'new_topic', <PlusCircleFilled />)]
        for(let i in resData.data){
          if(i < 9){
            menuSetitemList.push(getItem(resData.data[i].title, resData.data[i].id,<MessageOutlined />))
          }
        }
        setTimeout(function(){
          setSpinStatus(false)
          setItem([getItem('ChatTEN', 'sub1', '', menuSetitemList)])
        }, 100)
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
    let menuSetitemList = [getItem(locales(language)['create_new_talk'] + '…', 'new_topic',<PlusCircleFilled />)]
    setItem([getItem('ChatTEN', 'sub1', '', menuSetitemList)])
    message.success('Exit succeeded')
    setTimeout(function(){
      setSpinStatus(false)
    }, 100)
  }
  
  const showShareDrawer = () => {
    setShareDrawer(true);
  };

  const onShareClose = (event) => {
    event.stopPropagation()
    setShareDrawer(false);
  };

  const goToPrice = () =>{
    if(isToken){
      history.push({pathname: '/price/'})
    }else{
      history.push({pathname: '/SignIn/'})
    }
  }

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const shareFunction = () => {
    console.log('zzzz')
    if(isToken){
      if(userName == '访客' || userName== 'anonymous'){
        message.info('Anonymous users cannot share')
        setTimeout(function(){
          history.push({pathname: '/SignIn/?type=1'})
        }, 10)
        return
      }else{
        showShareDrawer()
        // copy('https://pay.citypro-tech.com/?invite_code='+inviteCode)
        // message.success('Successfully copied, please share with friends')
      }
    }else{
      message.info(locales(language)['login_first'])
      setTimeout(function(){
        history.push({pathname: '/SignIn/?type=1'})
      }, 10)
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

  const onClosePolicy = () => {
    setShowPolicy(false);
  };

  const goToProtocol = () => {
    history.push({pathname: '/protocol/'})
  }

  useEffect(()=>{
    console.log('language', language)
    if(history.location.search){
      let str = history.location.search.split('=')[1]
      cookie.save('invite_code', str)
    }else{
      cookie.save('invite_code', '')
    }

    setSpinStatus(true)
    setWidthNumber('400px')

    if(isToken){
      const authName = (cookie.load('userName') && cookie.load('userName') != 'null') ? cookie.load('userName') : locales(language)['anonymous']
      setUserName(authName)

      getHistory()
      let request = new Request({});
      request.get('/api/v1/users/profile/').then(function(resData){
        cookie.save('totalExeNumber', resData.data.used_experience)
        cookie.save('experience', resData.data.reward_experience+resData.data.experience)
        cookie.save('points', resData.data.points)
        setInviteCode(resData.data.invite_code)
      })
    }else{
      setSpinStatus(false)
      let menuSetitemList = [getItem(locales(language)['create_new_talk'] + '…', 'new_topic',<PlusCircleFilled />)]
      setItem([getItem('ChatTEN', 'sub1', '', menuSetitemList)])
      cookie.save('experience', '10', { path: '/' })
      cookie.save('totalExeNumber', '0', { path: '/' })
    }
  }, [language])

  useEffect(()=>{
    let request = new Request({});
    let code = ''
    if(history.location.search.indexOf('code=')){
      code = history.location.search.split('&')[0].split('=')[1]
    }

    if(code != undefined){
      if(execOnce == 1){
        return
      }

      setExecOnce(1)
      // setIsWithdrawModalOpen(true);
      request.post('/api/v1/users/wechat/', {code:code}).then(function(data){
        let access_token = data.data['access_token']
        let openid = data.data['openid']
        setOpenid(data.data['openid'])
        request.get('/api/v1/users/wechat-profile/?access_token=' + access_token + '&openid=' + openid).then(function(data){
          console.log('userinfo=', data)
          cookie.save('openid', data.data.openid)
          cookie.save('nickname', data.data.nickname)
          setOpenid(data.data.openid)
          setNickname(data.data.nickname)
          setOpenid(data.data['openid'])
          request.post('/api/v1/asset/points-withdraw/', {realname: data.data['nickname'], point: points, openid: openid}).then(function(data){
            if(data.code === 0){
              message.info('提现成功')
              setTimeout(()=>{
                window.location.href = '/'
              }, 300000)
            }else{
              message.error(data.data.errcode)
              setTimeout(()=>{
                window.location.href = '/'
              }, 300000)
            }
          })
        })
      })
    }  
  }, [execOnce])

  function isWeixinBrowser() {
    let ua = navigator.userAgent.toLowerCase();
    console.log('isWeixinBrowser=', /micromessenger/.test(ua) ? true : false)
    return /micromessenger/.test(ua) ? true : false;
  }

  const bindWeixin = () =>{
    if(!isWeixinBrowser()){
      message.info("请使用微信浏览器打开本页面操作")
    }else{
      if(points<=10){
        message.error("少于10积分，不支持提现")
        return
      }
      console.log('withdraw')
      showWithdrawModal()  
    }
  }

  const goToRecord = () =>{
    history.push('/record/')
  }

  return (
    <div className="header-container">
      <div className='drawHeaderContainer' style={{display: 'flex',width: '100%'}}>
        <div style={{width: '30%', paddingTop: '15px',}}>
            <div className="drawHeaderBox" style={{marginBottom: '12px'}}>
                <img src={require("../../assets/logo.png")} alt=""/>
                <div>BETA</div>
              </div>

              <div>
                {
                  items ?
                  <Menu className='chatBoxMenu'
                    onClick={menuClick}
                    style={{
                      width: '100%',
                      background:'#202123',
                      color:'white',
                      maxHeight: '400px',
                      overflow: 'scroll',
                      padding: '0 5px'
                    }}
                    defaultSelectedKeys={['1']}
                    defaultOpenKeys={['sub1']}
                    mode="inline"
                    items={items}
                    theme="dark"

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
                          {/* <div className='otherMenuRightDiv'>{locales(language)['experience_count']}<span className='leftNumber'>{totalExeNumber ? totalExeNumber : 0}/{experience ? experience : 10}</span></div> */}
                          <div className='otherMenuRightDiv'>{locales(language)['experience_count']}: <span className='leftNumber'>{experience}</span></div>
                          <div className='otherMenuRightItem shareCursor' onClick={shareFunction}>
                            <img src={require("../../assets/share.png")} alt=""/>
                            <div>
                            {locales(language)['share']}
                            <Drawer className='shareDrawer1'
                              title="分享"
                              placement={'left'}
                              closable={false}
                              onClose={onShareClose}
                              open={shareDrawer}
                            >
                              <p className='shareLink' onClick={(eve)=>{copy('https://pay.citypro-tech.com/?invite_code='+inviteCode)
                                          message.success(locales(language)['copy_link'])}}>邀请链接（点击复制）:<br />{'https://pay.citypro-tech.com/?invite_code='+inviteCode}</p>
                              <p className='shareLink'>邀请二维码（右键保存）：</p>
                              <QRCode
                                className="qrcode"
                                value={'https://pay.citypro-tech.com/?invite_code='+inviteCode}
                                size={120} // 二维码图片大小（宽高115px）
                                bgColor="#fff1d1" // 二维码背景颜色
                                fgColor="#c7594a" // 二维码图案颜色
                                renderAs="svg"
                              />
                            </Drawer>
                            </div>
                          </div>
                        </div>
                        <div className='leftBottom'>{locales(language)['share_slogan']}</div>
                      </div>
                    </div>

                  </div>
                </div>
                <div className='memberBox'>
                  <div className='memberHeaderBg'>
                    <div className='memberHeader' onClick={goToPrice}>
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
                {isToken?
                <div className='my-score'>{locales(language)['myscore']}:{points} <span className='points-widthdraw' onClick={bindWeixin}>{locales(language)['withdraw']}</span><span className='points-records' onClick={goToRecord}> {locales(language)['check_record']}</span></div>
                :""
                }
                <Modal title={locales(language)['withdraw']} open={isWithdrawModalOpen} onOk={handleWithdrawOk} onCancel={handleWithdrawCancel}>
                  <p>{locales(language)['withdraw_confirm']}</p>
                </Modal>
                <div className='contactUs'>{locales(language)['contact_us']}</div>
                <div className='protocol' onClick={()=>{goToProtocol()}}>{locales(language)['protocol']}</div>
                <div className='policy' onClick={()=>{setShowPolicy(true)}}>{locales(language)['policy']}</div>
                {
                  showPolicy ?
                    <Alert className='policy-info'
                    message="用户分享&推广政策"
                    description={<div>
                      <div>1、注册即享受连续7天每天10次免费使用额度。</div>
                      <div>2、纯使用用户分享，比如用户A每分享给一个好友注册，用户A获得10次免费额度，他分享的好友注册成用户B，用户B即可获得连续7天每天10次的免费额度。</div>
                      <div>3、推广会员转化，如A用户分享的好友注册成为用户B之后，开通了会员，支付了100元会员费，用户A获得40%佣金即40元，如果用户B分享的好友注册成为用户C并开通了会员，支付了100元，用户B获得40%佣金40元，用户A获得8%佣金8元。</div>
                      <div>4、上述1、2和3不冲突，用户可以同时享受。</div>
                      <div>5、申请提现先点击左下角提现，再加微信：向日葵 xrkk2023，备注（提现）</div>
                    </div>}
                    type="info"
                    closeText={<div>X</div>}
                    onClose={onClosePolicy}
                  />:""
                }

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
                      overlayClassName="headerRightConfirm"
                      arrowPointAtCenter={false}
                      title={ locales(language)['logoutTitle']}
                      onConfirm={signOut}
                      okText={locales(language)['yes']}
                      cancelText={locales(language)['no']}
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
          <Footer language={language} setLanguage={setLanguage} style={{width:'70%',left:'30%'} }></Footer>
        </div>

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
    </div>
  );
};
export default App;