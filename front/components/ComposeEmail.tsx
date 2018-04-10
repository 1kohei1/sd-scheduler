import * as React from 'react';
import { Row, Col, Table, Button, Tooltip, Icon, Input, Tag, Collapse, message } from 'antd';

import Faculty from '../models/Faculty';
import Api from '../utils/Api';

export interface ComposeEmailProps {
  faculties: Faculty[];
  terms: {
    key: string;
    link: string;
  }[];
  onErr: (err: string) => void;
  showPreview: (subject: string, content: string) => void;
}

interface ComposeEmailState {
  selectedFacultyIds: string[];
  modalVisible: boolean;
  sending: boolean;
}

export default class ComposeEmail extends React.Component<ComposeEmailProps, ComposeEmailState> {
  constructor(props: ComposeEmailProps) {
    super(props);

    this.state = {
      selectedFacultyIds: [],
      modalVisible: false,
      sending: false,
    }

    this.rowSelection = this.rowSelection.bind(this);
    this.preview = this.preview.bind(this);
    this.getLink = this.getLink.bind(this);
    this.exampleDataSource = this.exampleDataSource.bind(this);
    this.send = this.send.bind(this);
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
      },
      getCheckboxProps: () => ({
        disabled: this.state.sending,
      }),
    }
  }

  termsColumns() {
    return [{
      title: 'Link constant',
      dataIndex: 'key'
    }, {
      title: 'Replaced with this link',
      dataIndex: 'link',
      render: (value: string) => (
        <a href={value} target="_blank">{value}</a>
      )
    }]
  }

  getLink(key: string) {
    const index = this.props.terms.findIndex(term => term.key === key);

    if (index >= 0) {
      return this.props.terms[index].link;
    } else {
      return 'undefined';
    }
  }

  exampleDataSource() {
    return [{
      key: '1',
      content: 'Please set the password at <PASSWORD></PASSWORD>',
      renderedContent: (
        <span>Please set the password at <a href={this.getLink('PASSWORD')} target="_blank">{this.getLink('PASSWORD')}</a></span>
      )
    }, {
      key: '2',
      content: 'Please fill the available time at <DASHBOARD_CALENDAR>this link</DASHBOARD_CALENDAR>',
      renderedContent: (
        <span>Please fill the available time at <a href={this.getLink('DASHBOARD_CALENDAR')}>this link</a></span>
      )
    }]
  }

  exampleTableColumns() {
    return [{
      title: 'Text in content',
      dataIndex: 'content',
      width: '50%',
    }, {
      title: 'Converted to',
      dataIndex: 'renderedContent',
      width: '50%',
    }]
  }

  preview(e: React.MouseEvent<any>) {
    e.preventDefault();
    const subject = (document.getElementById('subject') as HTMLInputElement).value;
    const content = (document.getElementById('content') as HTMLTextAreaElement).value;
    this.props.showPreview(subject, content);
  }

  async send(e: React.MouseEvent<any>) {
    e.preventDefault();

    if (this.state.selectedFacultyIds.length === 0) {
      message.error('Please select faculties to send the email');
      return;
    }

    const to = this.state.selectedFacultyIds
      .map((_id: string) => {
        const faculty = this.props.faculties.find(faculty => faculty._id === _id) as Faculty;
        return faculty.email;
      });

    const subject = (document.getElementById('subject') as HTMLInputElement).value;
    const content = (document.getElementById('content') as HTMLTextAreaElement).value;
    if (!subject || !content) {
      message.error('Please fill both subject and content');
      return;
    }

    this.setState({
      sending: true,
    })
    const body = {
      to,
      title: subject,
      content,
    }
    
    try {
      await Api.sendAdminemail(body);
      (document.getElementById('subject') as HTMLInputElement).value = '';
      (document.getElementById('content') as HTMLTextAreaElement).value = '';
      message.success('Successfully sent email');
      this.setState({
        sending: false,
      });
    } catch (err) {
      this.props.onErr(err.message);
      this.setState({
        sending: false,
      })
    }
  }

  render() {
    return (
      <Row gutter={8}>
        <Col
          span={24}
          md={12}
        >
          <p>Select faculties to send emails.</p>
          <Table
            dataSource={this.props.faculties}
            rowSelection={this.rowSelection()}
            columns={this.tableColumns()}
            pagination={false}
            rowKey="_id"
          />
        </Col>
        <Col
          span={24}
          md={12}
        >
          <p>Compose email</p>
          <div className="section" style={{ paddingBottom: 0, paddingTop: 0 }}>
            To:&nbsp;{this.state.selectedFacultyIds.map((_id: string) => {
              const faculty = this.props.faculties.find(faculty => faculty._id === _id) as Faculty;
              return <Tag
                key={_id}
                style={{ marginBottom: '8px' }}
              >
                Dr. {faculty.firstName} {faculty.lastName} &lt;{faculty.email}&gt;
              </Tag>
            })}
          </div>
          <div className="section">
            <Input id="subject" placeholder="Subject" disabled={this.state.sending} />
          </div>
          <div className="section">
            <Input.TextArea id="content" rows={10} placeholder="Content" disabled={this.state.sending} />
          </div>
          <div className="section action">
            <Button
              type="primary"
              style={{ marginRight: '8px' }}
              onClick={this.send}
              disabled={this.state.sending}
            >
              Send
            </Button>
            <a
              href=""
              onClick={this.preview}
            >
              Check preview
            </a>
          </div>
          <div className="section">
            <Collapse>
              <Collapse.Panel key="one" header="How to insert links?">
                <div>
                  <p>The system will replace <code>&lt;LINK_CONSTANTS&gt;&lt;/LINK_CONSTANTS&gt;</code> to corresponding links specified below. Please check exampls. You can check how the email looks like by clicking "Check preview"</p>
                  <Table
                    dataSource={this.props.terms}
                    columns={this.termsColumns()}
                    rowClassName={() => "no-background-color-row"}
                    pagination={false}
                    rowKey="key"
                  />
                  <h3>Examples</h3>
                  <Table
                    dataSource={this.exampleDataSource()}
                    columns={this.exampleTableColumns()}
                    rowClassName={() => "no-background-color-row"}
                    pagination={false}
                    rowKey="key"
                  />
                </div>
              </Collapse.Panel>
            </Collapse>
          </div>
        </Col>
        <style jsx>{`
          .section {
            padding: 8px;
          }
          .action {
            display: flex;
            justify-content: space-between;
            line-height: 32px;
          }        
        `}
        </style>
        <style>{`
          .no-background-color-row:hover td {
            background-color: transparent !important;
          }
        `}</style>
      </Row>
    );
  }
}
