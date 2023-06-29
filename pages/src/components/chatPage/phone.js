
import { Input, Spin, message, Popconfirm, Modal, Button, Drawer } from 'antd';
import { useEffect, useState } from 'react';
import { UpCircleFilled } from '@ant-design/icons';
import { useHistory } from 'react-router-dom'
import cookie from 'react-cookies'
import Request from '../../request.ts';
import {BASE_URL} from '../../utils/axios.js'
import showdown from 'showdown'
import locales from '../../locales/locales.js'
import get_default_language from '../../utils/get_default_language.js'
import copy from 'copy-to-clipboard';
import QRCode from "qrcode.react";

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
  const [newData, setNewData] = useState({})

  const [experienceModal, setExperienceModal] = useState(false)
  const [shareDrawer, setShareDrawer] = useState(false)
  const [inviteCode, setInviteCode] = useState('');

  const converter = new showdown.Converter()
  const history = useHistory()
  const fetchData = (topicId,type) => {
      let request = new Request({});
      setSpinStatus(true)
      request.get('/api/v1/topics/'+topicId+'/records/?page=1&offset=20&order=id').then(function(resData){
        if(resData.code != 0){
          history.push({pathname: '/', state: { test: 'noToken' }})
        }
        setChatList(resData.data ? resData.data : [])
        setSpinStatus(false)
        if(resData.code == 0){
          setTimeout(function(){
            document.getElementsByClassName('chatBox')[0].scrollTop = document.getElementsByClassName('chatBox')[0].scrollHeight;
          }, 500)
        }
      })
  }

  const goToPrice = () =>{
    if(isToken){
      history.push({pathname: '/price/'})
    }else{
      history.push({pathname: '/SignIn/'})
    }
  }

  const onSearchFunc = (value) => {
    if(isInputEnterStatus){
      // if(Number(totalExeNumber) >= Number(experience)){
      if(Number(experience) === 0){
        setQuestionValue('')
        value.target.value = ''
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
              message.error(resData.msg)
            }else if(resData.code == '200102'){
              setIsModalOpen(true)
            }else{
              cookie.save('totalExeNumber', resData.data.experience, { path: '/' })
              cookie.save('experience', resData.data.experience, { path: '/' })
            cookie.save('topicId', resData.data.topic_id)

              if(isFirstStatus){
                isFirst(false)
              }
            }
          }).catch(function(err) {
              if(cookie.load('topicId')){
                fetchData(cookie.load('topicId'),2)
                isFirst(false)
              }else{
                isFirst(true)
              }
            }).finally(_ => {
              setSpinStatus(false)
              isLoading(false)
              value.target.value = ''
              setQuestionValue('')
              evtSource.close();
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
    }, 10)
  }

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

  const copyContent = (value) => {
    copy(value)
    message.success(locales(language)['copy_success'])
  }

  useEffect(()=>{
    setWidthNumber('77%')
    if(isToken){
      const authName = (cookie.load('userName') && cookie.load('userName') != 'null') ? cookie.load('userName') : locales(language)['anonymous']
      setUserName(authName)
      let request = new Request({});
      request.get('/api/v1/users/profile/').then(function(resData){
        setInviteCode(resData.data.invite_code)
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
      setSpinStatus(false)
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
                    onPressEnter={onSearchFunc}
                    onChange={onChangeInput}
                    value={questionValue}
                    className="tokenInput"
                    placeholder={locales(language)['please_input']}
                    />
                {/* </div> */}
                <UpCircleFilled onClick={onSearchFunc} className="tokenIcon" style={{ fontSize: '28px',color: "#E84142" }}/>
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

    <Modal
      title={locales(language)['whether_create_new_topic_title']}
      open={isModalOpen}
      footer={null}
      style={{
        top: "30%"
      }}
      width={"95%"}
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
          <Button type="primary" onClick={() => setShareDrawer(true)}>{locales(language)['invite']}</Button>
          <Button type="default" onClick={() => setExperienceModal(false)}>{locales(language)['cancel']}</Button>
        </div>
      </Modal>

      <Drawer className='shareDrawer1'
        title="分享"
        placement={'bottom'}
        closable={false}
        onClose={() => {setShareDrawer(false)}}
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
  );
};
export default App;