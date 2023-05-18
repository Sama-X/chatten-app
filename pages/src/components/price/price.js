import './price.css'
import { useEffect, useState } from 'react';
import cookie from 'react-cookies'
import get_default_language from '../../utils/get_default_language.js'


function App() {
  let info = navigator.userAgent;
  let isPhone = /mobile/i.test(info);
  const [language, setLanguage] = useState(get_default_language());
  const [value, setValue] = useState(10)


  const changeValue = (e) => {
    console.log(parseInt(e.target.value))
    let v = e.target.value.replace(/[^\d]/g, "");
    if(v==''){
        v = 0
    }
    setValue(parseInt(v))
  }


  return (
    <div className='price-container'>
      <div className='price-header'><img src={require("../../assets/logo.png")} alt=""/></div>
      <div className='price-frame'>
        <div className='price-title'>价格</div>
        <div className='price-slogan'>选择适合你的最佳方案</div>
        <div className='price-list'>
            <div className='price-item'>
                <div className='price-item-name'>季卡</div>
                <div className='price-item-content'><span className='price-item-limit'>2000</span>次提问</div>
                <div className='price-item-btn'>充值100元 👉 </div>
            </div>
            <div className='price-item'>
                <div className='price-item-name'>半年</div>
                <div className='price-item-content'><span className='price-item-limit'>4500</span>次提问</div>
                <div className='price-item-btn'>充值200元 👉 </div>
            </div>
            <div className='price-item'>
                <div className='price-item-name'>年卡</div>
                <div className='price-item-content'><span className='price-item-limit'>10000</span>次提问</div>
                <div className='price-item-btn'>充值400元 👉 </div>
            </div>
            <div className='price-item'>
                <div className='price-item-name'>按次购买</div>
                <div className='price-item-content'><span className='price-item-limit'><input onChange={changeValue} value={value?value:''}/></span>次提问</div>
                <div className='price-item-btn'>充值{value/10}元 👉 </div>
            </div>
        </div>
      </div>
    </div>

  );
}

export default App;
