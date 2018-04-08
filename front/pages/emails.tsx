import * as React from 'react';
import { List } from 'immutable';
import { Row, Col, Table, Button, Tooltip, Icon, Input, Tag } from 'antd';

import AppLayout from '../components/AppLayout';
import InitialProps from '../models/InitialProps';
import Api from '../utils/Api';
import Loading from '../components/Loading';
import UserUtil from '../utils/UserUtil';
import Faculty from '../models/Faculty';
import AdminEmailHelpModal from '../components/AdminEmailHelpModal';

export interface EmailsProps {
}

interface EmailsState {
  loading: boolean;
  faculties: Faculty[];
  errs: List<string>;
  selectedFacultyIds: string[];
  helpDialog: boolean;
  previewDialog: boolean;
}

export default class Emails extends React.Component<EmailsProps, EmailsState> {
  static async getInitialProps(context: InitialProps) {
    await UserUtil.checkAuthentication(context);
    return {};
  }

  constructor(props: EmailsProps) {
    super(props);

    this.state = {
      loading: true,
      faculties: [],
      errs: List<string>(),
      selectedFacultyIds: [],
      helpDialog: false,
      previewDialog: false,
    }

    this.rowSelection = this.rowSelection.bind(this);
  }

  componentDidMount() {
    this.getFaculties();
  }

  onErr(err: string) {
    this.setState((prevState: EmailsState, props: EmailsProps) => {
      return {
        errs: prevState.errs.push(err),
        loading: false,
      };
    });
  }

  private async getFaculties() {
    try {
      const faculties = await Api.getFaculties();
      this.setState({
        faculties,
        loading: false,
      });
    } catch (err) {
      this.onErr(err.message);
    }
  }

  tableColumns() {
    return [{
      title: 'Name',
      dataIndex: 'firstName',
      render: (value: string, faculty: Faculty, index: number) => (
        <span>Dr. {faculty.firstName} {faculty.lastName}</span>
      )
    }, {
      title: 'Email',
      dataIndex: 'email',
    }, {
      title: (
        <div>
          Active&nbsp;
          <Tooltip
            title="When faculty is active, students can select the faculty for the presentation. If faculty leaves UCF, please turn this switch off."
          >
            <Icon type="question-circle-o" style={{ fontSize: '14px' }} />
          </Tooltip>
        </div>
      ),
      dataIndex: 'isActive',
      render: (value: boolean, faculty: Faculty, index: number) => (
        value ? <Icon type="check" style={{ fontSize: '20px' }} /> : null
      )
    }, {
      title: 'Is password set',
      dataIndex: 'password_at',
      render: (value: boolean) => (
        <div>
          {value ? (
            <Icon type="check" style={{ fontSize: '20px' }} />
          ) : (
              <span></span>
            )}
        </div>
      ),
    }]
  }

  rowSelection() {
    return {
      onChange: (selectedRowKeys: string[]) => {
        this.setState({
          selectedFacultyIds: selectedRowKeys,
        })
      }
    }
  }

  toggleDialog(e: React.MouseEvent<any>, prop: 'helpDialog' | 'previewDialog', value: boolean) {
    e.preventDefault();
    const newState: any = {};
    newState[prop] = value;
    this.setState(newState);
  }

  render() {
    return (
      <AppLayout
        selectedMenu={['emails']}
      >
        <AdminEmailHelpModal
          visible={this.state.helpDialog}
          onClose={e => this.toggleDialog(e, 'helpDialog', false)}
        />
        <div className="container">
          <h1>Emails</h1>
          <Row gutter={8}>
            <Col
              span={24}
              md={12}
            >
              <p>Select faculties to send emails.</p>
              {this.state.loading ? <Loading /> : (
                <Table
                  dataSource={this.state.faculties}
                  rowSelection={this.rowSelection()}
                  columns={this.tableColumns()}
                  rowKey="_id"
                />
              )}
            </Col>
            <Col
              span={24}
              md={12}
            >
              <p>Compose email</p>
              <div className="section" style={{ paddingBottom: 0, paddingTop: 0 }}>
                To:&nbsp;{this.state.selectedFacultyIds.map((_id: string) => {
                  const faculty = this.state.faculties.find(faculty => faculty._id === _id) as Faculty;
                  return <Tag
                    key={_id}
                    style={{ marginBottom: '8px' }}
                  >
                    Dr. {faculty.firstName} {faculty.lastName} &lt;{faculty.email}&gt;
                    </Tag>
                })}
              </div>
              <div className="section">
                <Input placeholder="Subject" />
              </div>
              <div className="section">
                <Input.TextArea rows={10} placeholder="Content" />
              </div>
              <div className="section action">
                <div>
                  <Button
                    type="primary"
                    style={{ marginRight: '8px' }}
                  >
                    Send
                </Button>
                  <a
                    href=""
                    onClick={e => this.toggleDialog(e, 'helpDialog', true)}
                  >
                    How to insert link?
                  </a>
                </div>
                <a
                  href=""
                  onClick={e => this.toggleDialog(e, 'previewDialog', true)}>
                  >
                    Check preview
                </a>
              </div>
            </Col>
          </Row>
        </div>
        <style jsx>
          {`
          .container {
            padding: 32px;
          }
          .section {
            padding: 8px;
          }
          .action {
            display: flex;
            justify-content: space-between;
          }
        `}
        </style>
      </AppLayout>
    );
  }
}
