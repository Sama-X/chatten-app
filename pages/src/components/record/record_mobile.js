import './record_mobile.css'
import { useEffect, useState } from 'react';
import cookie from 'react-cookies'
import get_default_language from '../../utils/get_default_language.js'
import Request from '../../request.ts';
import {Table} from 'antd'
import { useHistory } from 'react-router-dom';


function App() {
  let info = navigator.userAgent;
  const [language, setLanguage] = useState(get_default_language())
  const [itemList, setItemList] = useState([])
  const [total, setTotal] = useState(0)
  const [pageSize, setPageSize] = useState(50)
  const [page, setPage] = useState(1)
  const navigate = useHistory()

  const [selected, setSelected] = useState('order')
  const [inviteUser, setInviteUser] = useState({'level1':0, 'level2': 0})

  const clickOrder = (page) => {
    setSelected('order')
    setItemList([])
    let request = new Request({});
    request.get('/api/v1/order/orders/?status=10&page=' + page + '&offset='+pageSize).then(function(resData){
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
    setItemList([])
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
    setItemList([])
    let request = new Request({});
    request.get('/api/v1/asset/points-withdraw/?page=' + page + '&offset='+pageSize).then(function(resData){
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
    setItemList([])
    let request = new Request({});
    request.get('/api/v1/users/invite-logs/?page=' + page + '&offset='+pageSize).then(function(resData){
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


  const changePage = (page, pageSize) => {
    setPage(page)
  }

  const goToHome = () => {
    navigate.push('/')
  }

  return (
    <div className='mobile-record-container'>
      <div className='mobile-record-header' onClick={goToHome}><img src={require("../../assets/logo.png")} alt=""/></div>
      <div className='mobile-record-frame'>
        <div className='mobile-record-menu-list'>
          <div className={selected === 'order' ? 'mobile-record-menu-item mobile-record-menu-item-selected': 'mobile-record-menu-item'} onClick={()=>{clickOrder(1)}}>我的订单</div>
          <div className={selected === 'score' ? 'mobile-record-menu-item mobile-record-menu-item-selected': 'mobile-record-menu-item'} onClick={()=>{clickScore(1)}}>我的积分</div>
          <div className={selected === 'withdraw' ? 'mobile-record-menu-item mobile-record-menu-item-selected': 'mobile-record-menu-item'} onClick={()=>{clickWithdraw(1)}}>我的提现</div>
          <div className={selected === 'invite' ? 'mobile-record-menu-item mobile-record-menu-item-selected': 'mobile-record-menu-item'} onClick={()=>{clickInvite(1)}}>我的邀请</div>
        </div>
        <div className='mobile-record-item-list'>
          {selected === 'order'? <div>
            {
              itemList.length > 0 ? itemList.map((item)=>{
                return <div className='mobile-record-item' key={item.id}>
                  <div>订单号：{item.out_trade_no}</div>
                  <div>套餐名称：{item.package_name}</div>
                  <div>支付金额：{item.actual_price}</div>
                  <div>创建时间：{item.add_time}</div>
                </div>
              }) : <div className='mobile-record-item text-center'>暂无记录</div>
            }
          </div>: ""}
          {selected === 'score'? <div>
            {
              itemList.length > 0 ? itemList.map((item)=>{
                return <div className='mobile-record-item' key={item.id}>
                  <div>创建时间：{item.add_time}</div>
                  <div>变化：{item.category_name}</div>
                  <div>变化数量：{item.amount}</div>
                  <div>备注：{item.note}</div>
                </div>
              }) : <div className='mobile-record-item text-center'>暂无记录</div>
            }
          </div>: ""}
          {selected === 'withdraw'? <div>
          {
              itemList.length > 0 ? itemList.map((item)=>{
                return <div className='mobile-record-item' key={item.id}>
                  <div>创建时间：{item.add_time}</div>
                  <div>申请积分：{item.point}</div>
                  <div>微信昵称：{item.realname}</div>
                  <div>状态：{item.status_name}</div>
                  <div>审核时间：{item.audit_time}</div>
                </div>
              }) : <div className='mobile-record-item text-center'>暂无记录</div>
            }
          </div>: ""} 
          {selected === 'invite'? <div>
            <div className='mobile-inviteCount'><span>直接邀请用户：{inviteUser.level1}</span>间接邀请用户：{inviteUser.level2}</div>
            <div>
            {
              itemList.length > 0 ? itemList.map((item)=>{
                return <div className='mobile-record-item' key={item.id}>
                  <div>创建时间：{item.add_time}</div>
                  <div>一级用户：{item.level1_user_name}</div>
                  <div>二级用户：{item.level2_user_name}</div>
                </div>
              }) : <div className='mobile-record-item text-center'>暂无记录</div>
            }
            </div>
          </div>: ""}
        </div>
      </div>
    </div>

  );
}

export default App;
