import * as React from 'react';
import { List } from 'immutable';
import { Tabs, Alert } from 'antd';

import AppLayout from '../components/AppLayout';
import InitialProps from '../models/InitialProps';
import Api from '../utils/Api';
import UserUtil from '../utils/UserUtil';
import Faculty from '../models/Faculty';
import Loading from '../components/Loading';
import ComposeEmail from '../components/ComposeEmail';
import PastEmails from '../components/PastEmails';
import EmailPreviewModalProps from '../components/EmailPreviewModal';

export interface EmailsProps {
}

interface EmailsState {
  loading: boolean;
  faculties: Faculty[];
  errs: List<string>;
  previewModal: boolean;
  previewSubject: string;
  previewContent: string;
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
      previewModal: false,
      previewSubject: '',
      previewContent: '',
    }

    this.showPreview = this.showPreview.bind(this);
    this.onClose = this.onClose.bind(this);
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

  showPreview(subject: string, content: string) {
    this.setState({
      previewModal: true,
      previewSubject: subject,
      previewContent: content,
    });
  }

  onClose(e: React.MouseEvent<any>) {
    e.preventDefault();
    this.setState({
      previewModal: false,
    });
  }

  render() {
    return (
      <AppLayout
        selectedMenu={['emails']}
      >
        <EmailPreviewModalProps
          visible={this.state.previewModal}
          subject={this.state.previewSubject}
          content={this.state.previewContent}
          onClose={this.onClose}
        />
        <div className="container">
          <h1>Emails</h1>
          {this.state.errs.map((err: string, index: number) => {
            <Alert 
              key={index}
              type="error"
              showIcon
              message="Error"
              description={err}
            />
          })}
          <Tabs defaultActiveKey="compose">
            <Tabs.TabPane tab="Compose email" key="compose">
              {this.state.loading ? <Loading /> :
                <ComposeEmail
                  faculties={this.state.faculties}
                  onErr={this.onErr}
                  showPreview={this.showPreview}
                />
              }
            </Tabs.TabPane>
            <Tabs.TabPane tab="Past emails" key="emails">
              <PastEmails
                faculties={this.state.faculties}
              />
            </Tabs.TabPane>
          </Tabs>
        </div>
        <style jsx>
          {`
          .container {
            padding: 32px;
          }
        `}
        </style>
      </AppLayout>
    );
  }
}
