import * as React from 'react';
import { Modal, Alert, Table } from 'antd';

import Api from '../utils/Api';
import Loading from './Loading';

export interface AdminEmailHelpModalProps {
  visible: boolean;
  onClose: (e: React.MouseEvent<any>) => void;
}

interface AdminEmailHelpModalState {
  loading: boolean;
  terms: {
    key: string;
    link: string;
  }[];
  err: string;
}

export default class AdminEmailHelpModal extends React.Component<AdminEmailHelpModalProps, AdminEmailHelpModalState> {
  constructor(props: AdminEmailHelpModalProps) {
    super(props);

    this.state = {
      loading: true,
      terms: [],
      err: '',
    }

    this.getLink = this.getLink.bind(this);
    this.exampleDataSource = this.exampleDataSource.bind(this);
  }

  async componentDidMount() {
    try {
      const terms = await Api.getTerms();
      this.setState({
        loading: false,
        terms,
      });
    } catch (err) {
      this.setState({
        loading: false,
        err: err.message,
      })
    }
  }

  tableColumns() {
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
    const index = this.state.terms.findIndex(term => term.key === key);

    if (index >= 0) {
      return this.state.terms[index].link;
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

  render() {
    return (
      <Modal
        title="How to insert link?"
        visible={this.props.visible}
        width={700}
        onOk={this.props.onClose}
        onCancel={this.props.onClose}
      >
        {this.state.loading ? <Loading /> : (
          this.state.err ? (
            <Alert
              type="error"
              message={this.state.err}
            />
          ) : (
              <div>
                <p>The system will replace <code>&lt;LINK_CONSTANTS&gt;&lt;/LINK_CONSTANTS&gt;</code> to corresponding links specified below. Please check exampls.</p>
                <Table
                  dataSource={this.state.terms}
                  columns={this.tableColumns()}
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
                <div>You can also check how your content will be displayed in the email by clicking "Check preview" at the right bottom of the email.</div>
              </div>
            )
        )}
        <style>{`
          .no-background-color-row:hover td {
            background-color: transparent !important;
          }
        `}</style>
      </Modal>
    );
  }
}
