import './index.css';

import { useEffect } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import cookie from 'react-cookies'

import Header from '../header/header.js'
import Menu from '../menu/menu.js'
import Dashboard from '../dashboard/dashboard.js'
import PackageList from '../package/package.js'


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
          {props.menu === 'company_list' ? <PackageList></PackageList> : ""}
          {props.menu === 'company_list' ? <PackageList></PackageList> : ""}
          {props.menu === 'company_list' ? <PackageList></PackageList> : ""}
          {props.menu === 'company_list' ? <PackageList></PackageList> : ""}
          {props.menu === 'company_list' ? <PackageList></PackageList> : ""}
        </div>
      </div>
    </div>
  )

}

export default App;
