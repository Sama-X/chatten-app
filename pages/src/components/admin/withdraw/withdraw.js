import './withdraw.css'
import { useEffect, useState } from 'react';
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

  const clickWithdraw = (page) => {
    setSelected('withdraw')
    let request = new Request({});
    request.get('/api/v1/admin/asset/points-withdraw/?page=' + page + '&offset='+pageSize).then(function(resData){
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
    clickWithdraw(page)
  }, [page])

  const withdrawColumns = [
    {
      title: '创建时间',
      dataIndex: 'add_time',
    },
    {
      title: '申请积分',
      dataIndex: 'point',
    },
    {
      title: '微信昵称',
      dataIndex: 'realname',
    },
    {
      title: '状态',
      dataIndex: 'status_name',
    },
    {
      title: '审核时间',
      dataIndex: 'audit_time',
    },
  ]

  const changePage = (page, pageSize) => {
    setPage(page)
  }

  return (
    <div className='admin-withdraw-record-container'>
        <Table
          columns={withdrawColumns}
          pagination={{total:total, pageSize:pageSize, onChange:changePage}}
          dataSource={itemList}
        />
    </div>
  );
}

export default App;
