import './chatPage.css'
import '../headerBox/header.css'


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
let info = navigator.userAgent;
let isPhone = /mobile/i.test(info);
const { TextArea } = Input;
const App = () => {
  const isToken = cookie.load('token')
  const topicId = cookie.load('topicId')
  const experience = cookie.load('experience')
  const points = cookie.load('points')
  const totalExeNumber = cookie.load('totalExeNumber')
  const [userName, setUserName] = useState('');
  const [questionValue, setQuestionValue] = useState('');
  const [chatList, setChatList] = useState([]);
  const [spinStatus, setSpinStatus] = useState(true);
  // const [spinStatus, setSpinStatus] = useState(true);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [inputValue, setInputValue] = useState('');
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
  let str = '```import multiprocessing class MySingleton:    def __init__(self):        self.value = 0    def reset(self):        self.value = 0my_singleton = Nonedef get_singleton():    global my_singleton    if my_singleton is None:        my_singleton = multiprocessing.Manager().Value(MySingleton())    return my_singleton.value```'
  let strCopy = converter.makeHtml(str)
  const fetchData = (topicId,type) => {
      let request = new Request({});
      let _this = this
      setSpinStatus(true)
      request.get('/api/v1/topics/'+topicId+'/records/?page=1&offset=20&order=id').then(function(resData){
        if(resData.code != 0){
          history.push({pathname: '/', state: { test: 'noToken' }})
        }
        for(let i in resData.data){
          // if(resData.data[i].answer.indexOf('```') > -1){
          //   resData.data[i].answer = resData.data[i].answer.replace(/```/g,'```')
          // }
          if(resData.data[i].answer.indexOf('\n') > -1){
            resData.data[i].answer = resData.data[i].answer.replace(/\n/g,'<br />')
          }
            resData.data[i].answer = converter.makeHtml(resData.data[i].answer)
        }
        setChatList(resData.data ? resData.data : [])
        if(resData.code == 0){
          setTimeout(function(){
            setSpinStatus(false)
            document.getElementsByClassName('chatBox')[0].scrollTop = document.getElementsByClassName('chatBox')[0].scrollHeight;
            if(type == 1){
              // document.querySelector('.chatBox').lastElementChild.lastElementChild.lastElementChild.firstElementChild.lastElementChild.style.display = 'none'
            }
          },700)

        }
      })
  }
  const maxNumber = 100000000
  const minNumber = 0
  const getHistory = () => {
    let request = new Request({});
    setSpinStatus(true)

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
              // subItem.push(getItem("  "+resItemData.data[j].question, resItemData.data[j].add_time))
          //   }
          // })
          menuSetitemList.push(getItem(resData.data[i].title, resData.data[i].id,<MessageOutlined />,subItem))
          // menuSetitemList.push(getItem(resData.data[i].title, resData.data[i].id,<MessageOutlined />,[]))
        }
      }
      setTimeout(function(){
        setItem([getItem('ChatTEN', 'sub1', '', menuSetitemList)])
        setSpinStatus(false)
      },1000)
    })
  }
  const addMenu = (id,value) => {
    let itemsCopy = [...items]
    for(let i in itemsCopy[0].children){
      if(itemsCopy[0].children[i].key == id){
        itemsCopy[0].children[i].children.push(getItem("  "+value, Math.random()*(maxNumber-minNumber+1)+minNumber))
      }
    }
    setTimeout(function(){
      setItem(itemsCopy)
    },700)
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
  const onSearchFunc = (value) => {
    if(isInputEnterStatus){
      // if(Number(totalExeNumber) >= Number(experience)){
      if(Number(experience) === 0){
        setQuestionValue('')
        value.target.value = ''
        message.info(locales(language)['beyond_limit'])
        return
      }else{
        // setSpinStatus(true)
        if(!questionValue && !value.target.value && value.target.value.trim() == ''){
          message.error('The question cannot be empty')
          setQuestionValue(value.target.value.trim())
          value.target.value = value.target.value.trim()
          setSpinStatus(false)
          return
        }else{
          isLoading(true)
          setIsInputEnterStatus(false)
          setQuestionValue(value.target.value)
          const questionObj = [...chatList]
          questionObj.push({
            "msg_type": 1, //消息类型
            "msg_type_name": "text", //消息类型描述
            "question": questionValue, //问题内容
            "answer": '', //回复内容
            "approval": 0, //点赞数
            "question_time": "2023-03-02 16:49:46", //提问时间
            "response_time": "2023-03-02 16:49:54", //回答时间
            "add_time": "2023-03-02 16:49:46" //创建时间
          })
          setChatList(questionObj)
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
          const eventList = document.createElement("ul")
          setTimeout(function(){
            evtSource.addEventListener("message", function(e) {
              const divBox = document.querySelector('.chatBox').lastElementChild.lastElementChild.lastElementChild.firstElementChild
              if(JSON.parse(e.data).status == '-1'){
                setSpinStatus(false)
                // setInputDisabled(false)
                isLoading(false)
                setIsInputEnterStatus(true)
                evtSource.close();
              }else{
                const newElement = document.createElement("li");
                newElement.innerHTML = converter.makeHtml(JSON.parse(e.data).text)
                eventList.appendChild(newElement);
                if(JSON.parse(e.data).text.indexOf('\n\n') > -1 || JSON.parse(e.data).text.indexOf('\n') > -1 || JSON.parse(e.data).text.indexOf('···') > -1){
                  const newElementSpan = document.createElement("div");
                  newElementSpan.innerHTML ="<br/><br/>"
                  eventList.appendChild(newElementSpan);
                  // divBox.append(eventList)
                }
                divBox.append(eventList)
              }
              document.getElementsByClassName('chatBox')[0].scrollTop = document.getElementsByClassName('chatBox')[0].scrollHeight;

              // newElement.textContent = JSON.parse(e.data).text

            })
          },1000)
          setTimeout(function(){
            document.getElementsByClassName('chatBox')[0].scrollTop = document.getElementsByClassName('chatBox')[0].scrollHeight;
          },10)
          // cookie.save('topicId', '')
          request.post('/api/v1/chat/question/',obj).then(function(resData){
            if(resData.code == '200100'){
              questionObj.pop()
              setChatList(questionObj)
              setSpinStatus(false)
              isLoading(false)
              evtSource.close();
              value.target.value = ''
              setQuestionValue('')
              message.error(resData.msg)
              setIsInputEnterStatus(true)
              // if(Number(totalExeNumber) >= Number(experience)){
                // message.error(resData.msg)
              // }else{
              //   setIsModalOpen(true)
              // }

            }else if(resData.code == '200102'){
              questionObj.pop()
              setChatList(questionObj)
              setSpinStatus(false)
              isLoading(false)
              evtSource.close();
              value.target.value = ''
              setQuestionValue('')
              setIsModalOpen(true)
              setIsInputEnterStatus(true)
            }else{
              // setIsModalOpen(true)
              // cookie.save('experience', resData.experience, { path: '/' })
              cookie.save('totalExeNumber', resData.data.experience, { path: '/' })
              cookie.save('experience', resData.data.experience, { path: '/' })

              cookie.save('topicId', resData.data.topic_id)

              if(isFirstStatus){
                getHistory()
                isFirst(false)
              }else{
                addMenu(resData.data.topic_id,questionValue)
              }
              setTimeout(function(){
                value.target.value = ''
                setQuestionValue('')
                history.push({pathname: '/ChatPage', state: { test: 'signin' }})
                evtSource.close();
                fetchData(resData.data.topic_id,1)
                setSpinStatus(false)
                // setInputDisabled(false)
                isLoading(false)
                setIsInputEnterStatus(true)
                // evtSource.close();
              },700)
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
    if(e.key == '01' && e.domEvent.target.textContent == locales(language)['create_new_talk'] + '…'){
      cookie.save('topicId', '')
      isFirst(true)
      linkSkip()
    }else if(e.domEvent.target.textContent == '  正在加载... ...'){
      message.info('Loading, please do not click')
      return
    }else if(e.keyPath[1] != cookie.load('topicId')){
      cookie.save('topicId', e.keyPath[1])
      fetchData(cookie.load('topicId'),2)
      // history.push({pathname: '/ChatPage', state: { test: 'login' }})
    }
  };

  const linkSkip =  () => {
    const isTokenStatus = cookie.load('token') ? true : false
    setChatList([])
    if(isTokenStatus) {
      history.push({pathname: '/ChatPage', state: { test: 'login' }})
      // fetchData(cookie.load('topicId'))
    }else{
      setSpinStatus(true)
      setTimeout(function(){
        setSpinStatus(false)
        history.push({pathname: '/ChatPage', state: { test: 'signin' }})
        // fetchData(cookie.load('topicId'))
      },1000)
    }
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
    },1000)
  }
  const shareFunction = () => {
    if(isToken){
      if(userName == '访客' || userName == 'anonymous'){
        message.info('Anonymous users cannot share')
        setTimeout(function(){
          history.push({pathname: '/SignIn'})
        },1000)
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
      },1000)
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
    },1000)
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
    if(isPhone){
      setWidthNumber('77%')
    }else{
      setWidthNumber('400px')
    }
    if(isToken){
      const authName = (cookie.load('userName') && cookie.load('userName') != 'null') ? cookie.load('userName') : locales(language)['anonymous']
      setUserName(authName)
      getHistory()
      let request = new Request({});
      request.get('/api/v1/users/profile/').then(function(resData){
        // cookie.save('totalExeNumber', resData.data.used_experience)
        // cookie.save('experience', resData.data.reward_experience+resData.data.experience)
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
    <div  style={{width:'100%'}}>
      {
        isPhone ?
          <div className="chatBigBox">
          {
            spinStatus ?
            <div className="example">
              <Spin />
            </div>
            : ''
          }
          <div className="headerBox">
            <div className="headerLeft" onClick={returnIndex}>
            <img src={require("../../assets/close.png")} alt=""/>
            {/* <Link to='/'><img src={require("../../assets/close.png")} alt=""/></Link> */}
            </div>
            <Popconfirm
              placement="leftTop"
              className="headerRight"
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
                          <div className="answer" dangerouslySetInnerHTML={{__html: item.answer}}></div>
                          <div className="answerZanBox">
                            <img src={require("../../assets/zan.png")} className="zan" alt=""/>
                            <img src={require("../../assets/cai.png")} className="noZan" alt=""/>
                          </div>
                        </div>
                      </div>
                  </div>
              })
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
                        onPressEnter={onSearchFunc}
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
                {/* <div className="footerTokenContent">服务由 SAMA network 提供</div> */}
              </div>
            </div>
          </div>
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
                    <Menu className='chatBoxMenu'
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
                              <div className="answer" dangerouslySetInnerHTML={{__html: item.answer}}></div>
                              <div className="answerZanBox">
                                <img src={require("../../assets/zan.png")} className="zan" alt=""/>
                                <img src={require("../../assets/cai.png")} className="noZan" alt=""/>
                              </div>
                            </div>
                          </div>
                      </div>
                  })
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
                            onPressEnter={onSearchFunc}
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
                    {/* <div className="footerTokenContent">服务由 SAMA network 提供</div> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


      }
      <Modal
        title="Do you want to start a new topic"
        open={isModalOpen}
        footer={null}
        style={{top: "30%"}}
        onCancel={handleCancel}
        closable
      >
        <div>
          The capacity of this topic is full. Please open a new topic to continue asking questions
        </div>
        <div style={{display: 'flex', justifyContent: 'space-around', margin: '20px 0'}}>
          <Button type="primary" onClick={handleOk}>ok</Button>
          <Button type="default" onClick={handleCancel}>cancel</Button>
          <Alert
            message="Warning Text Warning Text Warning TextW arning Text Warning Text Warning TextWarning Text"
            type="info"
            closable
            // onClose={onClose}
          />
        </div>
      </Modal>
    </div>
  );
};
export default App;