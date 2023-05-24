import './index.css'
import Header from '../headerBox/header.js'
import Content from '../contentBox/content.js'
import Footer from '../footerBox/footer.js'
import locales from '../../locales/locales.js'
import { useEffect, useState } from 'react';
import cookie from 'react-cookies'
import get_default_language from '../../utils/get_default_language.js'


function App() {
  let info = navigator.userAgent;
  let isPhone = /mobile/i.test(info);
  const [language, setLanguage] = useState(get_default_language());

  return (
    <div className="indexBox">
        {/* header */}
        <Header language={language} setLanguage={setLanguage}></Header>
        {/* content */}
        {
          isPhone ? <Content language={language} setLanguage={setLanguage}></Content> : ''
        }

        {/* chouti */}
        {/* <LeftBox></LeftBox> */}
        {/* footer */}
        {
          isPhone ? <Footer language={language} setLanguage={setLanguage}></Footer> : ''
        }
        {/* <Footer></Footer> */}

    </div>
  );
}

export default App;
