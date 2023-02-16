import {
  Card, Space, Table, Button, message, Modal, Input
} from 'antd';
import Head from 'next/head'
import LayoutBase from "../../layout/base";
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useRouter } from "next/router";
import { authPage } from '../../middlewares/authorizationPage'
import authorization from '../../middlewares/authorization'
import { useEffect, useState, useRef } from "react";
import { getListEmployee, deleteEmployee } from "../api/user-management"
import Cookies from "js-cookie";
import { map, isEmpty } from 'lodash'
import Highlighter from 'react-highlight-words';

export async function getServerSideProps(ctx) {
  try {
    const { token } = await authPage(ctx);
    const decode = await authorization(token);
    if (decode) {
      return {
        props: {
          dataToken: decode,
        },
      };
    } else {
      return ctx.res
        .writeHead(302, {
          Location: "/",
        })
        .end();
    }
  } catch (error) {
    return ctx.res
      .writeHead(302, {
        Location: "/",
      })
      .end();
  }
}

export default function UserManagement(dataToken) {
  const router = useRouter();

  const [Loading, setLoading] = useState(false)
  const [dataEmployee, setDataEmployee] = useState([])
  const [searchText, setSearchText] = useState('')
  const [searchedColumn, setSearchedColumn] = useState('')
  const searchInput = useRef(null)

  useEffect( () => {
    onListData()
  }, [])

  const onListData = async () => {
    try {
      setLoading(true)
      const token = Cookies.get("token")
      const response = await getListEmployee(token);
      if (response.status === 200) {
        setLoading(false)
        setDataEmployee(response.data)
      }
    } catch (error) {
      message.error(
        error.response.data.message
      )
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  const onCreateUser = () => {
    router.push("/user-management/create");
  }

  const onViewUser = (values) => {
    router.push({
      pathname: "/user-management/view",
      query: {
          id: values
      }
    })
  }

  const onEditUser = (values) => {
    router.push({
      pathname: "/user-management/edit",
      query: {
          id: values
      }
    })
  }

  const onResetPassword = (values) => {
    router.push({
      pathname: "/user-management/reset-password",
      query: {
          id: values
      }
    })
  }

  const data = !isEmpty(dataEmployee) ? map(dataEmployee, (data, idx) => {
    return {
      key: idx+1,
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      role: data.role.user_role.toUpperCase(),
    }
  }) : []

  const [visible, setVisible] = useState(false);
  const [idUser, setIdUser] = useState("")

  const showConfirmation = (data) => {
    setVisible(!visible);
    setIdUser(data)
  }

  const onCancel = () => {
    setVisible(!visible);
    setLoading(false);
  }

  const onDeleteUser = async () => {
    try {
      setLoading(true)
      const token = Cookies.get("token")
      const response = await deleteEmployee(idUser, token);
      if (response.status === 200) {
        message.success(
          "Delete User Berhasil!"
        );
        setTimeout(() => {
          setVisible(!visible);
          router.reload();
        }, 2000)
        setLoading(false)
      }
    } catch (error) {
      message.error(
        error.response.data.message
      )
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  }
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  }
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: 'block',
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? '#1890ff' : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: '#ffc069',
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  })

  const columns = [
    {
      title: 'No',
      dataIndex: 'key',
      key: 'key',
    },
    {
      title: 'First Name',
      dataIndex: 'firstName',
      key: 'firstName',
      ...getColumnSearchProps('firstName'),
    },
    {
      title: 'Last Name',
      dataIndex: 'lastName',
      key: 'lastName',
      ...getColumnSearchProps('lastName'),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      ...getColumnSearchProps('email'),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      filters: [
        {
          text: 'ADMIN',
          value: 'ADMIN',
        },
        {
          text: 'DP',
          value: 'DP',
        },
        {
          text: 'FIELD',
          value: 'FIELD',
        },
        {
          text: 'PM',
          value: 'PM',
        },
      ],
      onFilter: (value, record) => record.role.indexOf(value) === 0,
    },
    {
      title: 'Action',
      dataIndex: 'id',
      key: 'action',
      render: (data) => {
        return (
          <Space size="middle" className="table-action">
            <span onClick={() => onEditUser(data)}>Edit</span>
            <span onClick={() => onViewUser(data)}>View</span>
            <span onClick={() => onResetPassword(data)}>Reset Password</span>
            <span onClick={() => showConfirmation(data)}>Delete</span>
          </Space>
        )
      }
    },
  ];

  return (
    <LayoutBase dataToken={dataToken}>
      <Modal
        title="Confirmation"
        visible={visible}
        centered={true}
        destroyOnClose={true}
        maskClosable={false}
        closable={false}
        className="modal-footer"
        footer={[
          <Button
            key="back"
            loading={Loading}
            onClick={() => {
              onCancel();
            }}
          >
            Cancel
          </Button>,
          <Button key="submit" type="primary" loading={Loading} onClick={() => onDeleteUser(idUser)}>
            Ok
          </Button>,
        ]}
      >
        <p>Are you sure want to Delete User?</p>
      </Modal>
      <Head>
        <title>Ipsos Application</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
        <Card
          title="List User"
          extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={onCreateUser}>
              Add User
            </Button>
          }
        >
          <Table columns={columns} dataSource={data} pagination={true} limit={10} loading={Loading} />
        </Card>
    </LayoutBase>
  );
}
