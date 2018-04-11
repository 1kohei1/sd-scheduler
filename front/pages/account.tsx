import * as React from 'react';
import Link from 'next/link';
import ObjectID from 'bson-objectid';
import { Form, Icon, Input, Button, Alert, message } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';

import AppLayout from '../components/AppLayout';
import FormLayout from '../components/FormLayout';
import UserUtil from '../utils/UserUtil';
import Faculty from '../models/Faculty';
import InitialProps from '../models/InitialProps';
import Api from '../utils/Api';
import Loading from '../components/Loading';

export interface AccountProps {
  form: WrappedFormUtils;
}

interface AccountState {
  err: string;
  loading: boolean;
  updating: boolean;
  user: Faculty | undefined; // It's not recommended to hold props as state, but didn't come up with a good way.
}

class Account extends React.Component<AccountProps, AccountState> {
  userUpdateKey = `Account_${new Date().toISOString()}`;

  static async getInitialProps(context: InitialProps) {
    await UserUtil.checkAuthentication(context);
    return {};
  }

  constructor(props: AccountProps) {
    super(props)

    this.state = {
      err: '',
      updating: false,
      loading: true,
      user: undefined,
    }

    UserUtil.registerOnUserUpdates(this.userUpdateKey, this.setUser.bind(this));

    this.handleSubmit = this.handleSubmit.bind(this);
    this.form = this.form.bind(this);
    this.sendVerify = this.sendVerify.bind(this);
  }

  componentWillUnmount() {
    UserUtil.removeOnUserUpdates(this.userUpdateKey);
  }

  private async setUser(user: Faculty | undefined) {
    this.setState({
      user,
      updating: false,
      loading: false,
    });
  }

  handleSubmit(e: React.FormEvent<any>) {
    e.preventDefault();

    this.props.form.validateFields(async (err, values) => {
      if (err) {
        return
      }
      if (this.state.user) {
        this.setState({
          err: '',
          updating: true,
        });
        if (this.state.user && values.email !== this.state.user.email) {
          values.emailVerified = false;
        }
        try {
          await Api.updateFaculty(this.state.user._id, values);
          // By calling this, all components using login user gets updated user.
          UserUtil.updateUser();
          message.success('Your account information is successfully updated');
          // Show this message only when email changes
          if (values.emailVerified === false) {
            message.success('Verification email is queued in the system');
          }
        } catch (err) {
          this.setState({
            updating: false,
            err: err.message,
          })
        }
      } else {
        this.setState({
          err: 'Unexpected thing happens. Please logout and login',
        })
      }
    })
  }

  async sendVerify(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();

    this.setState({
      updating: true,
    })
    try {
      if (this.state.user) {
        await Api.sendVerify(this.state.user._id);
        message.success('Verification email is queued in the system');
        this.setState({
          updating: false,
        });
      } else {
        this.setState({
          err: 'Unexpected thing happens. Please logout and login',
          updating: false,
        })
      }
    } catch (err) {
      this.setState({
        err: err.message,
        updating: false,
      })
    }
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
        <Form.Item
          label="Email"
        >
          {getFieldDecorator('email', {
            rules: [{
              required: true,
              message: 'Please enter email',
            }, {
              type: 'email',
              message: 'Please enter valid email',
            }],
            initialValue: this.state.user ? this.state.user.email : '',
          })(
            <Input placeholder="Email" />
          )}
        </Form.Item>
        <Form.Item>
          {this.state.user && this.state.user.emailVerified ? (
            <div>
              <Icon type="check-circle-o" style={{ marginRight: '8px' }} />
              Email is verified.
            </div>
          ) : (
              <div>
                <Icon type="exclamation-circle-o" style={{ marginRight: '8px' }} />
                Email is not verified yet.&nbsp;
                <a href="" onClick={this.sendVerify}>
                  Send verification email
                </a>
              </div>
            )}
          <div>
            <Icon type="lock" style={{ marginRight: '8px', fontSize: '16px' }} />
            Forgot password?&nbsp;
            <Link href="/password">
              <a>Reset password</a>
            </Link>
          </div>
        </Form.Item>
        <Form.Item>
          <Button
            htmlType="submit"
            type="primary"
            size="large"
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
        <FormLayout>
          <h1>Account</h1>
          {this.state.err && (
            <Alert
              message={this.state.err}
              type="error"
            />
          )}
          {this.state.loading ? <Loading /> : this.form()}
        </FormLayout>
      </AppLayout>
    );
  }
}

export default Form.create()(Account);