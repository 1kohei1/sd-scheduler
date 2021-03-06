import * as React from 'react';
import Link from 'next/link';
import { Form, Input, Button, Alert } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';

import AppLayout from '../components/AppLayout';
import FormLayout from '../components/FormLayout';
import NextClientProps from '../models/NextClientProps';
import Api from '../utils/Api';

const FormItem = Form.Item;

export interface LoginProps extends NextClientProps {
  form: WrappedFormUtils;
}

interface LoginState {
  err: string;
  message: string;
  loading: boolean;
}

class Login extends React.Component<LoginProps, LoginState> {
  constructor(props: LoginProps) {
    super(props);
    this.state = {
      err: props.url.query.err || '',
      message: props.url.query.message || '',
      loading: false,
    }

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e: React.FormEvent<any>) {
    e.preventDefault();

    this.props.form.validateFields(async (err, values) => {
      if (err) {
        return
      }
      try {
        this.setState({
          loading: true,
          message: '',
          err: '',
        });
        const result = await Api.login(values);
        if (result) {
          const { query } = this.props.url;

          let pathname = '/dashboard';
          if (query.hasOwnProperty('pathname')) {
            pathname = query.pathname;
          }
          let asPath = undefined;
          if (query.hasOwnProperty('asPath')) {
            asPath = query.asPath;
          }
          let redirectQuery = {};
          if (query.hasOwnProperty('query')) {
            redirectQuery = JSON.parse(query.query);
          }
          
          Api.redirect(undefined, pathname, redirectQuery, asPath);
        }
      } catch (errRes) {
        this.setState({
          err: errRes.message,
          loading: false,
        })
      }
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <AppLayout>
        <FormLayout>
          <h1>Login</h1>
          <Alert
            type="warning"
            style={{ marginBottom: '8px' }}
            message="Login is only available for faculty"
          />
          <Form onSubmit={this.handleSubmit}>
            {this.state.err && (
              <FormItem>
                <Alert
                  type="error"
                  message={this.state.err}
                />
              </FormItem>
            )}
            {this.state.message && (
              <FormItem>
                <Alert
                  type="success"
                  message={this.state.message}
                />
              </FormItem>
            )}
            <FormItem>
              {getFieldDecorator('email', {
                rules: [{
                  required: true,
                  message: 'Please enter email'
                }, {
                  type: 'email',
                  message: 'It is not valid email',
                }]
              })(
                <Input
                  placeholder="Email"
                />
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('password', {
                rules: [{
                  required: true,
                  message: 'Please enter password'
                }, {
                  min: 6,
                  message: 'Password must be minimum 6 characters',
                }]
              })(
                <Input
                  type="password"
                  placeholder="Password"
                />
              )}
            </FormItem>
            <FormItem>
              <Button
                htmlType="submit"
                style={{ width: '100%' }}
                type="primary"
                size="large"
                loading={this.state.loading}
              >
                Login
              </Button>
            </FormItem>
            <div style={{ textAlign: 'center' }}>
              <Link href="/password">
                <a>Forgot password</a>
              </Link>
            </div>
          </Form>
        </FormLayout>
      </AppLayout>
    );
  }
}

export default Form.create()(Login);