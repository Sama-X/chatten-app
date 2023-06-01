import get_default_language from '../../utils/get_default_language.js'
import ProtocolMobile from './protocol_mobile.js'
import Protocol from './protocol.js'
import { useState } from 'react';


function App() {
  let info = navigator.userAgent;

  let isPhone = /mobile/i.test(info);
  console.log('isPhone=', isPhone)
  const [language, setLanguage] = useState(get_default_language());

  return (
    <div>
        {
            isPhone ? <ProtocolMobile language={language} setLanguage={setLanguage}></ProtocolMobile> :
            <Protocol language={language} setLanguage={setLanguage}></Protocol>
        }
    </div>
  );
}

export default App;
