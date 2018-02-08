import * as React from 'react';
import Link from 'next/link';
import ObjectID from 'bson-objectid';
import { Form, Icon, Input, Button, Alert, Tooltip, message } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';

import AppLayout from '../components/AppLayout';
import UserUtil from '../utils/UserUtil';
import Faculty from '../models/Faculty';
import InitialProps from '../models/InitialProps';
import Api from '../utils/Api';

export interface AccountProps {
  form: WrappedFormUtils;
}

interface AccountState {
  error: string;
  updating: boolean;
  user: Faculty | undefined; // It's not recommended to hold props as state, but didn't come up with a good way.
}

class Account extends React.Component<AccountProps, AccountState> {
  userUpdateKey = `Account_${new Date().toISOString()}`;

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
      updating: false,
      user: undefined,
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
      updating: false,
    });
  }

  addEmail() {
    this.setState((prevState: AccountState, props: AccountProps) => {
      if (prevState.user) {
        prevState.user.emails.push('');
      }
      return {
        user: prevState.user,
      }
    })
  }

  deleteEmail(index: number) {
    this.setState((prevState: AccountState, props: AccountProps) => {
      if (prevState.user) {
        prevState.user.emails.splice(index, 1);
      }
      return {
        user: prevState.user,
      }
    })
  }

  handleSubmit(e: React.FormEvent<any>) {
    e.preventDefault();

    this.props.form.validateFields(async (err, values) => {
      if (err) {
        console.log(err);
      } else if (this.state.user) {
        this.setState({
          updating: true,
        });
        try {
          await Api.updateFaculty(this.state.user._id, values);
          // By calling this, all components using login user gets updated user.
          UserUtil.updateUser();
          message.success('Your account information is successfully updated');
        } catch (err) {
          this.setState({
            updating: false,
            error: err.message,
          })
        }
      }
    })
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
            initialValue: this.state.user ? this.state.user.firstName : '',
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
            initialValue: this.state.user ? this.state.user.lastName : '',
          })(
            <Input placeholder="Last name" />
          )}
        </Form.Item>
        {this.state.user && this.state.user.emails.map((email: string, index: number) => (
          <div key={index}>
            <Form.Item
              label={index === 0 ? "Email" : null}
            >
              {getFieldDecorator(`emails[${index}]`, {
                rules: [{
                  required: true,
                  message: 'Please enter email',
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
                disabled={this.state.user && this.state.user.emails.length <= 1}
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