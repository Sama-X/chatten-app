import './package.css'

import { Button, Form, message, Popconfirm, Table } from 'antd';
import React, { useEffect, useState } from 'react';
import Request from '../../../requestAdmin.ts';
import { Link } from 'react-router-dom';



const App = () => {

  const [current, setCurrent] = useState(1)
  const [total, setTotal] = useState(0)
  const [pageSize, _] = useState(10)

  let request = new Request({});

  const [form] = Form.useForm();
  const [data, setData] = useState([]);

  const fetchData = (page) => {
    request.get('/api/v1/admin/oilfields/?limit=' + pageSize + '&page=' + page).then((res)=>{
      console.log("res===", res)

      if(res.code === 0){
        setTotal(res.count)
        var originData = []
        for(var i=0; i<res.data.length; i++){
           var tmp = res.data[i]
           tmp["key"] = res.data[i].id
           tmp["ssq"] = [res.data[i].province, res.data[i].city, res.data[i].district].join('-')
           originData.push(tmp)
        }
        setData(originData)
      }
    })
  }

  useEffect(()=>{
    fetchData(1)
  }, [])


  const deleteItem = async (key) => {
    console.log('deleteItem=', key)
    request.delete('/api/v1/admin/oilfields/' + key + '/').then((res)=>{
      if(res.code === 0){
        message.info('删除成功');
        fetchData(current)
      }else{
        message.info(res.msg);
      }
    })
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      width: '15%',
      editable: false,
    },
    {
      title: '创建时间',
      dataIndex: 'add_time',
      width: '23%',
      editable: false,
    },
    {
      title: '省市区',
      dataIndex: 'ssq',
      width: '20%',
      editable: false,
    },
    {
      title: '隶属公司',
      dataIndex: 'company_name',
      width: '20%',
      editable: false,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      render: (_, record) => {
        return (
          <div>
            <Link target="_blank" to={"/oil_field/detail/" + record.key}>详情</Link>
            &nbsp;&nbsp;
            <Popconfirm title="确定删除吗?" onConfirm={() => deleteItem(record.key)} style={{ marginRight: 8 }}>
              <a>删除</a>
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  const changePage = (page) => {
    console.log('changePage', page)
    setCurrent(page)
    fetchData(page)
  }

  const addOilField = () => {
    const w = window.open('/oil_field/add', '_blank');
    if(w){ w.focus()}  
  }

  return (
    <div>
      {/* <Button type="primary" className='oil-field-add-btn' onClick={addOilField}>+增加油田</Button> */}

      <Form form={form} component={false}>
        <Table
          bordered
          dataSource={data}
          columns={columns}
          pagination={{
            onChange: changePage,
            total: total,
            current: current,
            pageSize: pageSize
          }}
        />
      </Form>

    </div>

  );
};

export default App;