import * as React from 'react';
import { Row, Col, Table, Button, Tooltip, Icon, Input, Tag } from 'antd';

import Faculty from '../models/Faculty';
import AdminEmailHelpModal from '../components/AdminEmailHelpModal';

export interface ComposeEmailProps {
  faculties: Faculty[];
  onErr: (err: string) => void;
  showPreview: (subject: string, content: string) => void;
}

interface ComposeEmailState {
  selectedFacultyIds: string[];
  modalVisible: boolean;
}

export default class ComposeEmail extends React.Component<ComposeEmailProps, ComposeEmailState> {
  constructor(props: ComposeEmailProps) {
    super(props);

    this.state = {
      selectedFacultyIds: [],
      modalVisible: false,
    }

    this.rowSelection = this.rowSelection.bind(this);
    this.displayHelpModal = this.displayHelpModal.bind(this);
    this.onClose = this.onClose.bind(this);
    this.preview = this.preview.bind(this);
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

  displayHelpModal(e: React.MouseEvent<any>) {
    e.preventDefault();

    this.setState({
      modalVisible: true,
    })
  }

  onClose(e: React.MouseEvent<any>) {
    e.preventDefault();

    this.setState({
      modalVisible: false,
    })
  }

  preview(e: React.MouseEvent<any>) {
    e.preventDefault();
    const subject = (document.getElementById('subject') as HTMLInputElement).value;
    const content = (document.getElementById('content') as HTMLTextAreaElement).value;
    this.props.showPreview(subject, content);
  }

  render() {
    return (
      <Row gutter={8}>
        <AdminEmailHelpModal
          visible={this.state.modalVisible}
          onClose={this.onClose}
        />
        <Col
          span={24}
          md={12}
        >
          <p>Select faculties to send emails.</p>
          <Table
            dataSource={this.props.faculties}
            rowSelection={this.rowSelection()}
            columns={this.tableColumns()}
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
            <Input id="subject" placeholder="Subject" />
          </div>
          <div className="section">
            <Input.TextArea id="content" rows={10} placeholder="Content" />
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
                onClick={this.displayHelpModal}
              >
                How to insert link?
              </a>
            </div>
            <a
              href=""
              onClick={this.preview}
            >
              Check preview
            </a>
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
      </Row>
    );
  }
}
