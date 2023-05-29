import './record.css'
import { useEffect, useState } from 'react';
import cookie from 'react-cookies'
import get_default_language from '../../utils/get_default_language.js'
import RecordMobile from './record_mobile.js'
import Record from './record.js'


function App() {
  let info = navigator.userAgent;

  let isPhone = /mobile/i.test(info);
  console.log('isPhone=', isPhone)
  const [language, setLanguage] = useState(get_default_language());

  // 判断是否为微信浏览器
  function isWeixinBrowser() {
    let ua = navigator.userAgent.toLowerCase();
    console.log('isWeixinBrowser=', /micromessenger/.test(ua) ? true : false)
    return /micromessenger/.test(ua) ? true : false;
  }

  return (
    <div>
        {
            isPhone ? <RecordMobile language={language} setLanguage={setLanguage}></RecordMobile> :
            <Record language={language} setLanguage={setLanguage}></Record>
        }
    </div>
  );
}

export default App;
