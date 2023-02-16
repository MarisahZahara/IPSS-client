import { Card, Breadcrumb, Button, Form, Input, Select, DatePicker, message } from 'antd';
import Head from 'next/head'
import LayoutBase from "../../layout/base";
import { useRouter } from "next/router";
import { authPage } from '../../middlewares/authorizationPage'
import authorization from '../../middlewares/authorization'
import { register, getRoles } from "../api/user-management"
import { useEffect, useState } from "react";
import { map } from 'lodash';
import Cookies from "js-cookie";

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

export default function CreateUser(dataToken) {
  const router = useRouter();

  const [Loading, setLoading] = useState(false)
  const [dataRoles, setDataRoles] = useState([])

  const layout = {
    labelCol: {
      span: 8,
    },
    wrapperCol: {
      span: 16,
    },
  }

  const onUserManagement = () => {
    router.push("/user-management");
  }

  useEffect( () => {
    typeRoles()
  }, [])

  const typeRoles = async () => {
    try {
      const token = Cookies.get("token")
      const response = await getRoles(token);
      if (response.status === 200) {
        setDataRoles(response.data)
      }
    } catch (error) {
      message.error(
        error.response.data.message
      )
    }
  }

  const onCreateUser = async (values) => {
    try {
      setLoading(true)
      const token = Cookies.get("token")
      let data = new FormData()
      data.append('email', values.email)
      data.append('firstName', values.firstName)
      data.append('lastName', values.lastName)
      data.append('id_role', values.position)
      data.append('gender', values.gender)
      data.append('phone', values.phone)
      data.append('password', values.password)
      const response = await register(data, token);
      if (response.status === 200) {
        message.success(
          "Create User Berhasil!"
        );
        setTimeout(() => {
          router.push("/user-management");
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

  return (
    <LayoutBase dataToken={dataToken}>
      <Head>
        <title>Ipsos Application</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Breadcrumb className="breadcrumb">
        <Breadcrumb.Item>
          <span onClick={onUserManagement}>User Management</span>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Create User</Breadcrumb.Item>
      </Breadcrumb>
        <Card
          title="Create User"
        >
          <Form {...layout} name="nest-messages" autoComplete="off" onFinish={onCreateUser}>
            <Form.Item
              name="firstName"
              label="First Name"
              rules={[
                {
                  type: "firstName",
                },
              ]}
            >
              <Input placeholder="Input First Name here"/>
            </Form.Item>
            <Form.Item
              name="lastName"
              label="Last Name"
              rules={[
                {
                  type: "lastName",
                },
              ]}
            >
              <Input placeholder="Input Last Name here"/>
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                {
                  type: 'email',
                  message: 'The input is not valid E-mail!',
                },
                {
                  required: true,
                  message: 'Please input your E-mail!',
                },
              ]}
            >
              <Input placeholder="Input Email here"/>
            </Form.Item>
            <Form.Item
              name="position"
              label="Position"
              rules={[
                {
                  type: "position",
                },
              ]}
            >
              <Select placeholder="Select Position">
                {
                  map(dataRoles, (data, idx) => {
                    return (
                      <Select.Option key={idx} value={data.id}>{data.user_role.toUpperCase()}</Select.Option>
                    )
                  })
                }
              </Select>
            </Form.Item>
            <Form.Item
              name="gender"
              label="Gender"
              rules={[
                {
                  type: "gender",
                },
              ]}
            >
              <Select placeholder="Select Gender">
                <Select.Option value="male">Male</Select.Option>
                <Select.Option value="female">Female</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="phone"
              label="Phone"
              rules={[
                {
                  type: "phone",
                },
              ]}
            >
              <Input placeholder="Input Phone here"/>
            </Form.Item>
            <Form.Item
              name="password"
              label="Password"
              rules={[
                {
                  required: true,
                  message: 'Please input your password!',
                },
              ]}
            >
              <Input.Password placeholder="Input Password here"/>
            </Form.Item>
            <Form.Item
              name="confirm"
              label="Confirm Password"
              dependencies={['password']}
              hasFeedback
              rules={[
                {
                  required: true,
                  message: 'Please confirm your password!',
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('The two passwords that you entered do not match!'));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Input Confirm Password here"/>
            </Form.Item>
            <Form.Item
              wrapperCol={{
                ...layout.wrapperCol,
                offset: 8,
              }}
            >
              <Button type="primary" htmlType="submit" className="button-footer-form-side" loading={Loading}>
                Submit
              </Button>
              <Button loading={Loading} onClick={onUserManagement}>
                Cancel
              </Button>
            </Form.Item>
          </Form>
        </Card>
    </LayoutBase>
  );
}