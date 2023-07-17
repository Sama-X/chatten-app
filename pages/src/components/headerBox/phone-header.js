import { Drawer, Menu, message, Spin, Modal, Alert, Space, Dropdown } from 'antd';
import { PlusCircleFilled, MessageOutlined, DownOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import Request from '../../request.ts';
import { Link } from 'react-router-dom'
import cookie, { setRawCookie } from 'react-cookies'
import copy from 'copy-to-clipboard';
import locales from '../../locales/locales.js'
import { useHistory } from 'react-router-dom';
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

const App = (data) => {
  console.log("language = ", data.language);
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
  const [showPolicy, setShowPolicy] = useState(false);
  const [shareDrawer, setShareDrawer] = useState(false);

  const language = data.language
  const setLanguage = data.setLanguage

  const [execOnce, setExecOnce]= useState(0)

  const logout = function () {
    cookie.save('userName', '', { path: '/' })
    cookie.save('userId', '', { path: '/' })
    cookie.save('token', '', { path: '/' })
    cookie.save('experience', '', { path: '/' })
    cookie.save('totalExeNumber', '', { path: '/' })
    cookie.save('points', '', { path: '/' })
    cookie.save('inviteCode', '', { path: '/' })
    cookie.save('openid', '', { path: '/' })
    cookie.save('nickname', '', { path: '/' })
    cookie.save('avatar', '', { path: '/' })
    cookie.save('isLogin', '', { path: '/' })
  }

  const changePassword = () => {
    history.push({pathname: '/changePassword', state: { test: 'login' }})
  }

  const goToRecord = () =>{
    history.push('/record/')
  }

  const goToProfile = () =>{
    if(isToken){
      history.push({pathname: '/profile/'})
    }else{
      history.push({pathname: '/SignIn/'})
    }
  }


  const userItems = [
    {
      key: '1',
      label: (
        <a rel="noopener noreferrer" onClick={ changePassword }>
          {locales(language)['change_password']}
        </a>
      ),
    },
    {
      key: '2',
      label: (
        <a rel="noopener noreferrer" onClick={ goToRecord }>
          {locales(language)['my_order']}
        </a>
      ),
    },
    {
      key: '3',
      label: (
        <a rel="noopener noreferrer" onClick={ goToProfile }>
          {locales(language)['my_profile']}
        </a>
      ),
    },
    {
      key: '100',
      label: (
        <a rel="noopener noreferrer" onClick={ logout } >
          {locales(language)['logout']}
        </a>
      ),
    },
  ]

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
    }
  }
  const getHistory = () => {
      let request = new Request({});
      // setSpinStatus(true)
      request.get('/api/v1/topics/?page=1&offset=20&order=-id').then(function(resData){
        let menuSetitemList = [getItem(locales(language)['create_new_talk'] + '…', 'new_topic', <PlusCircleFilled />)]
        for(let i in resData.data){
          if(i < 9){
            menuSetitemList.push(getItem(resData.data[i].title, resData.data[i].id,<MessageOutlined />))
          }
        }
        setTimeout(function(){
          // setSpinStatus(false)
          setItem([getItem('ChatTEN', 'sub1', '', menuSetitemList)])
        }, 100)
      })
  }
  
  const deleteTopic = () => {
    let request = new Request({});
    request.delete('/api/v1/topics/').then(function(resData){
      getHistory()
      message.success('Successfully cleared')
    })
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

  const shareFunction = () => {
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
    if(history.location.search){
      let str = history.location.search.split('=')[1]
      cookie.save('invite_code', str)
    }else{
      cookie.save('invite_code', '')
    }
    setWidthNumber('77%')
    setSpinStatus(false)
    if(isToken){
      const authName = (cookie.load('userName') && cookie.load('userName') != 'null') ? cookie.load('userName') : locales(language)['anonymous']
      setUserName(authName)

      getHistory()
      let request = new Request({});
      request.get('/api/v1/users/profile/').then(function(resData){
        cookie.save('totalExeNumber', resData.data.used_experience)
        cookie.save('experience', resData.data.reward_experience+resData.data.experience)
        cookie.save('points', resData.data.points)
        cookie.save('email', resData.data.email)
        cookie.save('nickname', resData.data.nickname)
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

  return (
    <div className="header-container">
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
              <img src={require("../../assets/language.png")} alt=""/>
              <div className='language' onClick={chooseLanguage}>{language}</div>
              <Dropdown overlayClassName="header-dropdown" menu={{ items: userItems }}>
                <span>
                  <Space>
                    <img src={require("../../assets/noLoginIcon.png")} alt=""/>
                    <div>{ userName }</div>
                    <DownOutlined />
                  </Space>
                </span>
              </Dropdown>
            </div>
            
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

        <Drawer
          width={'300px'}
          placement={placement}
          closable={false}
          onClose={onClose}
          open={open}
          key={placement}
          drawerStyle={{background:'#202123',color:'white'}}
        >
          <div className="drawHeaderBox">
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
                            placement={'bottom'}
                            closable={false}
                            onClose={onShareClose}
                            open={shareDrawer}
                          >
                            <p className='shareLink' onClick={(eve)=>{copy('https://pay.citypro-tech.com/?invite_code='+inviteCode)
                                        message.success(locales(language)['copy_link'])}}>邀请链接（点击复制）:<br />{'https://pay.citypro-tech.com/?invite_code='+inviteCode}</p>
                            <p className='shareLink'>邀请二维码（截图保存）：</p>
                            <QRCode
                              className="qrcode"
                              value={'https://pay.citypro-tech.com/?invite_code='+inviteCode}
                              size={120} // 二维码图片大小（宽高115px）
                              bgColor="#fff1d1" // 二维码背景颜色
                              fgColor="#c7594a" // 二维码图案颜色
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
              {isToken?
              <div className='mobile-my-score'>{locales(language)['myscore']}:{points} <span className='points-widthdraw' onClick={bindWeixin}>{locales(language)['withdraw']}</span><span className='points-records' onClick={goToRecord}>  |  {locales(language)['check_record']}</span></div>
              :""}
              <Modal title={locales(language)['withdraw']} open={isWithdrawModalOpen} onOk={handleWithdrawOk} onCancel={handleWithdrawCancel}>
                <p>{locales(language)['withdraw_confirm']}</p>
              </Modal>
              <div className='mobile-contactUs'>{locales(language)['contact_us']}</div>
              <div className='mobile-protocol' onClick={()=>{goToProtocol()}}>{locales(language)['protocol']}</div>
              <div className='mobile-policy' onClick={()=>{setShowPolicy(true)}}>{locales(language)['policy']}</div>
              {
                showPolicy ?
                  <Alert className='policy-info-mobile'
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
        </Drawer>
      </div>
    </div>
  );
};
export default App;