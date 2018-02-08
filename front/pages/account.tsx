import * as React from 'react';
import Link from 'next/link';
import { Form, Icon, Input, Button, Alert, Tooltip, message } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';

import AppLayout from '../components/AppLayout';
import UserUtil from '../utils/UserUtil';
import Faculty from '../models/Faculty';
import InitialProps from '../models/InitialProps';

export interface AccountProps {
  form: WrappedFormUtils;
  user: Faculty;
}

interface AccountState {
  error: string;
  updating: boolean;
  user: Faculty; // It's not recommended to hold props as state, but didn't come up with a good way.
}

class Account extends React.Component<AccountProps, AccountState> {
  userUpdateKey = `Account_${new Date().toISOString()}`;

  static async getInitialProps(context: InitialProps) {
    // Check the authentication only when getInitialProps is executed on the client side.
    // When this is executed on the server side, it's already handled by custom-routes.ts
    if (!context.req) {
      await UserUtil.checkAuthentication();
    }

    const user = await UserUtil.getUser();

    return {
      user,
    };
  }

  constructor(props: AccountProps) {
    super(props)

    this.state = {
      error: '',
      updating: false,
      user: this.props.user,
    }

    UserUtil.registerOnUserUpdates(this.userUpdateKey, this.setUser.bind(this));

    this.handleSubmit = this.handleSubmit.bind(this);
    this.form = this.form.bind(this);
    this.addEmail = this.addEmail.bind(this);
    this.deleteEmail = this.deleteEmail.bind(this);
  }

  componentWillUnmount() {
    UserUtil.removeOnUserUpdates(this.userUpdateKey);
  }

  private async setUser(user: Faculty) {
    this.setState({
      user,
    });
  }

  addEmail() {
    this.setState((prevState: AccountState, props: AccountProps) => {
      prevState.user.emails.push('');
      return {
        user: prevState.user,
      }
    })
  }

  deleteEmail(index: number) {
    this.setState((prevState: AccountState, props: AccountProps) => {
      prevState.user.emails.splice(index, 1);
      return {
        user: prevState.user,
      }
    })
  }

  async handleSubmit() {

  }

  form() {
    const { getFieldDecorator } = this.props.form;

    return (
      <Form onSubmit={this.handleSubmit}>
        <Form.Item
          label="First name"
        >
          {getFieldDecorator('firstName', {
            rules: [{
              required: true,
              message: 'Please enter first name',
            }],
            initialValue: this.state.user.firstName,
          })(
            <Input placeholder="First name" />
          )}
        </Form.Item>
        <Form.Item
          label="Last name"
        >
          {getFieldDecorator('lastName', {
            rules: [{
              required: true,
              message: 'Please enter last name',
            }],
            initialValue: this.state.user.lastName,
          })(
            <Input placeholder="Last name" />
          )}
        </Form.Item>
        {this.state.user.emails.map((email: string, index: number) => (
          <div key={index}>
            <Form.Item
              label={index === 0 ? "Email" : null}
            >
              {getFieldDecorator(`emails[${index}]`, {
                rules: [{
                  required: true,
                  message: 'Please enter last name',
                }, {
                  type: 'email',
                  message: 'Please enter valid email',
                }],
                initialValue: email,
              })(
                <Input placeholder="Email" style={{ width: '460px' }} />
              )}
              <Button
                icon="delete"
                shape="circle"
                disabled={this.state.user.emails.length <= 1}
                style={{ marginLeft: '8px' }}
                onClick={(e) => this.deleteEmail(index)}
              />
            </Form.Item>
          </div>
        ))}
        <Form.Item>
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <Button
              type="dashed"
              onClick={this.addEmail}
              style={{ width: '200px', marginRight: '8px' }}
            >
              <Icon type="plus" /> Add new email
          </Button>
            <div>
              <Tooltip title="We will send emails to all your email addresses">
                <Icon type="question-circle-o" style={{ fontSize: '24px', color: 'rgba(0, 0, 0, 0.5)' }} />
              </Tooltip>
            </div>
          </div>
        </Form.Item>
        <Form.Item>
          <Button
            htmlType="submit"
            type="primary"
            loading={this.state.updating}
            style={{ width: '100%' }}
          >
            Update
        </Button>
        </Form.Item>
        <div style={{ textAlign: 'center' }}>
          <Link href="/dashboard">
            <a>Go back to dashboard</a>
          </Link>
        </div>
      </Form>
    )
  }

  render() {
    return (
      <AppLayout>
        <div className="account-wrapper">
          {this.state.error && (
            <Alert
              message={this.state.error}
              type="error"
            />
          )}
          {this.form()}
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