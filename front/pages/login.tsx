import * as React from 'react';
import { Form, Icon, Input, Button, Checkbox } from 'antd';
import MyLayout from '../components/MyLayout';
import InitialProps from '../models/InitialProps';

const FormItem = Form.Item;

export interface LoginProps {
}

interface LoginState {
  email: string;
  password: string;
  rememberMe: boolean
}

export default class Login extends React.Component<LoginProps, LoginState> {
  static async getInitialProps(props:InitialProps) {
    return {};
  }

  constructor(props: LoginProps) {
    super(props);
    this.state = {
      email: '',
      password: '',
      rememberMe: true
    }
  }

  render() {
    return (
      <MyLayout>
        <div className="form-wrapper">
          <Form>
            <FormItem>
              <Input prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Email" />
            </FormItem>
            <FormItem>
              <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Password" />
            </FormItem>
            <FormItem>
              <Checkbox>Remember me</Checkbox>
              <a className="login-form-forgot" href="">Forgot password</a>
            </FormItem>
            <FormItem>
              <Button style={{ width: '100%' }} type="primary" size="large">Submit</Button>
            </FormItem>
          </Form>
        </div>
        <style jsx>{`
          .form-wrapper {
            max-width: 500px;
            margin: auto;
            margin-top: 100px;
          }
          .form-wrapper .login-form-forgot {
            float: right;
          }
        `}
        </style>
      </MyLayout>
    );
  }
}
