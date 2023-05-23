import './header.css'

import React, { useEffect, useState } from 'react'
import cookie from 'react-cookies'
import { useHistory } from 'react-router-dom'



function  Header() {

    const [user, setUser] = useState({})
    const [showDropdown, setShowDropdown] = useState(false)
    const history = useHistory();

    useEffect(()=>{
        let user = cookie.load('user')
        user = {'username': 'test'}
        setUser(user)
    }, [])

    const handleOver = () => {
        setShowDropdown(true)
    }

    const handleLeave = () => {
        setShowDropdown(false)
    }

    const signOut = () => {
        cookie.save('user', '', { path: '/' })
        cookie.save('token', '', { path: '/' })
        history.push({pathname: '/login'})
    }

    return (
        <div className='admin-header-container'>
            <div className="admin-header-left">
                <div className="admin-header-logo"></div>
                <div className="admin-header-title">管理平台</div>
            </div>
            <div onMouseOver={()=>handleOver()} onMouseLeave={()=>handleLeave()}>
                <div className={showDropdown  ? 'admin-header-right admin-header-right-show-dropdown': 'admin-header-right'}>
                    <div className="admin-header-avatar"></div>
                    <div className="admin-header-name">{user.username}</div>
                </div>

                {showDropdown  ?
                <div className="admin-header-dropdown-container">
                    <div className="admin-header-dropdown-item">
                        <div className="admin-header-dropwond-item-avatar-icon"></div>
                        <div className="admin-header-dropwond-item-text">个人中心</div>
                    </div>
                    <div className="admin-header-spilt-line"></div>
                    <div className="admin-header-dropdown-item">
                        <div className="admin-header-dropwond-item-quit-icon"></div>
                        <div className="admin-header-dropwond-item-text" onClick={ signOut }>退出登录</div>
                    </div>
                </div>:""}
            </div>
        </div>
    )

}


export default Header
