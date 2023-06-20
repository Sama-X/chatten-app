import './chatPage.css'
import '../headerBox/header.css'

import PCChatPage from './pc.js'
import PhoneChatPage from './phone.js'


let info = navigator.userAgent;
let isPhone = /mobile/i.test(info);

const App = () => {
  return (
    <div  style={{width:'100%'}}>
      {
        isPhone ? <PhoneChatPage /> : <PCChatPage />
      }
    </div>
  );
};
export default App;