import { Card, Breadcrumb, Button, Form, Input, Select, DatePicker, message } from 'antd';
import Head from 'next/head'
import LayoutBase from "../../layout/base";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import moment from "moment";
import dayjs from 'dayjs';
import { map, isEmpty } from 'lodash'
import { authPage } from '../../middlewares/authorizationPage'
import { editProject, getProjectID } from "../api/project"
import { getListEmployee } from "../api/user-management"
import Cookies from "js-cookie";
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

export default function EditProject(dataToken) {
  const router = useRouter();
  const { id } = router.query
  const dataUser = dataToken.dataToken

  const [form] = Form.useForm()
  const [Loading, setLoading] = useState(false)
  const [dataEmployee, setDataEmployee] = useState([])
  const [flagClassPPI, setFlagClassPPI] = useState("")
  const [flagClassAPI, setFlagClassAPI] = useState("")
  const [idPM, setIdPM] = useState(0)
  const [idField, setIdField] = useState(0)
  const [idDP, setIdDP] = useState(0)
  let today = new Date()
  const dateFormatToday = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate()

  useEffect( () => {
    onDataView()
    onDataEmployee()
  }, [])
  useEffect( () => {
    countShortFal()
    countPPI()
    countAPI()
    countCPI()
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

  // const onDataView = () => {
  //   const dateStart = moment(new Date (form.getFieldValue("fieldworkStart"))).toArray().slice(0,3)
  //   const dateEnd = moment(new Date (form.getFieldValue("fieldworkEnd"))).toArray().slice(0,3)
  //   const dateToday = moment(new Date (dateFormatToday)).toArray().slice(0,3)

  //   var a = moment(dateStart)
  //   var b = moment(dateEnd)
  //   var c = moment(dateToday)
  //   const days = b.diff(a, 'days')
  //   const daysRemain = c.diff(b, 'days')

  //   form.setFieldsValue({
  //     projectName: "Blackhole",
  //     client: "PMI",
  //     backgroundProject: "PMI ingin melakukan survey terhadap responden yang Merokok lebih dari 12 Bulan Terakhir",
  //     targetSample: 600,
  //     methodology: "f2f capi field",
  //     clientService: "innovation",
  //     fieldworkStart: dayjs('2023/01/05', "YYYY/MM/DD"),
  //     fieldworkEnd: dayjs('2023/01/20', "YYYY/MM/DD"),
  //     durationPlanned: days,
  //     projectSpecification: "Pria Umur 22-24 tahun, Merokok minimal 12 batang per hari, Tidak mengikuti survey rokok dalam 12bulan terakhir, SEC Upper 2, Middle 1 dan Middle 2",
  //     achievement: " ",
  //     durationPlan: " ",
  //     sendingDataTabulasi: " ",
  //     picPMT: "",
  //     picField: "",
  //     picDP: "",
  //     statusProject: "open",
  //     remarks: "notes",
  //     achievement: 250,
  //     durationPlan: 10,
  //     sendingDataTabulasi: 6000,
  //     totalRemainingDays: daysRemain,
  //   })
  // }

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
          // methodology: {value: response.data.methodology.toLowerCase(), name: response.data.methodology},
          methodology: response.data.methodology,
          clientService: response.data.client_service,
          fieldworkStart: dayjs(response.data.fw_start, "YYYY/MM/DD"),
          fieldworkEnd: dayjs(response.data.fw_end, "YYYY/MM/DD"),
          durationPlanned: response.data.durasi_planned,
          projectSpecification: response.data.project_specification,
          achievement: response.data.achievement,
          durationPlan: response.data.durasi_plan,
          // sendingDataTabulasi: response.data.sending_data,
          // sendingDataTabulasi: dayjs(response.data.sending_data, "YYYY/MM/DD"),
          statusProject: response.data.status_project,
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

  const countPPI = () => {
    const PPI = parseFloat((form.getFieldValue("durationPlan")/form.getFieldValue("durationPlanned"))*100).toFixed(0)
    if (PPI > 100) {
      setFlagClassPPI("calculate-red")
    } else {
      setFlagClassPPI("calculate-green")
    }
    form.setFieldsValue({
      calculatePPI: PPI
    })
  }

  const countAPI = () => {
    const API = parseFloat((form.getFieldValue("achievement")/form.getFieldValue("targetSample"))*100).toFixed(0)
    if (form.getFieldValue("achievement") < form.getFieldValue("targetSample")) {
      setFlagClassAPI("calculate-yellow")
    } else {
      setFlagClassAPI("calculate-green")
    }
    form.setFieldsValue({
      calculateAPI: API
    })
  }

  const changeDurationPlan = () => {
    countPPI()
  }

  const countCPI = () => {
    const CPI = form.getFieldValue("shortfalAchievement")/form.getFieldValue("totalRemainingDays")
    form.setFieldsValue({
      calculateCPI: CPI
    })
  }

  const countShortFal = () => {
    const shortfal = form.getFieldValue("achievement") - form.getFieldValue("targetSample")
    form.setFieldsValue({
      shortfalAchievement: shortfal
    })
  }

  const changeAchievement = () => {
    countAPI()
    countShortFal()
    countCPI()
  }

  const onDatePlanned = () => {
    if ( isEmpty(form.getFieldValue("fieldworkStart")) || isEmpty(form.getFieldValue("fieldworkEnd")) ) {
      form.setFieldsValue({
        durationPlanned: 0,
      })
    } else {
      const dateStart = moment(new Date (form.getFieldValue("fieldworkStart"))).toArray().slice(0,3)
      const dateEnd = moment(new Date (form.getFieldValue("fieldworkEnd"))).toArray().slice(0,3)
      const dateToday = moment(new Date (dateFormatToday)).toArray().slice(0,3)
      var a = moment(dateStart)
      var b = moment(dateEnd)
      var c = moment(dateToday)
      const days = b.diff(a, 'days')
      const daysRemain = c.diff(b, 'days')
      // console.log(days, "days")
      // console.log(form.getFieldValue("fieldworkStart"), "start");
      // console.log(dateStart, "date");
      form.setFieldsValue({
        durationPlanned: days,
        totalRemainingDays: daysRemain
    })
    }
  }

  const onEditProject = async (values) => {
    try {
      setLoading(true)
      const token = Cookies.get("token")
      let data = new FormData()
      if (dataUser.role === "admin") {
        data.append('project_name', values.projectName)
        data.append('client_name', values.client)
        data.append('background_project', values.backgroundProject)
        data.append('target_sample', parseInt(values.targetSample))
        data.append('methodology', values.methodology)
        data.append('client_service', values.clientService)
        data.append('fw_start', values.fieldworkStart)
        data.append('fw_end', values.fieldworkEnd)
        data.append('durasi_planned', parseInt(values.durationPlanned))
        data.append('project_specification', values.projectSpecification)
        data.append('id_pmt', values.picPMT.name || values.picPMT )
        data.append('total_remaining_days', parseInt(values.totalRemainingDays))
        data.append('status_project', values.statusProject)
      } else if (dataUser.role === "pm") {
        data.append('id_field', values.picField.name || values.picField)
        data.append('id_dp', values.picDP.name || values.picDP)
        data.append('status_project', values.statusProject)
      } else if (dataUser.role === "field") {
        data.append('durasi_plan', parseInt(values.durationPlan))
        data.append('achievement', values.achievement)
        data.append('PPI', parseInt(values.calculatePPI))
        data.append('API', parseInt(values.calculateAPI))
        data.append('CPI', parseInt(values.calculateCPI))
        data.append('shortfall_achievement', parseInt(values.shortfalAchievement))
        data.append('status_project', values.statusProject)
      } else if (dataUser.role === "dp") {
        data.append('sending_data', values.sendingDataTabulasi)
        data.append('remark', values.remarks)
        data.append('status_project', values.statusProject)
      }
      const response = await editProject(id, data, token);
      if (response.status === 200) {
        message.success(
          "Edit Project Berhasil!"
        );
        setTimeout(() => {
          router.push("/project");
        }, 2000)
        setLoading(false)
      }
    } catch (error) {
      // console.log(error, "error")
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
          <span onClick={onProject}>Project</span>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Edit Project</Breadcrumb.Item>
      </Breadcrumb>
        <Card
          title="Edit Project"
          className='project'
        >
          <Form form={form} {...layout} name="nest-messages" autoComplete="off" onFinish={onEditProject}>
            <Form.Item
              name="projectName"
              label="Project Name"
              rules={[
                {
                  type: "name",
                },
              ]}
            >
              <Input placeholder="Input Project Name here" disabled={dataUser.role === "admin" ? false : true}/>
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
              <Input placeholder="Input Client here" disabled={dataUser.role === "admin" ? false : true}/>
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
              <Input.TextArea placeholder="Input Background Project here" rows={4} disabled={dataUser.role === "admin" ? false : true}/>
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
              <Input placeholder="Input Target Sample here" onChange={countShortFal} disabled={dataUser.role === "admin" ? false : true}/>
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
              <Select placeholder="Select Methodology" disabled={dataUser.role === "admin" ? false : true}>
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
              <Select placeholder="Select Innovation" disabled={dataUser.role === "admin" ? false : true}>
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
              <DatePicker format={"DD MMM YYYY"} onChange={onDatePlanned} disabled={dataUser.role === "admin" ? false : true}/>
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
              <DatePicker format={"DD MMM YYYY"} onChange={onDatePlanned} disabled={dataUser.role === "admin" ? false : true}/>
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
              <Input placeholder="Input Duration Planned here" disabled={true} suffix="Days"/>
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
              <Input.TextArea placeholder="Input Project Specification here" rows={4} disabled={dataUser.role === "admin" ? false : true}/>
            </Form.Item>
            {
              dataUser.role === "field" ?
              <>
                <Form.Item
                  name="achievement"
                  label="Achievement"
                  rules={[
                    {
                      type: "achievement",
                    },
                  ]}
                >
                  <Input placeholder="Input Achievement here" onChange={changeAchievement}/>
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
                  <Input placeholder="Input Duration Plan here" onChange={changeDurationPlan} suffix="Days"/>
                </Form.Item>
              </> : ""
            }
            {
              dataUser.role === "dp" ?
              <>
                <Form.Item
                  name="sendingDataTabulasi"
                  label="Sending Data Tabluasi"
                  rules={[
                    {
                      type: "sendingDataTabulasi",
                    },
                  ]}
                >
                  {/* <Input placeholder="Input Sending Data Tabulasi here"/> */}
                  <DatePicker format={"DD MMM YYYY"} />
                </Form.Item>
              </> : ""
            }
            <Form.Item
              name="picPMT"
              label="PIC PMT"
              rules={[
                {
                  type: "picPMT",
                },
              ]}
            >
              <Select disabled={dataUser.role === "admin" ? false : true}>
                {
                  map(filterDataPM, (data, idx) => {
                    return (
                      <Select.Option key={idx} value={data.id}>{data.email}</Select.Option>
                    )
                  })
                }
              </Select>
            </Form.Item>
            {
              dataUser.role === "field" || dataUser.role === "pm" ?
              <>
                <Form.Item
                  name="picField"
                  label="PIC Field"
                  rules={[
                    {
                      type: "picField",
                    },
                  ]}
                >
                  <Select disabled={dataUser.role === "pm" ? false : true}>
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
                  <Select disabled={dataUser.role === "pm" ? false : true}>
                    {
                      map(filterDataDP, (data, idx) => {
                        return (
                          <Select.Option key={idx} value={data.id}>{data.email}</Select.Option>
                        )
                      })
                    }
                  </Select>
                </Form.Item>
              </> : ""
            }
            <Form.Item
              name="statusProject"
              label="Status Project"
              rules={[
                {
                  type: "statusProject",
                },
              ]}
            >
              <Select placeholder="Select Status Project">
                <Select.Option value="start">Start</Select.Option>
                <Select.Option value="on going fieldwork">On going fieldwork</Select.Option>
                <Select.Option value="fieldwork end">Fieldwork end</Select.Option>
                <Select.Option value="send tabulasi">Send Tabulasi</Select.Option>
                <Select.Option value="close">Close</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="totalRemainingDays"
              label="Total Remaining Days"
              rules={[
                {
                  type: "totalRemainingDays",
                },
              ]}
            >
              <Input placeholder="Input Total Remaining Days here" disabled={true} suffix="Days"/>
            </Form.Item>
            {
              dataUser.role === "field" ?
              <>
                <Form.Item
                  name="calculatePPI"
                  label="Calculate PPI"
                  rules={[
                    {
                      type: "calculatePPI",
                    },
                  ]}
                >
                  <Input placeholder="Input Calculate PPI here" disabled={true} className={flagClassPPI} suffix="%"/>
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
                  <Input placeholder="Input Calculate API here" disabled={true} className={flagClassAPI} suffix="%"/>
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
                  <Input placeholder="Input Calculate CPI here" disabled={true} className="calculate-green"/>
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
                  <Input placeholder="Input Shortfal Achievement here" disabled={true}/>
                </Form.Item>
              </> : ""
            }
            {
              dataUser.role === "field" || dataUser.role === "dp" ?
              <>
                <Form.Item
                  name="remarks"
                  label="Remarks"
                  rules={[
                    {
                      type: "remarks",
                    },
                  ]}
                >
                  <Input placeholder="Input Remarks here"/>
                </Form.Item>
              </> : ""
            }
            <Form.Item
              wrapperCol={{
                ...layout.wrapperCol,
                offset: 8,
              }}
            >
              <Button type="primary" htmlType="submit" className="button-footer-form-side" loading={Loading}>
                Save
              </Button>
              <Button onClick={onProject} loading={Loading}>
                Cancel
              </Button>
            </Form.Item>
          </Form>
        </Card>
    </LayoutBase>
  );
}
