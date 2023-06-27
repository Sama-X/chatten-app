
import { Drawer, Input, Spin, message, Menu, Popconfirm, Modal, Button, Alert } from 'antd';
import { useEffect, useState } from 'react';
import { UpCircleFilled } from '@ant-design/icons';
import { Link, useHistory } from 'react-router-dom'
import cookie from 'react-cookies'
import Request from '../../request.ts';
import {BASE_URL} from '../../utils/axios.js'
import { PlusCircleFilled, MessageOutlined } from '@ant-design/icons';
import copy from 'copy-to-clipboard';
import showdown from 'showdown'
import locales from '../../locales/locales.js'
import get_default_language from '../../utils/get_default_language.js'
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
const { TextArea } = Input;
const App = () => {
  const isToken = cookie.load('token')
  const experience = cookie.load('experience')
  const points = cookie.load('points')
  const [userName, setUserName] = useState('');
  const [questionValue, setQuestionValue] = useState('');
  const [chatList, setChatList] = useState([]);
  const [spinStatus, setSpinStatus] = useState(true);
  // const [spinStatus, setSpinStatus] = useState(true);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [items, setItem] = useState([]);
  const [open, setOpen] = useState(false);
  const [isFirstStatus, isFirst] = useState(false);
  const [isLoadingStatus, isLoading] = useState(false);
  const [widthNumber, setWidthNumber] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInputEnterStatus, setIsInputEnterStatus] = useState(true);
  const [language, setLanguage] = useState(get_default_language());

  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [shareDrawer, setShareDrawer] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [newData, setNewData] = useState({})

  const [experienceModal, setExperienceModal] = useState(false);


  const showShareDrawer = () => {
    setShareDrawer(true);
  };

  const onShareClose = (event) => {
    event.stopPropagation()
    setShareDrawer(false);
  };


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


  const converter = new showdown.Converter()
  const history = useHistory()
  const fetchData = (topicId,type) => {
      let request = new Request({});
      setSpinStatus(true)
      request.get('/api/v1/topics/'+topicId+'/records/?page=1&offset=20&order=id').then(function(resData){
        if(resData.code !== 0){
          history.push({pathname: '/', state: { test: 'noToken' }})
        }
        setChatList(resData.data ? resData.data : [])
        if(resData.code === 0){
          setTimeout(function(){
            setSpinStatus(false)
            document.getElementsByClassName('chatBox')[0].scrollTop = document.getElementsByClassName('chatBox')[0].scrollHeight;
          }, 100)

        }
      })
  }
  const getHistory = () => {
    let request = new Request({});
    setSpinStatus(true)

    request.get('/api/v1/topics/?page=1&offset=20&order=-id').then(function(resData){
    let menuSetitemList = [getItem(locales(language)['create_new_talk'] + '…', 'new_topic',<PlusCircleFilled />)]
      for(let i in resData.data){
        if(i < 9){
          menuSetitemList.push(getItem(resData.data[i].title, resData.data[i].id,<MessageOutlined />))
        }
      }
      setTimeout(function(){
        setItem([getItem('ChatTEN', 'sub1', '', menuSetitemList)])
        setSpinStatus(false)
      },100)
    })
  }

  const onPressEnter = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSearchFunc(e)
      return;
    }
  }

  const onSearchFunc = (value) => {
    if(isInputEnterStatus){
      // if(Number(totalExeNumber) >= Number(experience)){
      if(Number(experience) === 0){
        setQuestionValue('')
        value.target.value = ''
        message.info(locales(language)['beyond_limit'])
        setExperienceModal(true)
        return
      }else{
        // setSpinStatus(true)
        if(!questionValue && !value.target.value && value.target.value.trim() == ''){
          message.error(locales(language)['empty_question_error'])
          setQuestionValue(value.target.value.trim())
          value.target.value = value.target.value.trim()
          setSpinStatus(false)
          return
        }else{
          isLoading(true)
          setIsInputEnterStatus(false)
          setQuestionValue(value.target.value)
          let currentData = {
            "msg_type": 1, //消息类型
            "msg_type_name": "text", //消息类型描述
            "question": questionValue, //问题内容
            "answer": '', //回复内容
            "approval": 0, //点赞数
            "question_time": "2023-03-02 16:49:46", //提问时间
            "response_time": "2023-03-02 16:49:54", //回答时间
            "add_time": "2023-03-02 16:49:46", //创建时间
          }
          setNewData(currentData)

          let request = new Request({});
          let obj = {}
          const topicId = cookie.load('topicId')
          if(!topicId){
            obj = {question:questionValue}
          }else{
            obj = {question:questionValue,topic_id:topicId}
          }
          setQuestionValue('')
          // setInputDisabled(true)
          const evtSource = new EventSource(BASE_URL+'/chats/'+isToken);
          setTimeout(function(){
            evtSource.addEventListener("message", function(e) {
              if(JSON.parse(e.data).status == '-1'){
                setSpinStatus(false)
                isLoading(false)
                setIsInputEnterStatus(true)
                evtSource.close();
                setTimeout(() => {
                  setChatList([...chatList, Object.assign({}, currentData)])
                  setNewData({})
                }, 10);
              } else {
                currentData.answer = (currentData.answer || "") + JSON.parse(e.data).text
                setNewData(Object.assign({}, currentData))
              }
              setTimeout(() => {
                document.getElementsByClassName('chatBox')[0].scrollTop = document.getElementsByClassName('chatBox')[0].scrollHeight;
              }, 200);
            })
          }, 100)
          setTimeout(function(){
            document.getElementsByClassName('chatBox')[0].scrollTop = document.getElementsByClassName('chatBox')[0].scrollHeight;
          }, 100)
          // cookie.save('topicId', '')
          request.post('/api/v1/chat/question/',obj).then(function(resData){
            if(resData.code == '200100'){
              setSpinStatus(false)
              isLoading(false)
              evtSource.close();
              value.target.value = ''
              setQuestionValue('')
              message.error(resData.msg)
              setIsInputEnterStatus(true)
              setNewData({})
            }else if(resData.code == '200102'){
              setSpinStatus(false)
              isLoading(false)
              evtSource.close();
              value.target.value = ''
              setQuestionValue('')
              setIsModalOpen(true)
              setIsInputEnterStatus(true)
              setNewData({})
            }else{
              cookie.save('totalExeNumber', resData.data.experience, { path: '/' })
              cookie.save('experience', resData.data.experience, { path: '/' })

              cookie.save('topicId', resData.data.topic_id)

              if(isFirstStatus){
                isFirst(false)
              }
            }
          }).catch(function(err) {
              value.target.value = ''
              setQuestionValue('')
              evtSource.close();
              if(cookie.load('topicId')){
                fetchData(cookie.load('topicId'),2)
                isFirst(false)
              }else{
                isFirst(true)
              }
              setSpinStatus(false)
              // setInputDisabled(false)
              isLoading(false)
              setIsInputEnterStatus(true)
              setNewData({})
          })
        }
      }
    }else{
      message.error('Please do not click repeatedly')
      return
    }
  }
  const onChangeInput = (value) => {
    setQuestionValue(value.target.value)
  }

  const returnIndex = () =>{
    cookie.save('topicId', '')
    history.push({pathname: '/', state: { test: 'noToken' }})
  }

  const menuClick = (e) => {
    if(e.key === 'new_topic' && e.domEvent.target.textContent === locales(language)['create_new_talk'] + '…'){
      cookie.save('topicId', '')
      isFirst(true)
      linkSkip()
    }else if (e.key !== cookie.load('topicId')){
      if (!isNaN(e.key)) {
        cookie.save('topicId', e.key)
        fetchData(e.key)
      }
    }
  };

  const linkSkip =  () => {
    cookie.save('topicId', '')
    setChatList([])
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

  function isWeixinBrowser() {
    let ua = navigator.userAgent.toLowerCase();
    return /micromessenger/.test(ua) ? true : false;
  }

  const copyContent = (value) => {
    copy(value)
    message.success(locales(language)['copy_success'])
  }

  const bindWeixin = () =>{
    if(!isWeixinBrowser()){
      message.info("请使用微信浏览器打开本页面操作")
    }else{
      if(points<=10){
        message.error("少于10积分，不支持提现")
        return
      }
      showWithdrawModal()  
    }
  }

  const goToRecord = () =>{
    history.push('/record/')
  }


  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };
  const signOut = () => {
    setSpinStatus(true)
    cookie.save('userName', '', { path: '/' })
    cookie.save('userId', '', { path: '/' })
    cookie.save('token', '', { path: '/' })
    cookie.save('experience', '', { path: '/' })
    cookie.save('totalExeNumber', '', { path: '/' })
    cookie.save('topicId', '')
    cookie.save('points', '')
    message.success('Exit succeeded')
    setTimeout(function(){
      setSpinStatus(false)
      history.push({pathname: '/'})
    },10)
  }
  const shareFunction = () => {
    if(isToken){
      if(userName == '访客' || userName == 'anonymous'){
        message.info('Anonymous users cannot share')
        setTimeout(function(){
          history.push({pathname: '/SignIn'})
        },10)
        return
      }else{
        let request = new Request({});
        request.get('/api/v1/users/profile/').then(function(resData){
          setInviteCode(resData.data.invite_code)
          showShareDrawer()
          // copy('https://pay.citypro-tech.com/?invite_code='+resData.data.invite_code)
          // message.success('Successfully copied, please share with friends')
        })
      }
    }else{
      message.info(locales(language)['login_first'])
      setTimeout(function(){
        history.push({pathname: '/SignIn'})
      },10)
      return
    }
  }
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
    cookie.save('topicId', '')
    isFirst(true)
    setTimeout(function(){
      setChatList([])
    }, 10)
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const chooseLanguage = () => {
    if(cookie.load('language') == '中文'){
      cookie.save('language', 'English')
      setLanguage('English')
    }else{
      cookie.save('language', '中文')
      setLanguage('中文')
    }
  };

  const goToPrice = () =>{
    if(isToken){
      history.push({pathname: '/price/'})
    }else{
      history.push({pathname: '/SignIn/'})
    }
  }

  const onClosePolicy = () => {
    setShowPolicy(false);
  };

  useEffect(()=>{
    setTimeout(function(){
      document.getElementsByClassName('chatBox')[0].scrollTop = document.getElementsByClassName('chatBox')[0].scrollHeight;
    },10)
    setWidthNumber('400px')
    if(isToken){
      const authName = (cookie.load('userName') && cookie.load('userName') != 'null') ? cookie.load('userName') : locales(language)['anonymous']
      setUserName(authName)
      getHistory()
      let request = new Request({});
      request.get('/api/v1/users/profile/').then(function(resData){
        cookie.save('experience', resData.data.experience)
        cookie.save('points', resData.data.points)
      })
    }else{
      cookie.save('topicId', '')
      history.push({pathname: '/', state: { test: 'noToken' }})
    }
    if(cookie.load('topicId')){
      fetchData(cookie.load('topicId'),2)
      isFirst(false)
    }else{
      isFirst(true)
    }
  }, [language])

  const goToProtocol = () => {
    history.push({pathname: '/protocol/'})
  }

  return (
    <div className='PCchatPageContainer' style={{width:'100%'}}>
        <div style={{display: 'flex',width: '100%'}}>
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
                      overflow: 'scroll'
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
                                  <p className='shareLink' onClick={()=>{copy('https://pay.citypro-tech.com/?invite_code='+inviteCode)
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
                  <div className='memberBox' onClick={goToPrice}>
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
                  {isToken?<div className='chat-my-score'>{locales(language)['myscore']}:{points} <span className='points-widthdraw' onClick={bindWeixin}>{locales(language)['withdraw']}</span><span className='points-records' onClick={goToRecord}>  |  {locales(language)['check_record']}</span></div>
                  : ""}
                  <Modal title={locales(language)['withdraw']} open={isWithdrawModalOpen} onOk={handleWithdrawOk} onCancel={handleWithdrawCancel}>
                    <p>{locales(language)['withdraw_confirm']}</p>
                  </Modal>
                  <div className='chat-contactUs'>{locales(language)['contact_us']}</div>
                  <div className='chat-protocol' onClick={()=>{goToProtocol()}}>{locales(language)['protocol']}</div>
                  <div className='chat-policy' onClick={()=>{setShowPolicy(true)}}>{locales(language)['policy']}</div>
              {
                showPolicy ?
                  <Alert className='chat-policy-info'
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
              <div className="headerLeft" onClick={returnIndex}>
                <img src={require("../../assets/close.png")} alt=""/>
              </div>
              {
                isToken ?
                  // <div className="headerRight">
                  <div className='headerRight'>
                    <img src={require("../../assets/language.png")} alt=""/>
                    <div className='language' onClick={chooseLanguage}>{language}</div>
                    <Popconfirm
                      placement="leftTop"
                      className="headerRight"
                      overlayClassName="headerRightConfirm"
                      title={ locales(language)['logoutTitle']}
                      description=''
                      onConfirm={signOut}
                      okText={locales(language)['yes']}
                      cancelText={locales(language)['no']}
                    >
                      <img src={require("../../assets/noLoginIcon.png")} alt=""/>
                      <div>{ userName }</div>
                    </Popconfirm>
                  </div>
                  // {/* </div> */}
                  :
                  <div className="headerRight">
                  {/* <div className="headerRight" onClick={showModal}> */}
                    <img src={require("../../assets/noLoginIcon.png")} alt=""/>
                    <div><Link to='/Login'>{locales(language)['login']}</Link></div>
                    {/* <span>/</span>
                    <div>注册</div> */}
                  </div>
              }
            </div>
            {/* <div  className="answer" style={{marginTop: '100px'}} dangerouslySetInnerHTML={{__html: strCopy}}></div> */}
            <div>
                <div className="chatBox">
                {/* question */}
                {/* chatList */}
                {
                  chatList.length == 0 ?
                  <div>{locales(language)['nodata']}</div>
                  :
                  chatList.map((item, index)=>{

                  return  <div key={index} className="queAndans">
                      <div className='questionBox'>
                          <img src={require("../../assets/noLoginIcon.png")} alt=""/>
                          <div className="question">{item.question}</div>
                      </div>
                      <div className='answerBox'>
                        <img className='answerAvator' src={require("../../assets/aiImg.png")} alt=""/>
                        <div className="answerContent">
                          {/* <div className="answer">{item.answer}</div> */}
                          <div className="answer" dangerouslySetInnerHTML={{__html: converter.makeHtml(item.answer)}}></div>
                          <div className="answerZanBox">
                            { locales(language)['ai_warning'] } 
                            <span
                              className="copy"
                              onClick={(eve)=>{copyContent(item.answer)}}>
                              { locales(language)['copy'] }</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  })
              }
              {
                (newData && newData.question) ?
                  <div className="queAndans">
                    <div className='questionBox'>
                      <img src={require("../../assets/noLoginIcon.png")} alt=""/>
                      <div className="question">{newData.question}</div>
                    </div>
                    <div className='answerBox'>
                      <img className='answerAvator' src={require("../../assets/aiImg.png")} alt=""/>
                      <div className="answerContent">
                        <div className="answer" dangerouslySetInnerHTML={{__html: converter.makeHtml(newData.answer)}}></div>
                      </div>
                    </div>
                  </div>
                : ""
              }

              </div>
              <ul className="isMessage"></ul>
              <div className="footerBox">
                {/* noToken */}
                <div className="footerTokenBox">
                  {/* {
                    isToken ? */}
                    <div className="tokenInputBox">
                      {/* <div> */}
                        {
                          isLoadingStatus ?
                          <div className="inputLoading">
                            <Spin />
                          </div>
                          : ''
                        }
                          {/* <Input
                            style={{
                              color: '#000000'
                            }}
                            disabled={inputDisabled}
                            onPressEnter={onSearchFunc}
                            onChange={onChangeInput}
                            value={questionValue}
                            className="tokenInput"
                          /> */}
                          <TextArea rows={1}
                            style={{
                              color: '#000000',
                              paddingRight: "50px",
                              width: "90%",
                              borderRadius: '10px',
                              textAlign: 'left',
                            }}
                            autoSize={{
                              minRows: 1,
                              maxRows: 3,
                            }}
                            disabled={inputDisabled}
                            onPressEnter={onPressEnter}
                            onChange={onChangeInput}
                            value={questionValue}
                            className="tokenInput"
                            placeholder={locales(language)['please_input']}
                          />
                      {/* </div> */}
                      <UpCircleFilled onClick={onSearchFunc} className="tokenIcon" style={{ fontSize: '28px',color: "#E84142", marginTop: '3px' }}/>
                    </div>
                    {/* :
                    <div className="noTokenBtn">
                      <Link to='/Login'>登录</Link>
                      <span>/</span>
                      <Link to='/SignIn'>注册</Link>
                      以开始聊天
                    </div>
                  } */}
                  <div className="footerBottomBox">
                    <div className="footerLeftBox">
                      <img src={require("../../assets/reply.png")} className="footerQuestion" alt=""/>
                      {/* <div><span>{locales(language)['ask_free']}</span>{totalExeNumber ? totalExeNumber : 0}/{experience ? experience : 10}</div> */}
                      <div><span>{locales(language)['ask_free']}: </span>{experience}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      <Modal
        title={locales(language)['whether_create_new_topic_title']}
        open={isModalOpen}
        footer={null}
        style={{top: "30%"}}
        wrapClassName='new_topic_modal'
        onCancel={handleCancel}
        closable
      >
        <div>
          { locales(language)['whether_create_new_topic_content']}
        </div>
        <div style={{display: 'flex', justifyContent: 'space-around', margin: '20px 0'}}>
          <Button type="primary" onClick={handleOk}>{locales(language)['ok']}</Button>
          <Button type="default" onClick={handleCancel}>{locales(language)['cancel']}</Button>
        </div>
      </Modal>

      <Modal
        title={locales(language)['no_experience_title']}
        open={experienceModal}
        footer={null}
        style={{top: "30%"}}
        wrapClassName='no_experience_modal'
        onCancel={() => setExperienceModal(false)}
        closable
      >
        <div dangerouslySetInnerHTML={{__html: locales(language)['no_experience_content']}}>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-around', margin: '20px 0'}}>
          <Button type="primary" onClick={goToPrice}>{locales(language)['purchase']}</Button>
          <Button type="primary" onClick={showShareDrawer}>{locales(language)['invite']}</Button>
          <Button type="default" onClick={() => setExperienceModal(false)}>{locales(language)['cancel']}</Button>
        </div>
      </Modal>
    </div>
  );
};
export default App;