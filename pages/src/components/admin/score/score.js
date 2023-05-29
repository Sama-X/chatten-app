import './score.css'
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

  const [selected, setSelected] = useState('score')

  const clickScore = (page) => {
    setSelected('score')
    let request = new Request({});
    request.get('/api/v1/admin/asset/points-log/?page=' + page + '&offset='+pageSize).then(function(resData){
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
    clickScore(page)
  }, [page])

  const scoreColumns = [
    {
      title: '创建时间',
      dataIndex: 'add_time',
    },
    {
        title: '用户昵称',
        dataIndex: 'user_name',
      },
    {
      title: '变化',
      dataIndex: 'category_name',
    },
    {
      title: '变化数量',
      dataIndex: 'amount',
    },
    {
      title: '备注',
      dataIndex: 'note',
    },
  ]

  const changePage = (page, pageSize) => {
    setPage(page)
  }

  return (
    <div className='admin-score-record-container'>
        <Table
            columns={scoreColumns}
            pagination={{total:total, pageSize:pageSize, onChange:changePage}}
            dataSource={itemList}
          />
    </div>

  );
}

export default App;
