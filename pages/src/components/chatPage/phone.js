
import { Input, Spin, message, Popconfirm, Modal, Button, Alert } from 'antd';
import { useEffect, useState } from 'react';
import { UpCircleFilled } from '@ant-design/icons';
import { useHistory } from 'react-router-dom'
import cookie from 'react-cookies'
import Request from '../../request.ts';
import {BASE_URL} from '../../utils/axios.js'
import { PlusCircleFilled, MessageOutlined } from '@ant-design/icons';
import showdown from 'showdown'
import locales from '../../locales/locales.js'
import get_default_language from '../../utils/get_default_language.js'

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
  const [userName, setUserName] = useState('');
  const [questionValue, setQuestionValue] = useState('');
  const [chatList, setChatList] = useState([]);
  const [spinStatus, setSpinStatus] = useState(true);
  // const [spinStatus, setSpinStatus] = useState(true);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [items, setItem] = useState([]);
  const [isFirstStatus, isFirst] = useState(false);
  const [isLoadingStatus, isLoading] = useState(false);
  const [widthNumber, setWidthNumber] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInputEnterStatus, setIsInputEnterStatus] = useState(true);
  const [language, setLanguage] = useState(get_default_language());

  const converter = new showdown.Converter()
  const history = useHistory()
  const fetchData = (topicId,type) => {
      let request = new Request({});
      setSpinStatus(true)
      request.get('/api/v1/topics/'+topicId+'/records/?page=1&offset=20&order=id').then(function(resData){
        if(resData.code != 0){
          history.push({pathname: '/', state: { test: 'noToken' }})
        }
        for(let i in resData.data){
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
          }, 100)

        }
      })
  }
  const maxNumber = 100000000
  const minNumber = 0
  const getHistory = () => {
    let request = new Request({});
    setSpinStatus(true)

    request.get('/api/v1/topics/?page=1&offset=20&order=-id').then(function(resData){
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

  useEffect(()=>{
    setTimeout(function(){
      document.getElementsByClassName('chatBox')[0].scrollTop = document.getElementsByClassName('chatBox')[0].scrollHeight;
    }, 10)
    setWidthNumber('77%')
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

  return (
    <div  style={{width:'100%'}}>
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