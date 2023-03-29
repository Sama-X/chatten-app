import './content.css'
import { getCategoriesAsync } from '../../api/index.js';

import { useEffect, useState } from 'react';
const App = () => {
  const [dataList, setDataList] = useState([]);
  const fetchData = () => {
    const copyList = [
      {
        title:'问题示例',
        url:require("../../assets/icon1.png"),
        questionList:[
          "“用简单的属于解释量子力学” →",
          "“给孩子过10岁生日的好创意”→",
          "“如何在JavaScript中创建一个HTTP请求？”→"
        ]
      },
      {
        title:'能做什么？',
        url:require("../../assets/icon2.png"),
        questionList:[
          "记住用户在先前对话中说过的内容",
          "允许用户修正对话内容",
          "chatGPT会拒绝不合理的请求"
        ]
      }
    ]
    setDataList(copyList)
  }
  const getCategories = async () => {
  //   const res = await ceshi({
  //     "jsonrpc": "2.0",
  //     "method": "platform.getHeight",
  //     "params": {},
  //     "id": 1,
  // });
  // console.log(res,'hjk111')
    // const res = await getCategoriesAsync({ parentId: 0 });

    // if(res.code === 0){
      fetchData()
    //   console.log(res,'hjk')
    // }else{
    //   console.log(res,'hjk')
    // }
  }
  useEffect(()=>{
    // fetchData()
    getCategories()
  }, [])
  return (
    <div>
      <div className="contentBox">
        <img src={require("../../assets/logo.png")} className="contentLogo" alt=''/>
          <div className="contentItemBox">
            {
                dataList.map((item, index) =>{
                  return <div key={index} className="contentTitleItem">
                    <div className="contentTitleBox">
                      <img src={ item.url } alt=''/>
                      <div>{ item.title }</div>
                    </div>
                    {
                      item.questionList.map((queItem,queIndex) => {
                        return <div className="contentQuestionBox" key={queIndex}>{ queItem }</div>
                      })
                    }
                  </div>
                })
            }
          </div>
        </div>
    </div>
  );
};
export default App;