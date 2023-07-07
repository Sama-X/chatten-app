import get_default_language from '../../utils/get_default_language.js'
import ProfileMobile from './profile_mobile.js'
import Profile from './profile.js'
import { useState } from 'react';


function App() {
  let info = navigator.userAgent;

  let isPhone = /mobile/i.test(info);
  const [language, setLanguage] = useState(get_default_language());

  return (
    <div>
        {
            isPhone ? <ProfileMobile language={language} setLanguage={setLanguage}></ProfileMobile> :
            <Profile language={language} setLanguage={setLanguage}></Profile>
        }
    </div>
  );
}

export default App;
