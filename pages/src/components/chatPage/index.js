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
  const experience = cookie.load('experience')
  const [userName, setUserName] = useState('');
  const [questionValue, setQuestionValue] = useState('');
  const [chatList, setChatList] = useState([]);
  const [spinStatus, setSpinStatus] = useState(false);
  const [totalNumber, setTotalNumber] = useState('');
  const history = useHistory()

  const fetchData = () => {
      let request = new Request({});
      request.get('/api/v1/chat/records/', {
        page: 1,
        offset: 20,
        order:'-id,-msg_type'
      }).then(function(resData){
        // console.log(resData)
        // resData.data.push({
        //     "msg_type": 1, //消息类型
        //     "msg_type_name": "text", //消息类型描述
        //     "question": "写一篇200字的童话故事", //问题内容
        //     "answer": "\n\n从前，在一个大山的深处，有一个小村庄，里面住着一对可爱的姐妹花。姐姐名叫小茉莉，妹妹名叫小玫瑰。\n\n小茉莉和小玫瑰非常喜欢玩耍。每天黄昏，她们都会来到小溪边，听着流水哗哗地流淌，看着鸟儿飞来飞去，许下自己的愿望。\n\n小茉莉想成为一朵美丽的白色茉莉花，小玫瑰则想成为一朵红色的玫瑰花。\n\n一天，她们在小溪边玩耍时，突然出现了一只小仙女。小仙女对着姐妹俩微笑道：“你们有什么愿望，我可以帮你们实现。”\n\n小茉莉和小玫瑰两人高兴地跳了起来，把自己的愿望告诉了小仙女。小仙女听了之后，神奇地摆动了手中的魔杖，让小茉莉变成了美丽的白色茉莉花，小玫瑰也变成了红色的玫瑰花。\n\n从此，小溪边上多了两朵美丽的花，吸引了很多小动物来玩耍。姐妹俩每天都能听到小动物们在那里玩耍的声音。\n\n故事告诉我们通过努力可以实现自己的梦想，也会得到周围人们的认可和喜爱。", //回复内容
        //     "approval": 0, //点赞数
        //     "question_time": "2023-03-02 16:49:46", //提问时间
        //     "response_time": "2023-03-02 16:49:54", //回答时间
        //     "add_time": "2023-03-02 16:49:46" //创建时间
        //     },{
        //       "msg_type": 1, //消息类型
        //       "msg_type_name": "text", //消息类型描述
        //       "question": "写一篇200字的童话故事", //问题内容
        //       "answer": "\n\n从前，在一个大山的深处，有一个小村庄，里面住着一对可爱的姐妹花。姐姐名叫小茉莉，妹妹名叫小玫瑰。\n\n小茉莉和小玫瑰非常喜欢玩耍。每天黄昏，她们都会来到小溪边，听着流水哗哗地流淌，看着鸟儿飞来飞去，许下自己的愿望。\n\n小茉莉想成为一朵美丽的白色茉莉花，小玫瑰则想成为一朵红色的玫瑰花。\n\n一天，她们在小溪边玩耍时，突然出现了一只小仙女。小仙女对着姐妹俩微笑道：“你们有什么愿望，我可以帮你们实现。”\n\n小茉莉和小玫瑰两人高兴地跳了起来，把自己的愿望告诉了小仙女。小仙女听了之后，神奇地摆动了手中的魔杖，让小茉莉变成了美丽的白色茉莉花，小玫瑰也变成了红色的玫瑰花。\n\n从此，小溪边上多了两朵美丽的花，吸引了很多小动物来玩耍。姐妹俩每天都能听到小动物们在那里玩耍的声音。\n\n故事告诉我们通过努力可以实现自己的梦想，也会得到周围人们的认可和喜爱。", //回复内容
        //       "approval": 0, //点赞数
        //       "question_time": "2023-03-02 16:49:46", //提问时间
        //       "response_time": "2023-03-02 16:49:54", //回答时间
        //       "add_time": "2023-03-02 16:49:46" //创建时间
        //       })
        //       console.log(resData)
        if(resData.code != 0){
          history.push({pathname: '/', state: { test: 'noToken' }})
        }
        setTotalNumber(resData.total)
        setChatList(resData.data ? resData.data : [])
      })
      // setTimeout(function(){
      //   document.getElementsByClassName('chatBox')[0].scrollTop = document.getElementsByClassName('chatBox')[0].scrollHeight;
      // },100)

  }
  const onSearchFunc = (value) => {
    // console.log(value,'value');
    if(totalNumber >= experience){
      message.info('Questioning more than ten times, reaching the upper limit')
    }else{
      setSpinStatus(true)
      setQuestionValue(value.target.value)
      let request = new Request({});
      request.post('/api/v1/chat/question/',{question:questionValue}).then(function(resData){
        // console.log(resData,'rrrr')
        setTimeout(function(){
          value.target.value = ''
          setQuestionValue('')
          fetchData()
          setSpinStatus(false)
        },100)
      })
    }
  }
  const onChangeInput = (value) => {
    // console.log(value,'value');
    setQuestionValue(value.target.value)
  }

  useEffect(()=>{
    if(isToken){
      const authName = (cookie.load('userName') && cookie.load('userName') != 'null') ? cookie.load('userName') : '未命名'
      setUserName(authName)
    }
    fetchData()
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
        <div className="headerLeft">
        <Link to='/'><img src={require("../../assets/close.png")} alt=""/></Link>
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
          chatList.length == 0 ? "" : chatList.map((item, index)=>{

            return  <div key={index}>
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
      <div className="footerBox">
        {/* noToken */}
        <div className="footerTokenBox">
          {/* {
            isToken ? */}
            <Input.Group className="tokenInputBox">
                <Input onPressEnter={onSearchFunc} onChange={onChangeInput} value={questionValue} className="tokenInput"/>
                <UpCircleFilled className="tokenIcon" style={{ fontSize: '28px',color: "#E84142" }}/>
            </Input.Group>
            {/* :
            <div className="noTokenBtn">
              <Link to='/Login'>登录</Link>
              <span>/</span>
              <Link to='/SignIn'>注册</Link>
              以开始聊天
            </div>
          } */}
          <div  className="footerTokenContent">服务由 SAMA network 提供</div>
        </div>
      </div>
    </div>
  );
};
export default App;