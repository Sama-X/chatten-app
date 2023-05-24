import './package.css'

import { Button, Form, message, Popconfirm, Table, Modal, Select,Input } from 'antd';
import React, { useEffect, useState } from 'react';
import Request from '../../../requestAdmin.ts';
import { Link } from 'react-router-dom';




const App = () => {

  const [current, setCurrent] = useState(1)
  const [total, setTotal] = useState(0)
  const [pageSize, _] = useState(10)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('2')
  const [day, setDay] = useState('')
  const [num, setNum] = useState('')
  const [price, setPrice] = useState('')
  const [priority, setPriority] = useState('')
  const [method, setMethod] = useState("post")
  const [key, setKey] = useState("")


  let request = new Request({});

  const [form] = Form.useForm();
  const [data, setData] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    if(category === '2'){
      message.error("请选择套餐类型")
      return
    }
    if(name === ''){
      message.error("请输入套餐名称")
      return
    }

    if(method == 'post'){
      request.post('/api/v1/admin/order/order-packages/',{
        name: name,
        category: category,
        usage_days: day,
        usage_count: num,
        price: price,
        priority: priority
      }).then((res)=>{
        console.log("overview=", res.data)
        setIsModalOpen(false);
        fetchData(1)
      })
    }

    if(method=='put'){
      request.put('/api/v1/admin/order/order-packages/'+ key + '/',{
        name: name,
        category: category,
        usage_days: day,
        usage_count: num,
        price: price,
        priority: priority
      }).then((res)=>{
        console.log("overview=", res.data)
        setIsModalOpen(false);
        fetchData(1)
      })
    }

  };

  const editPackage = (key, name, category, usage_days, usage_count, price, priority) => {
    setKey(key)
    setName(name)
    setCategory(category)
    setDay(usage_days)
    setNum(usage_count)
    setPrice(price)
    setPriority(priority)
    setMethod('put')
    setIsModalOpen(true)
  }

  const handleCancel = () => {
    console.log('cancel')
    setIsModalOpen(false);
    setCategory('2')
    console.log('category', category)
  };

  const changeName = (e) => {
      setName(e.target.value)
  }
  const changeCategory = (value) => {
    console.log('category=', value)
    setCategory(value)
  }
  const changeDay = (e) => {
    setDay(e.target.value)
  } 
  const changeNum = (e) => {
    setNum(e.target.value)
  }
  const changePrice = (e) => {
    setPrice(e.target.value)
  }
  const changePriority = (e) => {
    setPriority(e.target.value)
  }

  const fetchData = (page) => {
    request.get('/api/v1/admin/order/order-packages/?offset=' + pageSize + '&page=' + page).then((res)=>{
      console.log("res===", res)

      if(res.code === 0){
        setTotal(res.count)
        var originData = []
        for(var i=0; i<res.data.length; i++){
           var tmp = res.data[i]
           tmp["key"] = res.data[i].id
           tmp["name"] = res.data[i].name
           tmp["category"] = res.data[i].category + ''
           tmp["category_name"] = res.data[i].category == 1? '永久期限': '固定期限'
           tmp["usage_count"] = res.data[i].usage_count
           tmp["price"] = res.data[i].price
           tmp["priority"] = res.data[i].priority
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
    request.delete('/api/v1/admin/order/order-packages/' + key + '/').then((res)=>{
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
      title: 'id',
      dataIndex: 'id',
      width: '15%',
      editable: false,
    },
    {
      title: '名称',
      dataIndex: 'name',
      width: '15%',
      editable: false,
    },
    {
      title: '类型',
      dataIndex: 'category_name',
      width: '20%',
      editable: false,
    },
    {
      title: '天数',
      dataIndex: 'usage_days',
      width: '10%',
      editable: false,
    },
    {
      title: '次数',
      dataIndex: 'usage_count',
      width: '10%',
      editable: false,
    },
    {
      title: '价格',
      dataIndex: 'price',
      width: '10%',
      editable: false,
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      width: '10%',
      editable: true,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      render: (_, record) => {
        return (
          <div>
            <Button type="primary" className='add-package-btn' onClick={() => editPackage(record.key, record.name, record.category, record.usage_days, record.usage_count, record.price, record.priority)}>修改</Button>
            &nbsp;&nbsp;
            <Popconfirm title="确定删除吗?" onConfirm={() => deleteItem(record.key)} style={{ marginRight: 8 }}>
              <Button type="primary" >删除</Button>
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

  const addPackage = () => {
    setKey('')
    setMethod('post')
    setName('')
    setCategory('2')
    console.log('aaaa=', category)
    setDay('')
    setNum('')
    setPrice('')
    setPriority('')
    showModal()
  }

  return (
    <div>
      <Button type="primary" className='add-package-btn' onClick={addPackage}>+增加套餐</Button>

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
      <Modal title="Basic Modal" className='package-model' open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        <div className='package-input-item-list'>
          <div className='package-input-item'><div className='package-input-item-name'>名称</div><input onChange={changeName} value={name} /></div>
          <div className='package-input-item'><div className='package-input-item-name'>套餐类型</div>
            <Select
            className='package-category-select'
              showSearch
              placeholder="选择套餐类型"
              optionFilterProp="children"
              onChange={changeCategory}
              value={category}
              // onSearch={onSearch}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={[
                {
                  value: '1',
                  label: '永久期限',
                },
                {
                  value: '0',
                  label: '固定期限',
                },
                {
                  value: '2',
                  label: '未选择',
                }
              ]}
            />
          </div>
          <div className='package-input-item'><div className='package-input-item-name'>套餐可使用天数</div><input onChange={changeDay} value={day} /></div>
          <div className='package-input-item'><div className='package-input-item-name'>套餐可使用次数</div><input onChange={changeNum} value={num} /></div>
          <div className='package-input-item'><div className='package-input-item-name'>价格</div><input onChange={changePrice} value={price} /></div>
          <div className='package-input-item'><div className='package-input-item-name'>优先级</div><input onChange={changePriority} value={priority} /></div>
        </div>
      </Modal>
    </div>

  );
};

export default App;