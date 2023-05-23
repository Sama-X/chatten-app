import './pay_qrcode.css'

import { Button, Form, message, Popconfirm, Table, Modal, Select,Input } from 'antd';
import React, { useEffect, useState } from 'react';
import Request from '../../request.ts';
import { Link } from 'react-router-dom';


const App = (props) => {
  let request = new Request({});

  const [qrcodeUrl, setQrcodeUrl] = useState("")

  function getBase64(data) {
    return new Promise((resolve, reject) => {
      const blob = new Blob([data], { type: 'image/jpg' }) // 必须指定type类型
      const reader = new FileReader()
      reader.readAsDataURL(blob)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })
  }
  

  const payMoney = (value) => {
    console.log('money=', value)
    request.post('/api/v1/order/orders/', {
      package_id: 1,
      quantity: 1,
      'payment_method': 2
    }).then(function(res){
      console.log(res)
      setQrcodeUrl(res.data.image)
    })
  }

  useEffect(()=>{
    payMoney(1)
  }, [])

  return (
    <div>
      <div className='qrcodePng'>{qrcodeUrl?<img src={qrcodeUrl} /> : ""}</div>
      <div className='wexin-scan'>微信扫一扫</div>
    </div>
  );
};

export default App;