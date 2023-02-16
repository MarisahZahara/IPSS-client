import { Card, Space, Table, Button, message, Input, Modal } from 'antd';
import Head from 'next/head'
import LayoutBase from "../../layout/base";
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useRouter } from "next/router";
import { authPage } from '../../middlewares/authorizationPage'
import authorization from '../../middlewares/authorization'
import { useEffect, useState, useRef } from "react";
import { getListProject, deleteProject } from "../api/project"
import Cookies from "js-cookie";
import { map, isEmpty } from 'lodash'
import moment from "moment";
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

export default function Project(dataToken) {
  const router = useRouter();
  const dataUser = dataToken.dataToken

  const [Loading, setLoading] = useState(false)
  const [dataProject, setDataProject] = useState([])
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
      const response = await getListProject(token);
      if (response.status === 200) {
        setLoading(false)
        setDataProject(response.data)
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
      title: 'Project Name',
      dataIndex: 'projectName',
      key: 'projectName',
      ...getColumnSearchProps('projectName'),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      ...getColumnSearchProps('date'),
    },
    {
      title: 'Target Sample',
      dataIndex: 'targetSample',
      key: 'targetSample',
      sorter: (a, b) => a.targetSample - b.targetSample,
    },
    {
      title: 'Methodology',
      dataIndex: 'methodology',
      key: 'methodology',
      filters: [
        {
          text: 'F2F CAPI FIELD',
          value: 'F2F CAPI FIELD',
        },
        {
          text: 'ONLINE SURVEY',
          value: 'ONLINE SURVEY',
        },
        {
          text: 'CATI BY PHONE',
          value: 'CATI BY PHONE',
        },
      ],
      onFilter: (value, record) => record.methodology.indexOf(value) === 0,
    },
    {
      title: 'Status Project',
      dataIndex: 'statusProject',
      key: 'statusProject',
      filters: [
        {
          text: 'START',
          value: 'START',
        },
        {
          text: 'ON GOING FIELDWORK',
          value: 'ON GOING FIELDWORD',
        },
        {
          text: 'FIELDWORK END',
          value: 'FIELDWORK END',
        },
        {
          text: 'SEND TABULASI',
          value: 'SEND TABULASI',
        },
        {
          text: 'CLOSE',
          value: 'CLOSE',
        },
      ],
      onFilter: (value, record) => record.statusProject.indexOf(value) === 0,
    },
    // {
    //   title: 'Created by',
    //   dataIndex: 'createdby',
    //   key: 'createdby',
    // },
    {
      title: 'Action',
      dataIndex: 'data',
      key: 'action',
      render: (data) => {
        return (
          <Space size="middle" className="table-action">
            {
              data.status_project === "close" ? <span style={{color: "#757575", cursor: "auto"}}>Edit</span> : <span onClick={() => onEditProject(data.id)}>Edit</span>
            }
            <span onClick={() => onViewProject(data.id)}>View</span>
            {
              dataUser.role === "admin" ? <span onClick={() => showConfirmation(data.id)}>Delete</span> : ""
            }
          </Space>
        )
      }
    },
  ];

  const data = !isEmpty(dataProject) ? map(dataProject, (data, idx) => {
    return {
      key: idx+1,
      id: data.id,
      data: data,
      projectName: data.project_name,
      date: moment(data.createdAt).format("DD-MM-YYYY"),
      targetSample: data.target_sample,
      methodology: data.methodology.toUpperCase(),
      statusProject: data.status_project.toUpperCase(),
      // createdby: 'budi.hartono@gmail.com',
    }
  }) : []

  const [visible, setVisible] = useState(false);
  const [idProject, setIdProject] = useState("")

  const showConfirmation = (data) => {
    setVisible(!visible);
    setIdProject(data)
  }

  const onCancel = () => {
    setVisible(!visible);
    setLoading(false);
  }

  const onDeleteProject = async () => {
    try {
      setLoading(true)
      const token = Cookies.get("token")
      const response = await deleteProject(idProject, token);
      if (response.status === 200) {
        message.success(
          "Delete Project Berhasil!"
        );
        setTimeout(() => {
          setVisible(!visible);
          router.reload()
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

  const onCreateProject = () => {
    router.push("/project/create");
  }
  const onViewProject = (values) => {
    router.push({
      pathname: "/project/view",
      query: {
          id: values
      }
    })
  }

  const onEditProject = (values) => {
    router.push({
      pathname: "/project/edit",
      query: {
          id: values
      }
    })
  }

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
          <Button key="submit" type="primary" loading={Loading} onClick={() => onDeleteProject(idProject)}>
            Ok
          </Button>,
        ]}
      >
        <p>Are you sure want to Delete Project?</p>
      </Modal>
      <Head>
        <title>Ipsos Application</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
        <Card
          title="List Project"
          extra={
            dataUser.role === "admin" ?
            <Button type="primary" icon={<PlusOutlined />} onClick={onCreateProject}>
              Create Project
            </Button> : ""
          }
        >
          <Table columns={columns} dataSource={data} pagination={true} limit={10} loading={Loading}/>
        </Card>
    </LayoutBase>
  );
}
