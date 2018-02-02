import * as React from 'react';
import { Form, Icon, Input, Button, Checkbox } from 'antd';
import AppLayout from '../components/AppLayout';
import InitialProps from '../models/InitialProps';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import Api from '../utils/Api';

const FormItem = Form.Item;

export interface LoginProps {
  form: WrappedFormUtils
}

interface LoginState {
  email: string;
  password: string;
  remember: boolean
}

class Login extends React.Component<LoginProps, LoginState> {
  constructor(props: LoginProps) {
    super(props);
    this.state = {
      email: '',
      password: '',
      remember: true
    }

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e: React.FormEvent<any>) {
    e.preventDefault();

    this.props.form.validateFields(async (err, values) => {
      if (err) {
        console.log(err);
      } else {
        const data = await Api.login(values);
        console.log(data);
      }
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <AppLayout>
        <div className="form-wrapper">
          <Form onSubmit={this.handleSubmit}>
            <FormItem>
              {getFieldDecorator('email')(
                <Input prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Email" />
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('password')(
                <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Password" />
              )}
            </FormItem>
            <FormItem>
              <Button htmlType="submit" style={{ width: '100%' }} type="primary" size="large">Submit</Button>
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