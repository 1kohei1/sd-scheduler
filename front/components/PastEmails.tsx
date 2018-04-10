import * as React from 'react';
import { Table, Button, Input } from 'antd';

import Api from '../utils/Api';
import Faculty from '../models/Faculty';
import Email from '../models/Email';
import DatetimeUtil from '../utils/DatetimeUtil';
import { DateConstants } from '../models/Constants';

export interface PastEmailsProps {
  user: Faculty;
  faculties: Faculty[];
  onErr: (err: string) => void;
  showPreview: (subject: string, content: string) => void;
}

interface PastEmailsState {
  loading: boolean;
  emails: Email[];
}

export default class PastEmails extends React.Component<PastEmailsProps, PastEmailsState> {
  constructor(props: PastEmailsProps) {
    super(props);

    this.state = {
      loading: false,
      emails: [],
    }

    this.getEmails = this.getEmails.bind(this);
  }

  componentDidMount() {
    this.getEmails();
  }

  async getEmails() {
    this.setState({
      loading: true,
    });

    try {
      const emails = await Api.getEmails(`sent_by=${this.props.user._id}`) as Email[];
      this.setState({
        loading: false,
        emails,
      })
    } catch (err) {
      this.props.onErr(err.message);
      this.setState({
        loading: false,
      })
    }
  }

  tableColumn() {
    return [{
      title: 'Sent at',
      dataIndex: 'created_at',
      render: (value: string) => (
        <span>{DatetimeUtil.formatISOString(value, `${DateConstants.dateFormat} ${DateConstants.hourMinFormat}`)}</span>
      ),
    }, {
      title: 'Subject',
      dataIndex: 'extra.title',
      render: (title: string) => `[SD Scheduler] ${title}`,
    }, {
      title: 'To',
      dataIndex: 'to',
      render: (value: string[]) => (
        <div>
          {value
            .map(email => {
              const faculty = this.props.faculties.find(faculty => faculty.email === email);
              if (faculty) {
                return `Dr. ${faculty.firstName} ${faculty.lastName}`;
              } else {
                return email;
              }
            })
            .join(', ')
          }
        </div>
      )
    }, {
      title: 'Preview',
      dataIndex: 'updated_at',
      render: (value: string, email: Email) => (
        <a onClick={e => this.props.showPreview(email.extra.title, email.extra.content)}>Preview</a>
      )
    }]
  }

  expandedRowRender(email: Email) {
    return (
      <Input.TextArea
        value={email.extra.content}
        rows={10}
      />
    )
  }

  render() {
    return (
      <div>
        <p>
          <Button
            onClick={this.getEmails}
          >Reload</Button>
        </p>
        <Table
          loading={this.state.loading}
          dataSource={this.state.emails}
          columns={this.tableColumn()}
          expandedRowRender={this.expandedRowRender}
          pagination={false}
          rowKey="_id"
        />
      </div>
    );
  }
}
