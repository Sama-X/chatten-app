import './record.css'
import { useEffect, useState } from 'react';
import cookie from 'react-cookies'
import get_default_language from '../../utils/get_default_language.js'
import Request from '../../request.ts';
import { useHistory } from 'react-router-dom';
import {Table} from 'antd'


function App() {
  let info = navigator.userAgent;
  let isPhone = /mobile/i.test(info);
  const [language, setLanguage] = useState(get_default_language())
  const [value, setValue] = useState(10)
  let request = new Request({});
  const navigate = useHistory()
  const [itemList, setItemList] = useState([])
  const [total, setTotal] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)

  const [selected, setSelected] = useState('order')
  const [inviteUser, setInviteUser] = useState({'level1':0, 'level2': 0})

  const clickOrder = (page) => {
    setSelected('order')
    let request = new Request({});
    request.get('/api/v1/order/orders/?status=10&page=' + page + '&offset='+pageSize).then(function(resData){
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

  const clickScore = (page) => {
    setSelected('score')
    let request = new Request({});
    request.get('/api/v1/asset/points-log/?page=' + page + '&offset='+pageSize).then(function(resData){
      var result = []
      for(var i=0; i<resData.data.length; i++){
        resData.data[i]['key'] = resData.data[i]['id']
        result.push(resData.data[i])
      }
      setItemList(result)
      setTotal(resData.count)
    })
  }

  const clickWithdraw = (page) => {
    setSelected('withdraw')
    let request = new Request({});
    request.get('/api/v1/asset/points-withdraw/?page=' + page + '&offset='+pageSize).then(function(resData){
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

  const clickInvite = () => {
    setSelected('invite')
    let request = new Request({});
    request.get('/api/v1/users/invite-logs/?page=' + page + '&offset='+pageSize).then(function(resData){
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
    clickOrder(1)
  }, [])

  useEffect(()=>{
    if(selected === 'order'){
      clickOrder(page)
    }else if(selected === 'score'){
      clickScore(page)
    }else if(selected === 'invite'){
      clickInvite(page)
    }else if(selected === 'withdraw'){
      clickWithdraw(page)
    }
  }, [page])


  const orderColumns = [
    {
      title: '订单号',
      dataIndex: 'out_trade_no',
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

  const scoreColumns = [
    {
      title: '创建时间',
      dataIndex: 'add_time',
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

  const inviteColumns = [
    {
      title: '创建时间',
      dataIndex: 'add_time',
    },
    {
      title: '一级用户',
      dataIndex: 'level1_user_name',
    },
    {
      title: '二级用户',
      dataIndex: 'level2_user_name',
    }
  ]

  const changePage = (page, pageSize) => {
    setPage(page)
  }

  return (
    <div className='record-container'>
      <div className='record-header'><img src={require("../../assets/logo.png")} alt=""/></div>
      <div className='record-frame'>
        <div className='record-menu-list'>
          <div className='record-menu-item' onClick={()=>{clickOrder(1)}}>我的订单</div>
          <div className='record-menu-item' onClick={()=>{clickScore(1)}}>我的积分</div>
          <div className='record-menu-item' onClick={()=>{clickWithdraw(1)}}>我的提现</div>
          <div className='record-menu-item' onClick={()=>{clickInvite(1)}}>我的邀请</div>
        </div>
        <div className='record-item-list'>
          {selected === 'order'? <Table
            columns={orderColumns}
            pagination={{total:total, pageSize:pageSize, onChange:changePage}}
            dataSource={itemList}
          />: ""}
          {selected === 'score'? <Table
            columns={scoreColumns}
            pagination={{total:total, pageSize:pageSize, onChange:changePage}}
            dataSource={itemList}
          />: ""}
          {selected === 'withdraw'? <Table
            columns={withdrawColumns}
            pagination={{total:total, pageSize:pageSize, onChange:changePage}}
            dataSource={itemList}
          />: ""} 
          {selected === 'invite'? <div>
            <div class='inviteCount'><span>直接邀请用户：{inviteUser.level1}</span>间接邀请用户：{inviteUser.level2}</div>
            <Table
            columns={inviteColumns}
            pagination={{total:total, pageSize:pageSize, onChange:changePage}}
            dataSource={itemList}
          /></div>: ""}
        </div>
      </div>
    </div>

  );
}

export default App;
