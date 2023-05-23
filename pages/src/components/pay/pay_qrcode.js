import './package.css'

import { Button, Form, message, Popconfirm, Table, Modal, Select,Input } from 'antd';
import React, { useEffect, useState } from 'react';
import Request from '../../request.ts';
import { Link } from 'react-router-dom';




const App = () => {

  const [key, setKey] = useState("")
  let request = new Request({});
  const fetchData = (page) => {
    request.get('/api/v1/admin/order/order-packages/?offset=' + pageSize + '&page=' + page).then((res)=>{
      console.log("res===", res)

      if(res.code === 0){
        setTotal(res.count)
        var originData = []
        for(var i=0; i<res.data.length; i++){
           var tmp = res.data[i]
           tmp["key"] = res.data[i].id
           tmp["name"] = res.data[i].name
           tmp["category"] = res.data[i].category + ''
           tmp["category_name"] = res.data[i].category == 1? '永久期限': '固定期限'
           tmp["usage_count"] = res.data[i].usage_count
           tmp["price"] = res.data[i].price
           tmp["priority"] = res.data[i].priority
           originData.push(tmp)
        }
        setData(originData)
      }
    })
  }

  useEffect(()=>{
    fetchData(1)
  }, [])




  return (
    <div>
    </div>
  );
};

export default App;