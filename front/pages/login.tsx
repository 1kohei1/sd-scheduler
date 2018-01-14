import * as React from 'react';
import { Form, Icon, Input, Button, Checkbox } from 'antd';
import MyLayout from '../components/MyLayout';
import InitialProps from '../models/InitialProps';
import { WrappedFormUtils } from 'antd/lib/form/Form';

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

    this.props.form.validateFields((err, values) => {
      if (err) {
        console.log(err);
      } else {
        console.log(values);
      }
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <MyLayout>
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
              {getFieldDecorator('remember')(
                <Checkbox>Remember me</Checkbox>
              )}
              <a className="login-form-forgot" href="">Forgot password</a>
            </FormItem>
            <FormItem>
              <Button htmlType="submit" style={{ width: '100%' }} type="primary" size="large">Submit</Button>
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

export default Form.create()(Login);