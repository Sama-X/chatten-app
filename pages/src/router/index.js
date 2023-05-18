import React, { Component } from 'react'
// 导入所需组件
import Login from '../components/login/index.js'
import SignIn from '../components/signIn/index.js'
import ChatPage from '../components/chatPage/index.js'
import Index from '../components/index'
import Price from '../components/price/index.js'
// 导入路由依赖
import {  Route,BrowserRouter } from 'react-router-dom'


export default class index extends Component {
  render() {
    return (
        // 使用BrowserRouter包裹，配置路由
      <BrowserRouter>
         {/* 使用/配置路由默认页；exact严格匹配 */}
        <Route component={Index} path='/' exact></Route>
        {/* <Route component={Login} path='/Login'></Route> */}
        <Route component={Index} path='/Index'></Route>
        <Route component={Login} path='/Login'></Route>
        <Route component={SignIn} path='/SignIn'></Route>
        <Route component={Price} path='/price'></Route>
        <Route component={ChatPage} path='/ChatPage' exact></Route>
        {/* <Route component={Index} path='/Index'></Route> */}
      </BrowserRouter>
    )
  }
}