import './price.css'
import { useEffect, useState } from 'react';
import cookie from 'react-cookies'
import get_default_language from '../../utils/get_default_language.js'
import Request from '../../request.ts';
import { useHistory } from 'react-router-dom';


function App() {
  let info = navigator.userAgent;
  let isPhone = /mobile/i.test(info);
  const [language, setLanguage] = useState(get_default_language());
  const [value, setValue] = useState(10)
  let request = new Request({});
  const navigate = useHistory()
  const [packageList, setPackageList] = useState([])

  const changeValue = (e) => {
    let v = e.target.value.replace(/[^\d]/g, "");
    if(v==''){
        v = 0
    }
    setValue(parseInt(v))
  }

  const payMoney = (value, package_id, quantity) => {
    console.log('zzzz=', '/pay/?amount=' + value + '&package_id=' + package_id + '&quantity=' + quantity)
    navigate.push('/pay/?amount=' + value + '&package_id=' + package_id + '&quantity=' + quantity)
  }

  useEffect(()=>{
    let request = new Request({});
    request.get('/api/v1/order/order-packages/').then(function(resData){
      console.log(resData.data)
      setPackageList(resData.data)
    })
  }, [])

  return (
    <div className='price-container'>
      <div className='price-header'><img src={require("../../assets/logo.png")} alt=""/></div>
      <div className='price-frame'>
        <div className='price-title'>价格33</div>
        <div className='price-slogan'>选择适合你的最佳方案</div>
        <div className='price-list'>
            {
              packageList.map((item)=>{
                  {
                    return (item.category === 0 ?
                    <div className='price-item' key={item.id}>
                      <div className='price-item-name'>{item.name}</div>
                      <div className='price-item-content'><span className='price-item-limit'>{item.usage_count}</span>次提问</div>
                      <div className='price-item-btn' onClick={()=>{payMoney(item.price, item.id, 1)}}>充值{item.price}元 👉 </div>
                    </div>:
                    <div className='price-item' key={item.id}>
                      <div className='price-item-name'>按次购买</div>
                      <div className='price-item-content'><span className='price-item-limit'><input onChange={changeValue} value={value?value:''}/></span>次提问</div>
                      <div className='price-item-btn' onClick={()=>{payMoney(value*item.price, item.id, value)}}>充值{value*item.price}元 👉 </div>
                    </div>
                    )
                  }
              })
            }
        </div>
      </div>
    </div>

  );
}

export default App;
