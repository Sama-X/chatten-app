import './price.css'
import { useEffect, useState } from 'react';
import cookie from 'react-cookies'
import get_default_language from '../../utils/get_default_language.js'
import PriceMobile from './price_mobile.js'
import Price from './price.js'


function App() {
  let info = navigator.userAgent;
  let isPhone = /mobile/i.test(info);
  const [language, setLanguage] = useState(get_default_language());

  

  return (
    <div>
        {
          isPhone ? <PriceMobile language={language} setLanguage={setLanguage}></PriceMobile> : 
          <Price language={language} setLanguage={setLanguage}></Price>
        }
    </div>
  );
}

export default App;
