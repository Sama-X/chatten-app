import './price_mobile.css'
import { useEffect, useState } from 'react';
import { message, Button } from 'antd';
import cookie from 'react-cookies'
import get_default_language from '../../utils/get_default_language.js'
import Request from '../../request.ts';
import { useHistory } from 'react-router-dom';


function App() {
  let info = navigator.userAgent;
  const [language, setLanguage] = useState(get_default_language());
  const [value, setValue] = useState(10)
  const [packageId, setPackageId] = useState('')
  const [amount, setAmount] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [orderId, setOrderId] = useState("")
  const [openid, setOpenid] = useState("")
  let request = new Request({});
  const navigate = useHistory()
  const [packageList, setPackageList] = useState([])

  const [appid, setAppid] = useState('wx638bec1594b09d2f')
  const [timeStamp, setTimeStamp] = useState('')
  const [nonceStr, setNonceStr] = useState('')
  const [packagex, setPackage] = useState('')
  const [paySign, setPaySign] = useState('')
  const [color, setColor] = useState('#05c160')
  const history = useHistory()


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

  function onBridgeReady(timeStamp, nonceStr, packagex, paySign) {
    window.WeixinJSBridge.invoke('getBrandWCPayRequest', {
        "appId": appid,     //公众号ID，由商户传入     
        "timeStamp": timeStamp,     //时间戳，自1970年以来的秒数     
        "nonceStr": nonceStr,      //随机串     
        "package": packagex,
        "signType": "RSA",     //微信签名方式：     
        "paySign": paySign //微信签名 
    },
    function(res) {
        if (res.err_msg == "get_brand_wcpay_request:ok") {
            // 使用以上方式判断前端返回,微信团队郑重提示：
            //res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠。
        }
    });
  }

  function getData() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(['foo', 'bar'])
      }, 1000)
    })
  }

  const payMoney = () => {
    setColor('#fff')
    request.post('/api/v1/order/orders/', {
      package_id: parseInt(packageId),
      quantity: parseInt(quantity),
      payment_method: 2,
      client: 'jsapi',
      openid: openid
    }).then(function(res){
      console.log(res)
      setTimeout(() => {
        setOrderId(res.data.order_id)
        setTimeStamp(res.data.data['timeStamp'])
        setNonceStr(res.data.data['nonceStr'])
        setPackage(res.data.data['package'])
        setPaySign(res.data.data['paySign'])
      }, 0)

    if (typeof window.WeixinJSBridge == "undefined") {
        if (document.addEventListener) {
            document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
        } else if (document.attachEvent) {
            document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
            document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
        }
    } else {
        onBridgeReady(res.data.data['timeStamp'], res.data.data['nonceStr'], res.data.data['package'], res.data.data['paySign']);
    }
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

  const goToHome = () => {
    navigate.push('/')
  }

  useEffect(()=>{

    let code = ''
    if(history.location.search.indexOf('code=') != -1){
      code = history.location.search.split('&')[0].split('=')[1]
    }

    let request = new Request({});
    request.get('/api/v1/order/order-packages/').then(function(resData){
      console.log(resData.data)
      setPackageList(resData.data)
      if(!packageId){
        setPackageId(resData.data[0].id)
        setAmount(resData.data[0].price)
      }
      if(code == ''){
        let redirect_uri = encodeURIComponent('https://pay.citypro-tech.com/price/')
        window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appid + '&redirect_uri=' + redirect_uri + '&response_type=code&scope=snsapi_base&state=123#wechat_redirect'
      }else{
        request.post('/api/v1/users/wechat/', {code:code}).then(function(data){
          setOpenid(data.data['openid'])
        })
      }
    })
  }, [])

  return (
    <div className='price-mobile-container'>
      <div className='price-mobile-header' onClick={goToHome}><img src={require("../../assets/logo.png")} alt=""/></div>
      <div className='price-mobile-frame'>
        <div className='price-mobile-title'>价格</div>
        <div className='price-mobile-slogan'>选择适合你的最佳方案</div>
        <div className='price-mobile-list'>
            {
              packageList.map((item)=>{
                  {
                    return (item.category === 0 ?
                    <div className={item.id == packageId ? 'price-mobile-item price-mobile-item-selected':'price-mobile-item'} key={item.id} onClick={()=>{choosePackage(item.price, item.id, 1)}}>
                      <div className='price-mobile-item-name'>{item.name}</div>
                      <div className='price-mobile-item-price'>¥{item.price}</div>
                      <div className='price-mobile-item-content'><span className='price-mobile-item-limit'>{item.usage_count}</span>次</div>
                    </div>:
                    <div className={item.id == packageId ? 'price-mobile-item price-mobile-item-selected':'price-mobile-item'}  key={item.id} onClick={()=>{choosePackage(item.price, item.id, value)}}>
                      <div className='price-mobile-item-name'>按次购买</div>
                      <div className='price-mobile-item-price'>¥{parseFloat(item.price * value).toFixed(2)}</div>
                      <div className='price-mobile-item-content'><span className='price-mobile-item-limit'><input onChange={changeValue} value={value?value:''}/></span>次</div>
                    </div>
                    )
                  }
              })
            }
        </div>
        <Button style={{'border': color, 'color': '#fff'}} className='price-mobile-pay' onClick={payMoney}>微信支付¥{parseFloat(amount * quantity).toFixed(2)}</Button>
      </div>
    </div>
  );
}

export default App;
