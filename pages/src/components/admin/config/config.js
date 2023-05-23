import { Form, InputNumber, Popconfirm, Table, Typography, Input } from 'antd';
import React, { useEffect, useState } from 'react';
import Request from '../../../requestAdmin.ts';


const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{
            margin: 0,
          }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};
const App = () => {
  let request = new Request({});
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [current, setCurrent] = useState(1)
  const [total, setTotal] = useState(0)
  const [pageSize, _] = useState(10)

  const fetchData = (page) => {
    request.get('/api/v1/admin/configs/?offset=' + pageSize + '&page=' + page).then((res)=>{
      console.log("res===", res)
      if(res.code === 0){
        setTotal(res.count)
        var originData = []
        for(var i=0; i<res.data.length; i++){
           var tmp = res.data[i]
           tmp["key"] = res.data[i].id
           tmp["name"] = res.data[i].name
           tmp["value"] = res.data[i].value
           tmp["description"] = res.data[i].description
           originData.push(tmp)
        }
        setData(originData)
      }
    })
  }

  useEffect(()=>{
    fetchData(1)
  }, [])




  const [editingKey, setEditingKey] = useState('');
  const isEditing = (record) => record.key === editingKey;
  const edit = (record) => {
    form.setFieldsValue({
      name: '',
      age: '',
      address: '',
      ...record,
    });
    setEditingKey(record.key);
  };
  const cancel = () => {
    setEditingKey('');
  };
  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);
      if (index > -1) {
        const item = newData[index];
        console.log('rrrr=', row)
        request.put('/api/v1/admin/configs/'+ key + '/',{
          value: row['value']
        }).then((res)=>{
          console.log("config put=", res.data)
          newData.splice(index, 1, {
            ...item,
            ...row,
          });
          setData(newData);
          setEditingKey('');
        })

      } else {
        newData.push(row);
        setData(newData);
        setEditingKey('');
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };
  const columns = [
    {
      title: 'name',
      dataIndex: 'name',
      width: '25%',
      editable: false,
    },
    {
      title: 'key',
      dataIndex: 'description',
      width: '40%',
      editable: false,
    },
    {
      title: 'value',
      dataIndex: 'value',
      width: '15%',
      editable: true,
    },
    {
      title: 'operation',
      dataIndex: 'operation',
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Typography.Link
              onClick={() => save(record.key)}
              style={{
                marginRight: 8,
              }}
            >
              Save
            </Typography.Link>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <a>Cancel</a>
            </Popconfirm>
          </span>
        ) : (
          <Typography.Link disabled={editingKey !== ''} onClick={() => edit(record)}>
            Edit
          </Typography.Link>
        );
      },
    },
  ];
  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: col.dataIndex === 'age' ? 'number' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });
  return (
    <Form form={form} component={false}>
      <Table
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        bordered
        dataSource={data}
        columns={mergedColumns}
        rowClassName="editable-row"
        pagination={{
          onChange: cancel,
        }}
      />
    </Form>
  );
};
export default App;