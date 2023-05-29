import './index.css';

import { useEffect } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import cookie from 'react-cookies'

import Header from '../header/header.js'
import Menu from '../menu/menu.js'
import Dashboard from '../dashboard/dashboard.js'
import PackageList from '../package/package.js'
import ConfigList from '../config/config.js'
import OrderList from '../order/order.js'
import ScoreList from '../score/score.js'
import WithdrawList from '../withdraw/withdraw.js'
import UserList from '../user/user.js'


function App(props) {
  const navigate = useHistory();
  const params = useParams();

  useEffect(() =>{
    if(!cookie.load('admin_token')){
      navigate.push('/admin/login')
    }
  })

  return (
    <div className='bodyContainerx'>
      <Header></Header>
      <div className="menu-container">
        <Menu></Menu>
        <div className="table-container">
          {props.location.pathname === '/admin/dashboard' ? <Dashboard></Dashboard> : ""}
          {props.location.pathname === '/admin' ? <Dashboard></Dashboard> : ""}
          {props.location.pathname === '/admin/packages' ? <PackageList></PackageList> : ""}
          {props.location.pathname === '/admin/configs' ? <ConfigList></ConfigList> : ""}
          {props.location.pathname === '/admin/orders' ? <OrderList></OrderList> : ""}
          {props.location.pathname === '/admin/scores' ? <ScoreList></ScoreList> : ""}
          {props.location.pathname === '/admin/withdraws' ? <WithdrawList></WithdrawList> : ""}
          {props.location.pathname === '/admin/users' ? <UserList></UserList> : ""}
        </div>
      </div>
    </div>
  )

}

export default App;
