import * as React from 'react';
import { Form, Icon, Input, Button, Alert, message } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';

import AppLayout from '../components/AppLayout';
import UserUtil from '../utils/UserUtil';
import Faculty from '../models/Faculty';
import InitialProps from '../models/InitialProps';

export interface AccountProps {
  form: WrappedFormUtils
}

interface AccountSttate {
  error: string;
  loading: boolean;
  user: Faculty;
}

class Account extends React.Component<AccountProps, any> {
  static async getInitialProps(context: InitialProps) {
    // Check the authentication only when getInitialProps is executed on the client side.
    // When this is executed on the server side, it's already handled by custom-routes.ts
    if (!context.req) {
      await UserUtil.checkAuthentication();
    }

    return {};
  }

  constructor(props: AccountProps) {
    super(props)

    this.state = {
      error: '',
      loading: false,
      user: undefined,
    }

    this.setUser();

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  private async setUser() {
    const user = await UserUtil.getUser();
    this.setState({
      user,
    });
  }

  async handleSubmit() {

  }

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <AppLayout>
        <div className="account-wrapper">
          {this.state.message && (
            <Alert
              message={this.state.message}
              type="error"
            />
          )}
          <Form onSubmit={this.handleSubmit}>

            <Form.Item>
              <Button
                htmlType="submit"
                type="primary"
                loading={this.state.loading}
              >
                Update
            </Button>
            </Form.Item>
          </Form>
        </div>
        <style jsx>{`
          .account-wrapper {
            max-width: 500px;
            margin: auto;
            margin-top: 100px;
          }
        `}</style>
      </AppLayout>
    );
  }
}

export default Form.create()(Account);