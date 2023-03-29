import './chatPage.css'
import '../headerBox/header.css'


import { Input, Spin, message } from 'antd';
import { useEffect, useState } from 'react';
import { UpCircleFilled } from '@ant-design/icons';
import { Link, useHistory } from 'react-router-dom'
import cookie from 'react-cookies'
import Request from '../../request.ts';


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
        setTimeout(function(){
          document.getElementsByClassName('chatBox')[0].scrollTop = document.getElementsByClassName('chatBox')[0].scrollHeight;
        },10)
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
  useEffect(()=>{
    if(isToken){
      const authName = (cookie.load('userName') && cookie.load('userName') != 'null') ? cookie.load('userName') : '访客'
      setUserName(authName)
    }
    if(cookie.load('topicId')){

      fetchData(cookie.load('topicId'))
    }

  }, [])
  return (
    <div className="indexBox">
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

            return  <div key={index}>
                <div className='questionBox'>
                  <img src={require("../../assets/noLoginIcon.png")} alt=""/>
                  <div className="question">{item.question}</div>
                </div>
                {
                  item.answer ?
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
                  : ''
                }
              </div>
          })
        }
      </div>
      <div className="footerBox">
        {/* noToken */}
        <div className="footerTokenBox">
          {/* {
            isToken ? */}
            <Input.Group className="tokenInputBox">
                <Input disabled={inputDisabled} onPressEnter={onSearchFunc} onChange={onChangeInput} value={questionValue} className="tokenInput"/>
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
  );
};
export default App;