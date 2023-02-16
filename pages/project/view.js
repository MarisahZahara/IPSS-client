import { Card, Breadcrumb, Button, Form, Input, Select, DatePicker, message } from 'antd';
import Head from 'next/head'
import LayoutBase from "../../layout/base";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { getListEmployee } from "../api/user-management"
import moment from "moment";
import dayjs from 'dayjs';
import { map, isEmpty } from 'lodash'
import { authPage } from '../../middlewares/authorizationPage'
import { getProjectID } from "../api/project"
import authorization from '../../middlewares/authorization'

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

export default function ViewProject(dataToken) {
  const router = useRouter();
  const { id } = router.query

  const [form] = Form.useForm()
  const [dataEmployee, setDataEmployee] = useState([])
  const [flagClassPPI, setFlagClassPPI] = useState("")
  const [flagClassAPI, setFlagClassAPI] = useState("")
  const [idPM, setIdPM] = useState(0)
  const [idField, setIdField] = useState(0)
  const [idDP, setIdDP] = useState(0)
  // let today = new Date()
  // const dateFormatToday = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate()

  useEffect( () => {
    onDataView()
    onDataEmployee()
  }, [])

  const layout = {
    labelCol: {
      span: 8,
    },
    wrapperCol: {
      span: 16,
    },
  }

  const onProject = () => {
    router.push("/project");
  }

  const onDataEmployee = async () => {
    try {
      const token = Cookies.get("token")
      const response = await getListEmployee(token);
      if (response.status === 200) {
        setDataEmployee(response.data)
      }
    } catch (error) {
      console.log(error)
      // message.error(
      //   error.response.data.message
      // )
    }
  }

  const filterDataPM = dataEmployee.filter((ele => ele.role.user_role === "pm"))
  const filterDataField = dataEmployee.filter((ele => ele.role.user_role === "field"))
  const filterDataDP = dataEmployee.filter((ele => ele.role.user_role === "dp"))

  const filterDataPMID = dataEmployee.filter((ele => ele.id === idPM))
  const filterDataFieldID = dataEmployee.filter((ele => ele.id === idField))
  const filterDataDPID = dataEmployee.filter((ele => ele.id === idDP))

  form.setFieldsValue({
    picPMT: isEmpty(filterDataPMID) ? "" : {name: filterDataPMID[0].id, value: filterDataPMID[0].email},
    picField: isEmpty(filterDataFieldID) ? "" : {name: filterDataFieldID[0].id, value: filterDataFieldID[0].email},
    picDP: isEmpty(filterDataDPID) ? "" : {name: filterDataDPID[0].id, value: filterDataDPID[0].email},
  })

  const onDataView = async () => {
    try {
      const token = Cookies.get("token")
      const response = await getProjectID(id, token);
      if (response.status === 200) {
        setIdPM(response.data.id_pmt)
        setIdField(response.data.id_field)
        setIdDP(response.data.id_dp)

        const PPI = parseFloat((response.data.durasi_plan/response.data.durasi_planned)*100).toFixed(0)
        const API = parseFloat((response.data.achievement/response.data.target_sample)*100).toFixed(0)
        const shortfal = response.data.achievement - response.data.target_sample
        const CPI = shortfal/response.data.total_remaining_days

        if (PPI > 100) {
          setFlagClassPPI("calculate-red")
        } else {
          setFlagClassPPI("calculate-green")
        }

        if (response.data.achievement < response.data.target_sample) {
          setFlagClassAPI("calculate-yellow")
        } else {
          setFlagClassAPI("calculate-green")
        }

        form.setFieldsValue({
          projectName: response.data.project_name,
          client: response.data.client_name,
          backgroundProject: response.data.background_project,
          targetSample: response.data.target_sample,
          methodology: {value: response.data.methodology.toLowerCase(), name: response.data.methodology},
          clientService: {value: response.data.client_service.toLowerCase(), name: response.data.client_service},
          fieldworkStart: dayjs(response.data.fw_start, "YYYY/MM/DD"),
          fieldworkEnd: dayjs(response.data.fw_end, "YYYY/MM/DD"),
          durationPlanned: response.data.durasi_planned,
          projectSpecification: response.data.project_specification,
          achievement: response.data.achievement,
          durationPlan: response.data.durasi_plan,
          // sendingDataTabulasi: response.data.sending_data,
          sendingDataTabulasi: dayjs(response.data.sending_data, "YYYY/MM/DD"),
          statusProject: {value: response.data.status_project.toLowerCase(), name: response.data.status_project},
          remarks: response.data.remark,
          totalRemainingDays: response.data.total_remaining_days,
          calculatePPI: PPI,
          calculateAPI: API,
          calculateCPI: CPI,
          shortfalAchievement: shortfal,
        })
      }
    } catch (error) {
      message.error(
        error.response.data.message
      )
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
          <span onClick={onProject}>Project</span>
        </Breadcrumb.Item>
        <Breadcrumb.Item>View Project</Breadcrumb.Item>
      </Breadcrumb>
        <Card
          title="View Project"
          className='project'
        >
          <Form form={form} {...layout} name="nest-messages" autoComplete="off" disabled={true}>
            <Form.Item
              name="projectName"
              label="Project Name"
              rules={[
                {
                  type: "name",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="client"
              label="Client"
              rules={[
                {
                  type: "client",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="backgroundProject"
              label="Background Project"
              rules={[
                {
                  type: "backgroundProject",
                },
              ]}
            >
              <Input.TextArea rows={4}/>
            </Form.Item>
            <Form.Item
              name="targetSample"
              label="Target Sample"
              rules={[
                {
                  type: "targetSample",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="methodology"
              label="Methodology"
              rules={[
                {
                  type: "methodology",
                },
              ]}
            >
              <Select >
                <Select.Option value="f2f capi field">F2F CAPI FIELD</Select.Option>
                <Select.Option value="online survey">ONLINE Survey</Select.Option>
                <Select.Option value="CATI by phone">CATI by phone</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="clientService"
              label="Client Service"
              rules={[
                {
                  type: "clientService",
                },
              ]}
            >
              <Select >
                <Select.Option value="innovation">INNOVATION</Select.Option>
                <Select.Option value="bht">BHT</Select.Option>
                <Select.Option value="cex">CEX</Select.Option>
                <Select.Option value="msu">MSU</Select.Option>
                <Select.Option value="amd">AMD</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="fieldworkStart"
              label="Fieldwork Start"
              rules={[
                {
                  type: "fieldworkStart",
                },
              ]}
            >
              <DatePicker format={"DD MMM YYYY"}/>
            </Form.Item>
            <Form.Item
              name="fieldworkEnd"
              label="Fieldwork End"
              rules={[
                {
                  type: "fieldworkEnd",
                },
              ]}
            >
              <DatePicker format={"DD MMM YYYY"}/>
            </Form.Item>
            <Form.Item
              name="durationPlanned"
              label="Duration Planned"
              rules={[
                {
                  type: "durationPlanned",
                },
              ]}
            >
              <Input suffix="Days"/>
            </Form.Item>
            <Form.Item
              name="projectSpecification"
              label="Project Specification"
              rules={[
                {
                  type: "projectSpecification",
                },
              ]}
            >
              <Input.TextArea rows={4}/>
            </Form.Item>
            <Form.Item
              name="achievement"
              label="Achievement"
              rules={[
                {
                  type: "achievement",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="durationPlan"
              label="Duration Plan"
              rules={[
                {
                  type: "durationPlan",
                },
              ]}
            >
              <Input suffix="Days"/>
            </Form.Item>
            <Form.Item
              name="sendingDataTabulasi"
              label="Sending Data Tabluasi"
              rules={[
                {
                  type: "sendingDataTabulasi",
                },
              ]}
            >
              {/* <Input /> */}
              <DatePicker format={"DD MMM YYYY"}/>
            </Form.Item>
            <Form.Item
              name="picPMT"
              label="PIC PMT"
              rules={[
                {
                  type: "picPMT",
                },
              ]}
            >
              <Select >
                {
                  map(filterDataPM, (data, idx) => {
                    return (
                      <Select.Option key={idx} value={data.id}>{data.email}</Select.Option>
                    )
                  })
                }
              </Select>
            </Form.Item>
            <Form.Item
              name="picField"
              label="PIC Field"
              rules={[
                {
                  type: "picField",
                },
              ]}
            >
              <Select >
                {
                  map(filterDataField, (data, idx) => {
                    return (
                      <Select.Option key={idx} value={data.id}>{data.email}</Select.Option>
                    )
                  })
                }
              </Select>
            </Form.Item>
            <Form.Item
              name="picDP"
              label="PIC DP"
              rules={[
                {
                  type: "picDP",
                },
              ]}
            >
              <Select >
                {
                  map(filterDataDP, (data, idx) => {
                    return (
                      <Select.Option key={idx} value={data.id}>{data.email}</Select.Option>
                    )
                  })
                }
              </Select>
            </Form.Item>
            <Form.Item
              name="statusProject"
              label="Status Project"
              rules={[
                {
                  type: "statusProject",
                },
              ]}
            >
              <Select >
                <Select.Option value="start">Start</Select.Option>
                <Select.Option value="on going fieldwork">On going fieldwork</Select.Option>
                <Select.Option value="fieldwork end">Fieldwork end</Select.Option>
                <Select.Option value="send tabulasi">Send Tabulasi</Select.Option>
                <Select.Option value="close">Close</Select.Option>
              </Select>
            </Form.Item>
            {
              <>
                <Form.Item
                  name="totalRemainingDays"
                  label="Total Remaining Days"
                  rules={[
                    {
                      type: "totalRemainingDays",
                    },
                  ]}
                >
                  <Input disabled={true} suffix="Days"/>
                </Form.Item>
                <Form.Item
                  name="calculatePPI"
                  label="Calculate PPI"
                  rules={[
                    {
                      type: "calculatePPI",
                    },
                  ]}
                >
                  <Input disabled={true} className={flagClassPPI} suffix="%"/>
                </Form.Item>
                <Form.Item
                  name="calculateAPI"
                  label="Calculate API"
                  rules={[
                    {
                      type: "calculateAPI",
                    },
                  ]}
                >
                  <Input disabled={true} className={flagClassAPI} suffix="%"/>
                </Form.Item>
                <Form.Item
                  name="calculateCPI"
                  label="Calculate CPI"
                  rules={[
                    {
                      type: "calculateCPI",
                    },
                  ]}
                >
                  <Input disabled={true} className="calculate-green"/>
                </Form.Item>
                <Form.Item
                  name="shortfalAchievement"
                  label="Shortfal Achievement"
                  rules={[
                    {
                      type: "shortfalAchievement",
                    },
                  ]}
                >
                  <Input disabled={true}/>
                </Form.Item>
              </>
            }
            <Form.Item
              name="remarks"
              label="Remarks"
              rules={[
                {
                  type: "remarks",
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Form>
        </Card>
    </LayoutBase>
  );
}
