import { useRouter } from "next/router";
import moment from "moment";
import { useEffect, useState } from "react";
import {
  HomeOutlined,
  FolderOutlined,
  SettingOutlined,
  UserOutlined,
  DownOutlined
} from '@ant-design/icons';
import { Layout, Menu, theme } from 'antd';
import Cookies from "js-cookie";
const { Header, Content, Footer, Sider } = Layout;
function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}

export default function LayoutBase({ children, dataToken }) {
  console.log(dataToken, "data token user")
  const router = useRouter();
  const selectedKeys = router.pathname.substr(1);
  const defaultOpenKeys = selectedKeys.split("/")[1];
  const dataUser = dataToken.dataToken

  const [showChildren, setshowChildren] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const menuVertical = (value) => {
    if (value.key === "home") {
      router.push("/home");
    } else if (value.key === "project") {
      router.push("/project");
    } else if (value.key === "user-management") {
      router.push("/user-management");
    } else {
      router.push("/home");
    }
  }

  const menuHorizontal = (value) => {
    if (value.key === "logout") {
      Cookies.remove("token");
      router.push("/")
    } else if (value.key === "myprofile") {
      router.push({
        pathname: "/user-management/view",
        query: {
            id: dataUser.id
        }
      })
    }
  }

  const items = [
    getItem('Home', 'home', <HomeOutlined />),
    getItem('Project',
    router.asPath === "/project/create"
        ? "project/create" :
    router.asPath === "/project/view"
        ? "project/view" :
    router.asPath === "/project/edit"
        ? "project/edit"
        : 'project',
    <FolderOutlined />),
    dataUser.role === "admin" ?
    getItem('User Management',
    router.asPath === "/user-management/create"
        ? "user-management/create" :
    router.asPath === "/user-management/view"
        ? "user-management/view" :
    router.asPath === "/user-management/edit"
        ? "user-management/edit" :
    router.asPath === "/user-management/reset-password"
        ? "user-management/reset-password"
        : 'user-management',
    <SettingOutlined />)
    : ""
  ];

  const profile = [
    {
      label: <>{dataUser.email} <DownOutlined /></>,
      key: 'profile',
      icon: <UserOutlined />,
      children: [
        {
          label: "My Profile",
          key: 'myprofile',
        },
        {
          label: 'Logout',
          key: 'logout',
        },
      ],
    },
  ]

  useEffect(() => {
    setshowChildren(true);
  });

  return (
    <Layout
      style={{
        minHeight: '100vh',
      }}
    >
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}
        className="sider"
      >
        <div className="logo">
          <h1><img src="/images/logo-ipsos.png" width="70px" /></h1>
        </div>
        <Menu theme="light"
          defaultSelectedKeys={["home"]}
          defaultOpenKeys={[defaultOpenKeys]}
          selectedKeys={[selectedKeys]}
          mode="inline" items={items} onClick={menuVertical}
        />
      </Sider>
      <Layout className="site-layout">
        <Header
          className="header"
        >
          <Menu mode="horizontal" items={profile} onClick={menuHorizontal}
            className="menu-horizontal"
          />
        </Header>
        <Content
          className={collapsed === false ? "content-true" : "content-false"}
        >
          <div
            style={{
              padding: 24,
              minHeight: "100%",
              marginTop: "15px"
            }}
          >
            {showChildren && children}
          </div>
        </Content>
        <Footer
          className="footer"
        >
          Copyright © {moment().format("YYYY")} Ipsos - Application
        </Footer>
      </Layout>
    </Layout>
  );
}
