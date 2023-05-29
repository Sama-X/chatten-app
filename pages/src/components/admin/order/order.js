import './order.css'
import { useEffect, useState } from 'react';
import cookie from 'react-cookies'
import { useHistory } from 'react-router-dom';
import {Table} from 'antd'
import Request from '../../../requestAdmin.ts';



function App() {
  let info = navigator.userAgent;
  const [itemList, setItemList] = useState([])
  const [total, setTotal] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)

  const [selected, setSelected] = useState('order')
  const [inviteUser, setInviteUser] = useState({'level1':0, 'level2': 0})

  const clickOrder = (page) => {
    setSelected('order')
    let request = new Request({});
    request.get('/api/v1/admin/order/orders/?status=10&page=' + page + '&offset='+pageSize).then(function(resData){
      console.log(resData.data)
      var result = []
      for(var i=0; i<resData.data.length; i++){
        resData.data[i]['key'] = resData.data[i]['id']
        result.push(resData.data[i])
      }
      setItemList(result)
      setTotal(resData.count)
    })
  }


  useEffect(()=>{
    clickOrder(page)
  }, [page])


  const orderColumns = [
    {
      title: '订单号',
      dataIndex: 'out_trade_no',
    },
    {
        title: '用户昵称',
        dataIndex: 'user_name',
      },
    {
      title: '套餐名称',
      dataIndex: 'package_name',
    },
    {
      title: '支付金额',
      dataIndex: 'actual_price',
    },
    {
      title: '创建时间',
      dataIndex: 'add_time',
    }
  ]

  const changePage = (page, pageSize) => {
    setPage(page)
  }

  return (
    <div className='admin-order-record-container'>
        <Table
            columns={orderColumns}
            pagination={{total:total, pageSize:pageSize, onChange:changePage}}
            dataSource={itemList}
        />
    </div>

  );
}

export default App;
