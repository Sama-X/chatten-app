import './pay_qrcode.css'

import { Button, Form, message, Popconfirm, Table, Modal, Select,Input } from 'antd';
import React, { useEffect, useState } from 'react';
import Request from '../../request.ts';
import { Link } from 'react-router-dom';
import { useHistory } from 'react-router-dom';


const App = (props) => {
  let request = new Request({});
  const navigate = useHistory()


  const [qrcodeUrl, setQrcodeUrl] = useState("")
  const [orderId, setOrderId] = useState("")

  const payMoney = (package_id, quantity) => {
    request.post('/api/v1/order/orders/', {
      package_id: parseInt(package_id),
      quantity: parseInt(quantity),
      'payment_method': 2
    }).then(function(res){
      console.log(res)
      setQrcodeUrl(res.data.image)
      setOrderId(res.data.order_id)
      console.log("orderId=", orderId)
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
    let params = props.location.search
    let amount = params.split('&')[0].split('=')[1]
    let package_id = params.split('&')[1].split('=')[1]
    let quantity = params.split('&')[2].split('=')[1]
    payMoney(package_id, quantity)
  }, [])

  return (
    <div>
      <div className='qrcodePng'>{qrcodeUrl?<img src={qrcodeUrl} /> : ""}</div>
      <div className='wexin-scan'>微信扫一扫</div>
    </div>
  );
};

export default App;