import { AppstoreOutlined, MailOutlined, SettingOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import React, { useState } from 'react';
import { useHistory } from 'react-router';


function getItem(
  label,
  key,
  icon,
  children,
  type,
) {
  return {
    key,
    icon,
    children,
    label,
    type,
  };
}

const items = [
  getItem('Dashboard', 'sub1', <MailOutlined />, [
    getItem('概览', '0'),
  ]),
  getItem('套餐管理', 'sub2', <SettingOutlined />, [
    getItem('套餐列表', '1'),
  ]),
  getItem('配置管理', 'sub3', <AppstoreOutlined />, [
    getItem('配置项', '2'),
  ]),
  getItem('订单管理', 'sub4', <SettingOutlined />, [
    getItem('订单列表', '3'),
  ]),
];

// submenu keys of first level
const rootSubmenuKeys = ['sub1x',];

const App = () => {
  const [openKeys, setOpenKeys] = useState(['sub1']);
  const navigate = useHistory();

  const onOpenChange = keys => {
    const latestOpenKey = keys.find(key => openKeys.indexOf(key) === -1);
    if (rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
      setOpenKeys(keys);
    } else {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    }
  };

  const clickOption = e => {
    console.log('click ', e);
    if(e.key == '0'){
      console.log("ccccc")
      navigate.push('/admin/dashboard')
    }else if(e.key == '1'){
      navigate.push('/admin/packages')
    }else if(e.key == '2'){
      navigate.push('/admin/configs')
    }else if(e.key == '3'){
      navigate.push('/admin/orders')
    }
  };

  return (
    <Menu className="adminMenu"
      mode="inline"
      openKeys={openKeys}
      onOpenChange={onOpenChange}
      style={{ width: 256 }}
      items={items}
      onClick={clickOption}
      theme='light'
    />
  );
};

export default App;