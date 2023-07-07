import './profile.css'
import { useEffect, useState } from 'react';
import cookie from 'react-cookies'
import get_default_language from '../../utils/get_default_language.js'
import { useHistory } from 'react-router-dom';


function App() {
  const [language, setLanguage] = useState(get_default_language());
  const navigate = useHistory()

  const goToHome = () => {
    navigate.push('/')
  }

  return (
    <div className='profile-container'>
      <div className='profile-header' onClick={goToHome}><img src={require("../../assets/logo.png")} alt=""/></div>
    </div>
  );
}

export default App;
