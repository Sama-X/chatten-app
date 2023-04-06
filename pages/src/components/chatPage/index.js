import './chatPage.css'
import '../headerBox/header.css'


import { Input, Spin, message, Menu, Popconfirm } from 'antd';
import { useEffect, useState } from 'react';
import { UpCircleFilled } from '@ant-design/icons';
import { Link, useHistory } from 'react-router-dom'
import cookie from 'react-cookies'
import Request from '../../request.ts';
import {BASE_URL} from '../../utils/axios.js'
import { PlusCircleFilled, MessageOutlined } from '@ant-design/icons';


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

const App = () => {
  const isToken = cookie.load('token')
  const topicId = cookie.load('topicId')
  const experience = cookie.load('experience')
  const totalExeNumber = cookie.load('totalExeNumber')
  const [userName, setUserName] = useState('');
  const [questionValue, setQuestionValue] = useState('');
  const [chatList, setChatList] = useState([]);
  const [spinStatus, setSpinStatus] = useState(false);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [items, setItem] = useState([]);
  const [open, setOpen] = useState(false);
  const [widthNumber, setWidthNumber] = useState('');
  const history = useHistory()
  const fetchData = (topicId) => {
      let request = new Request({});
      setSpinStatus(true)
      request.get('/api/v1/topics/'+topicId+'/records/?page=1&offset=20&order=id').then(function(resData){
        if(resData.code != 0){
          history.push({pathname: '/', state: { test: 'noToken' }})
        }
        setSpinStatus(false)
        setChatList(resData.data ? resData.data : [])
        if(resData.code == 0){
          setTimeout(function(){
            document.getElementsByClassName('chatBox')[0].scrollTop = document.getElementsByClassName('chatBox')[0].scrollHeight;
          },100)
        }
      })
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
  const onSearchFunc = (value) => {
    if(Number(totalExeNumber) >= Number(experience)){
      message.info('Questioning more than ten times, reaching the upper limit')
    }else{
      // setSpinStatus(true)
      console.log(chatList,'chatList')
      if(!questionValue){
        message.error('The question cannot be empty')
        setSpinStatus(false)
        return
      }else{
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
        setInputDisabled(true)

        const evtSource = new EventSource(BASE_URL+'/chats/'+isToken);
        const eventList = document.createElement("ul")
        setTimeout(function(){
          const divBox = document.querySelector('.chatBox').lastElementChild.lastElementChild.lastElementChild.firstElementChild
          // console.log (divBox,'jk')
          evtSource.addEventListener("message", function(e) {
            // console.log(JSON.parse(e.data).text,'j')
            const newElement = document.createElement("li");
            newElement.textContent = JSON.parse(e.data).text
            eventList.appendChild(newElement);
            divBox.append(eventList)
          })
        },1000)
        setTimeout(function(){
          document.getElementsByClassName('chatBox')[0].scrollTop = document.getElementsByClassName('chatBox')[0].scrollHeight;
        },10)
        request.post('/api/v1/chat/question/',obj).then(function(resData){
          console.log(resData,'rrrr')
          if(resData.code == '200100'){
            message.error(resData.msg)
            setInputDisabled(false)
          }else{
            // cookie.save('experience', resData.experience, { path: '/' })
            cookie.save('totalExeNumber', resData.data.experience, { path: '/' })
            cookie.save('topicId', resData.data.topic_id, { path: '/' })
            setTimeout(function(){
              value.target.value = ''
              setQuestionValue('')
              fetchData(resData.data.topic_id)
              setSpinStatus(false)
              setInputDisabled(false)
            },100)
          }

        })
      }
    }
  }
  const onChangeInput = (value) => {
    // console.log(value,'value');
    setQuestionValue(value.target.value)
  }

  const returnIndex = () =>{
    cookie.save('topicId', '', { path: '/' })
    history.push({pathname: '/', state: { test: 'noToken' }})
  }

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
  const noFunction = () => {
    message.info('Not yet open, please look forward to...')
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
    message.success('Exit succeeded')
    setTimeout(function(){
      setSpinStatus(false)
    },1000)
  }

  useEffect(()=>{
    if(isPhone){
      setWidthNumber('77%')
    }else{
      setWidthNumber('400px')
    }
    if(isToken){
      // var evtSource = new EventSource(BASE_URL+'/chats/'+isToken);
      // var eventList = document.querySelector('ul');
      // evtSource.onmessage = function(e) {
      //   // var newElement = document.createElement("li");
      //   // newElement.textContent = "message: " + e.data;
      //   // eventList.appendChild(newElement);
      //   console.log(e,'e')
      // }
      const authName = (cookie.load('userName') && cookie.load('userName') != 'null') ? cookie.load('userName') : '访客'
      setUserName(authName)
      getHistory()
    }
    if(cookie.load('topicId')){
      fetchData(cookie.load('topicId'))
    }

  }, [])
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
            <div className="headerRight">
              <img src={require("../../assets/noLoginIcon.png")} alt=""/>
              <div>{ userName }</div>
            </div>
          </div>
          <div className="chatBox">
            {/* question */}
            {/* chatList */}
            {
              chatList.length == 0 ?
              <div>暂无数据</div>
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
                          <div className="answer">{item.answer}</div>
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
                <Input.Group className="tokenInputBox">
                    <Input
                      style={{
                        color: '#000000'
                      }}
                      disabled={inputDisabled}
                      onPressEnter={onSearchFunc}
                      onChange={onChangeInput}
                      value={questionValue}
                      className="tokenInput"
                    />
                    <UpCircleFilled onClick={onSearchFunc} className="tokenIcon" style={{ fontSize: '28px',color: "#E84142" }}/>
                </Input.Group>
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
                  <div><span>免费提问</span>{totalExeNumber ? totalExeNumber : 0}/{experience ? experience : 10}</div>
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
              <div className="headerLeft" onClick={returnIndex}>
                <img src={require("../../assets/close.png")} alt=""/>
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
            <div>
                <div className="chatBox">
                {/* question */}
                {/* chatList */}
                {
                  chatList.length == 0 ?
                  <div>暂无数据</div>
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
                              <div className="answer">{item.answer}</div>
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
                    <Input.Group className="tokenInputBox">
                        <Input
                          style={{
                            color: '#000000'
                          }}
                          disabled={inputDisabled}
                          onPressEnter={onSearchFunc}
                          onChange={onChangeInput}
                          value={questionValue}
                          className="tokenInput"
                        />
                        <UpCircleFilled onClick={onSearchFunc} className="tokenIcon" style={{ fontSize: '28px',color: "#E84142" }}/>
                    </Input.Group>
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
                      <div><span>免费提问</span>{totalExeNumber ? totalExeNumber : 0}/{experience ? experience : 10}</div>
                    </div>
                    {/* <div className="footerTokenContent">服务由 SAMA network 提供</div> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


      }
    </div>
  );
};
export default App;