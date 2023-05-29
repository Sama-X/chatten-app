import './record_mobile.css'
import { useEffect, useState } from 'react';
import { message } from 'antd';
import cookie from 'react-cookies'
import get_default_language from '../../utils/get_default_language.js'
import Request from '../../request.ts';
import { useHistory } from 'react-router-dom';


function App() {
  let info = navigator.userAgent;
  let isPhone = /mobile/i.test(info);
  const [language, setLanguage] = useState(get_default_language());
  const [value, setValue] = useState(10)
  const [packageId, setPackageId] = useState('')
  const [amount, setAmount] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [orderId, setOrderId] = useState("")
  let request = new Request({});
  const navigate = useHistory()
  const [packageList, setPackageList] = useState([])

  const changeValue = (e) => {
    let v = e.target.value.replace(/[^\d]/g, "");
    if(v==''){
        v = 0
    }
    setValue(parseInt(v))
    setQuantity(parseInt(v))
  }

  const choosePackage = (amount, package_id, quantity) =>{
    setAmount(amount)
    setPackageId(package_id)
    console.log('packageId=', packageId)
    setQuantity(quantity)
  }

  const payMoney = () => {
    request.post('/api/v1/order/orders/', {
      package_id: parseInt(packageId),
      quantity: parseInt(quantity),
      payment_method: 2,
      client: 'h5'
    }).then(function(res){
      console.log(res)
      setOrderId(res.data.order_id)
      window.location.href = res.data.h5_url
      // setQrcodeUrl(res.data.image)
      // console.log("orderId=", orderId)
    })
  }

  useEffect(()=>{
    let interval = setInterval(function(){
      if(!orderId){
        return
      }
      request.get('/api/v1/order/orders/'+ orderId + '/', {
      }).then(function(res){
        console.log(res)
        if(res.data.status != 0){
          if(res.data.status == 10){
            message.info('支付成功')
            navigate.push('')
          }
          if(res.data.status == 100){
            message.info('支付失败')
          }
          clearInterval(interval);
        }
      })
      }, 5000);
    },
  [orderId])

  useEffect(()=>{
    let request = new Request({});
    request.get('/api/v1/order/order-packages/').then(function(resData){
      console.log(resData.data)
      setPackageList(resData.data)
      if(!packageId){
        console.log('88888')
        setPackageId(resData.data[0].id)
        setAmount(resData.data[0].record)
      }
    })
  }, [])

  return (
    <div className='record-mobile-container'>
      <div className='record-mobile-header'><img src={require("../../assets/logo.png")} alt=""/></div>
      <div className='record-mobile-frame'>
        <div className='record-mobile-title'>价格</div>
        <div className='record-mobile-slogan'>选择适合你的最佳方案</div>
        <div className='record-mobile-list'>
            {
              packageList.map((item)=>{
                  {
                    return (item.category === 0 ?
                    <div className={item.id == packageId ? 'record-mobile-item record-mobile-item-selected':'record-mobile-item'} key={item.id} onClick={()=>{choosePackage(item.record, item.id, 1)}}>
                      <div className='record-mobile-item-name'>{item.name}</div>
                      <div className='record-mobile-item-record'>¥{item.record}</div>
                      <div className='record-mobile-item-content'><span className='record-mobile-item-limit'>{item.usage_count}</span>次</div>
                    </div>:
                    <div className={item.id == packageId ? 'record-mobile-item record-mobile-item-selected':'record-mobile-item'}  key={item.id} onClick={()=>{choosePackage(item.record, item.id, value)}}>
                      <div className='record-mobile-item-name'>按次购买</div>
                      <div className='record-mobile-item-record'>¥{parseFloat(item.record * value).toFixed(2)}</div>
                      <div className='record-mobile-item-content'><span className='record-mobile-item-limit'><input onChange={changeValue} value={value?value:''}/></span>次</div>
                    </div>
                    )
                  }
              })
            }
        </div>
        <div className='record-mobile-pay' onClick={payMoney}>微信支付¥{parseFloat(amount * quantity).toFixed(2)}</div>
      </div>
    </div>
  );
}

export default App;
