import './price_mobile.css'
import { useEffect, useState } from 'react';
import cookie from 'react-cookies'
import get_default_language from '../../utils/get_default_language.js'


function App() {
  const [language, setLanguage] = useState(get_default_language());

  return (
    <div className="indexBox">
    </div>
  );
}

export default App;
