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
import copy from 'copy-to-clipboard';
import showdown from 'showdown'


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
  const converter = new showdown.Converter()
  const history = useHistory()

  const fetchData = (topicId,type) => {
      let request = new Request({});
      let _this = this
      setSpinStatus(true)
      request.get('/api/v1/topics/'+topicId+'/records/?page=1&offset=20&order=id').then(function(resData){
        if(resData.code != 0){
          history.push({pathname: '/', state: { test: 'noToken' }})
        }
        for(let i in resData.data){
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
  const getHistory = () => {
    let request = new Request({});
    request.get('/api/v1/topics/?page=1&offset=20&order=-id').then(function(resData){

      // cookie.save('experience', resData.experience, { path: '/' })
      // cookie.save('totalExeNumber', resData.used_experience, { path: '/' })

      let menuSetitemList = [getItem('创建新对话…', '01',<PlusCircleFilled />)]
      for(let i in resData.data){
        if(i < 9){
          let subItem = []
          request.get('/api/v1/topics/'+resData.data[i].id+'/records/?page=1&offset=20&order=id').then(function(resItemData){
            for(let j in resItemData.data){
              subItem.push(getItem("  "+resItemData.data[j].question, resItemData.data[j].add_time))
            }
          })
          menuSetitemList.push(getItem(resData.data[i].title, resData.data[i].id,<MessageOutlined />,subItem))
        }
      }
      setTimeout(function(){
        setItem([getItem('chatGPT', 'sub1', '', menuSetitemList)])
        setSpinStatus(false)
      },700)
      // setItem([getItem('chatGPT', 'sub1', '', menuSetitemList)])
      // console.log(items,'j')
    })
  }
  const onSearchFunc = (value) => {
    if(Number(totalExeNumber) >= Number(experience)){
      message.info('Questioning more than ten times, reaching the upper limit')
    }else{
      // setSpinStatus(true)
      if(!questionValue){
        message.error('The question cannot be empty')
        setSpinStatus(false)
        return
      }else{
        isLoading(true)
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
              evtSource.close();
            }else{
              const newElement = document.createElement("li");
              newElement.innerHTML = converter.makeHtml(JSON.parse(e.data).text)
              eventList.appendChild(newElement);
              if(JSON.parse(e.data).text.indexOf('\n\n') > -1 || JSON.parse(e.data).text.indexOf('\n') > -1){
                const newElementSpan = document.createElement("div");
                newElementSpan.innerHTML ="<br/><br/>"
                // console.log(newElement.innerHTML,'newElement.innerHTML')
                // console.log(JSON.parse(e.data).text,'JSON.parse(e.data).text')
                // console.log(JSON.parse(e.data),'JSON.parse(e.data)')
                eventList.appendChild(newElementSpan);
                // divBox.append(eventList)
              }
              divBox.append(eventList)
            }

            // newElement.textContent = JSON.parse(e.data).text

          })
        },1000)
        setTimeout(function(){
          document.getElementsByClassName('chatBox')[0].scrollTop = document.getElementsByClassName('chatBox')[0].scrollHeight;
        },10)
        cookie.save('topicId', '')
        request.post('/api/v1/chat/question/',obj).then(function(resData){
          if(resData.code == '200100'){
            message.error(resData.msg)
            questionObj.pop()
            setChatList(questionObj)
            setSpinStatus(false)
            // setInputDisabled(false)
            isLoading(false)
            evtSource.close();
          }else{
            // cookie.save('experience', resData.experience, { path: '/' })
            cookie.save('totalExeNumber', resData.data.experience, { path: '/' })

            cookie.save('topicId', resData.data.topic_id)
            if(isFirst){
              getHistory()
              isFirst(false)
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
        })
      }
    }
  }
  const onChangeInput = (value) => {
    // console.log(value,'value');
    setQuestionValue(value.target.value)
  }

  const returnIndex = () =>{
    cookie.save('topicId', '')
    history.push({pathname: '/', state: { test: 'noToken' }})
  }

  const menuClick = (e) => {
    if(e.key == '01' && e.domEvent.target.textContent == '创建新对话…'){
      // console.log(e,'click')
      cookie.save('topicId', '')
      linkSkip()
    }else{
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
    message.success('Exit succeeded')
    setTimeout(function(){
      setSpinStatus(false)
      history.push({pathname: '/'})
    },1000)
  }
  const shareFunction = () => {
    if(isToken){
      if(userName == '访客'){
        message.info('Anonymous users cannot share')
        setTimeout(function(){
          history.push({pathname: '/SignIn'})
        },1000)
        return
      }else{
        let request = new Request({});
        request.get('/api/v1/users/profile/').then(function(resData){
          copy('http://hi.chattop.club/?invite_code='+resData.data.invite_code)
          message.success('Successfully copied, please share with friends')
        })
      }
    }else{
      message.info('Please log in first and proceed with the sharing operation')
      setTimeout(function(){
        history.push({pathname: '/SignIn'})
      },1000)
      return
    }
  }

  useEffect(()=>{
    // const evtSource = new EventSource(BASE_URL+'/chats/'+isToken);
    // const eventList = document.createElement("ul")
    // setTimeout(function(){
    //   const divBox = document.querySelector('.chatBox').lastElementChild.lastElementChild.lastElementChild.firstElementChild
    //   // console.log (divBox,'jk')
    //   evtSource.addEventListener("message", function(e) {
    //     // console.log(JSON.parse(e.data).text,'j')
    //     const newElement = document.createElement("li");
    //     newElement.textContent = JSON.parse(e.data).text
    //     eventList.appendChild(newElement);
    //     divBox.append(eventList)
    //   })
    // },1000)
    setTimeout(function(){
      document.getElementsByClassName('chatBox')[0].scrollTop = document.getElementsByClassName('chatBox')[0].scrollHeight;
    },10)
    if(isPhone){
      setWidthNumber('77%')
    }else{
      setWidthNumber('400px')
    }
    if(isToken){
      const authName = (cookie.load('userName') && cookie.load('userName') != 'null') ? cookie.load('userName') : '访客'
      setUserName(authName)
      getHistory()
      let request = new Request({});
      request.get('/api/v1/users/profile/').then(function(resData){
        cookie.save('totalExeNumber', resData.data.used_experience)
        cookie.save('experience', resData.data.reward_experience+resData.data.experience)
      })
    }
    if(cookie.load('topicId')){
      fetchData(cookie.load('topicId'),2)
      isFirst(false)
    }else{
      isFirst(true)
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
                      maxHeight: '400px',
                      overflow: 'scroll'
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
                        <div style={{width:'90%'}}>
                          <div className='otherMenuRight'>
                            <div className='otherMenuRightDiv'>体验次数<span className='leftNumber'>{totalExeNumber ? totalExeNumber : 0}/{experience ? experience : 10}</span></div>
                            <div className='otherMenuRightItem shareCursor' onClick={shareFunction}>
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
                  // <div className="headerRight">
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
                  // {/* </div> */}
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