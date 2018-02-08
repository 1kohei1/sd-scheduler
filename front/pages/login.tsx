import * as React from 'react';
import { Form, Icon, Input, Button, Alert } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';

import AppLayout from '../components/AppLayout';
import NextClientProps from '../models/NextClientProps';
import Api from '../utils/Api';

const FormItem = Form.Item;

export interface LoginProps extends NextClientProps {
  form: WrappedFormUtils
}

interface LoginState {
  isError: boolean;
  message: string;
  loading: boolean;
}

class Login extends React.Component<LoginProps, LoginState> {
  constructor(props: LoginProps) {
    const message = props.url.query.message || '';

    super(props);
    this.state = {
      isError: message ? false : true,
      loading: false,
      message,
    }

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e: React.FormEvent<any>) {
    e.preventDefault();

    this.props.form.validateFields(async (err, values) => {
      if (err) {
        console.log(err);
      } else {
        try {
          this.setState({
            loading: true,
            message: '',
          });
          Api.login(values);
        } catch (errRes) {
          this.setState({
            message: errRes.message,
            isError: true,
            loading: false,
          })
        }
      }
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <AppLayout>
        <div className="form-wrapper">
          <Form onSubmit={this.handleSubmit}>
            {this.state.message && this.state.message.length > 0 && (
              <FormItem>
                <Alert
                  type={this.state.isError ? 'error' : 'success'}
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
                  prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />}
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
                  prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
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
                Submit
              </Button>
            </FormItem>
            <div style={{ textAlign: 'center' }}>
              <a className="" href="">Forgot password</a>
            </div>
          </Form>
        </div>
        <style jsx>{`
          .form-wrapper {
            max-width: 500px;
            margin: auto;
            margin-top: 100px;
          }
        `}
        </style>
      </AppLayout>
    );
  }
}

export default Form.create()(Login);