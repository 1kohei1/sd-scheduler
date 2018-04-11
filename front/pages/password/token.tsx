import * as React from 'react';
import Link from 'next/link';
import { Form, Icon, Input, Button, Alert } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';

import AppLayout from '../../components/AppLayout';
import FormLayout from '../../components/FormLayout';
import InitialProps from '../../models/InitialProps';
import Api from '../../utils/Api';

export interface TokenProps {
  form: WrappedFormUtils;
  token: string;
  _id: string;
}

interface TokenState {
  err: string;
  message: string;
  loading: boolean;
  confirmDirty: boolean;
}

class Token extends React.Component<TokenProps, TokenState> {
  static async getInitialProps(context: InitialProps) {
    // Check if token is valid or not. If not valid, API redirects to /password
    const token = context.query.token;
    const faculties = await Api.getFaculties(`token=${token}`);

    if (faculties.length === 0 || new Date(faculties[0]).valueOf() < new Date().valueOf()) {
      Api.redirect(context, '/password', {
        err: 'Token has expired. Please send another password reset email',
      });
      return {};
    }
    return {
      token,
      _id: faculties[0]._id,
    };
  }

  constructor(props: TokenProps) {
    super(props);

    this.state = {
      err: '',
      message: '',
      loading: false,
      confirmDirty: false,
    }

    this.handleSubmit = this.handleSubmit.bind(this);
    this.checkPassword = this.checkPassword.bind(this);
    this.checkConfirm = this.checkConfirm.bind(this);
    this.handleConfirmBlur = this.handleConfirmBlur.bind(this);
  }

  checkPassword(rule: any, value: any, callback: any) {
    if (value && value.length >= 6 && value !== this.props.form.getFieldValue('password')) {
      callback('Passwords do not match');
    } else {
      callback();
    }
  }

  checkConfirm(rule: any, value: any, callback: any) {
    if (value && this.state.confirmDirty) {
      this.props.form.validateFields(['confirm'], { force: true }, () => {});
    }
    callback();
  }

  handleConfirmBlur(e: React.FormEvent<HTMLInputElement>) {
    const value = (e.target as HTMLInputElement).value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  }

  handleSubmit(e: React.FormEvent<any>) {
    e.preventDefault();

    this.props.form.validateFields(async (err, values) => {
      if (err) {
        return;
      }

      this.setState({
        err: '',
        message: '',
        loading: true,
      });

      try {
        // Update password here
        await Api.updateFacultyByToken(this.props._id, this.props.token, {
          password: values.password,
        });
        this.setState({
          loading: false,
          message: 'Successfully reset the password. Navigating to the login',
        });
        Api.redirect(undefined, '/login', {
          message: 'Please login with your new password',
        })
      } catch (err) {
        this.setState({
          loading: false,
          err: err.message,
        })
      }
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <AppLayout>
        <FormLayout>
          <h1>New password</h1>
          <Form onSubmit={this.handleSubmit}>
            {this.state.err && (
              <Form.Item>
                <Alert type="error" message={this.state.err} />
              </Form.Item>
            )}
            {this.state.message && (
              <Form.Item>
                <Alert type="success" message={this.state.message} />
              </Form.Item>
            )}
            <Form.Item label="New password">
              {getFieldDecorator('password', {
                rules: [{
                  required: true,
                  message: 'Please enter new password',
                }, {
                  min: 6,
                  message: 'Password must be minimum 6 characters'
                }, {
                  validator: this.checkConfirm
                }]
              })(
                <Input type="password" />
              )}
            </Form.Item>
            <Form.Item label="Confirm new password">
              {getFieldDecorator('confirm', {
                rules: [{
                  required: true,
                  message: 'Please enter new password',
                }, {
                  min: 6,
                  message: 'Password must be minimum 6 characters'
                }, {
                  validator: this.checkPassword,
                }]
              })(
                <Input type="password" onBlur={this.handleConfirmBlur} />
              )}
            </Form.Item>
            <Form.Item>
              <Button
                htmlType="submit"
                style={{ width: '100%' }}
                type="primary"
                size="large"
                loading={this.state.loading}
              >
                Set password
              </Button>

            </Form.Item>
          </Form>
        </FormLayout>
      </AppLayout>
    );
  }
}

export default Form.create()(Token);