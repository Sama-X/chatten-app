import './content.css'
import locales from '../../locales/locales.js'


import { useEffect, useState } from 'react';
const App = (data) => {
  const language = data['language']

  const [dataList, setDataList] = useState([]);
  const fetchData = () => {
    const copyList = [
      {
        title:locales(language)['examples'],
        url:require("../../assets/icon1.png"),
        questionList:[
          "“" + locales(language)['case1'] + "” →",
          "“" + locales(language)['case2'] + "”→",
          "“" + locales(language)['case3'] + "？”→"
        ]
      },
      {
        title:locales(language)['dowhat'],
        url:require("../../assets/icon2.png"),
        questionList:[
          locales(language)['case4'],
          locales(language)['case5'],
          locales(language)['case6']
        ]
      }
    ]
    setDataList(copyList)
  }
  const getCategories = async () => {
      fetchData()
  }
  useEffect(()=>{
    getCategories()
  }, [data.language])
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
                        return <div className="contentQuestionBox" key={queIndex}><div className='contentQuestionContent'>{ queItem }</div></div>
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