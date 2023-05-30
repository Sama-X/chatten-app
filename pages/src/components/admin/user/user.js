import './user.css'
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

  const [inviteUser, setInviteUser] = useState({'level1':0, 'level2': 0})

  const clickInvite = () => {
    let request = new Request({});
    request.get('/api/v1/admin/users/?page=' + page + '&offset='+pageSize).then(function(resData){
      console.log(resData.data)
      var result = []
      for(var i=0; i<resData.data.length; i++){
        resData.data[i]['key'] = resData.data[i]['id']
        result.push(resData.data[i])
      }
      setItemList(result)
      setTotal(resData.count)
      setInviteUser({
        level1: resData.direct_invite_count,
        level2: resData.indirect_invite_count
      })
    })
  }

  useEffect(()=>{
    clickInvite(page)
  }, [page])

  const inviteColumns = [
    {
      title: '创建时间',
      dataIndex: 'add_time',
    },
    {
      title: '用户名称',
      dataIndex: 'username',
    },
    {
      title: '积分',
      dataIndex: 'points',
    },
    {
      title: '直接邀请总数',
      dataIndex: 'level1_invite_total',
    },
    {
      title: '间接邀请总数',
      dataIndex: 'level2_invite_total',
    },
    {
      title: '会员可使用次数',
      dataIndex: 'transient_usage_count',
    },
    {
      title: '永久可使用次数',
      dataIndex: 'persistence_usage_count',
    }
  ]

  const changePage = (page, pageSize) => {
    setPage(page)
  }

  return (
    <div className='admin-user-record-container'>
        <Table
        columns={inviteColumns}
        pagination={{total:total, pageSize:pageSize, onChange:changePage}}
        dataSource={itemList}
      />
    </div>
  );
}

export default App;
