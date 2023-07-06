import './header.css'
import PhoneHeader from './phone-header'
import PCHeader from './pc-header'

const App = (data) => {
  let info = navigator.userAgent;
  let isPhone = /mobile/i.test(info);

  return (
    <div className="header-container">
    {
      isPhone ?
      <PhoneHeader language={data.language} setLanguage={data.setLanguage} />
      : <PCHeader language={data.language} setLanguage={data.setLanguage} />
    }
    </div>
  );
};
export default App;