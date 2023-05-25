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
            isWeixinBrowser() ? <PriceWeixin language={language} setLanguage={setLanguage}></PriceWeixin>:
            isPhone ? <PriceMobile language={language} setLanguage={setLanguage}></PriceMobile> :
            <Price language={language} setLanguage={setLanguage}></Price>
        }
    </div>
  );
}

export default App;
