import './price.css'
import { useEffect, useState } from 'react';
import cookie from 'react-cookies'
import get_default_language from '../../utils/get_default_language.js'
import PriceMobile from './price_mobile.js'
import PriceWeixin from './price_weixin.js'
import Price from './price.js'


function App() {
  let info = navigator.userAgent;
  let isPhone = /mobile/i.test(info);
  const [language, setLanguage] = useState(get_default_language());

  // 判断是否为微信浏览器
  function isWeixinBrowser() {
    let ua = navigator.userAgent.toLowerCase();
    return /micromessenger/.test(ua) ? true : false;
  }

  return (
    <div>
        {
          isPhone ? <PriceMobile language={language} setLanguage={setLanguage}></PriceMobile> : 
            isWeixinBrowser ? <PriceWeixin language={language} setLanguage={setLanguage}></PriceWeixin>:
            <Price language={language} setLanguage={setLanguage}></Price>
        }
    </div>
  );
}

export default App;
