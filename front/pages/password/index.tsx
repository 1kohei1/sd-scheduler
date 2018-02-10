import * as React from 'react';
import Link from 'next/link';
import { Form, Icon, Input, Button, Alert } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';

import AppLayout from '../../components/AppLayout';
import FormLayout from '../../components/FormLayout';

export interface PasswordIndexProps {
  form: WrappedFormUtils
}

class PasswordIndex extends React.Component<PasswordIndexProps, any> {
  constructor(props: PasswordIndexProps) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e: React.FormEvent<any>) {
    e.preventDefault();


  }

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <AppLayout>
        <FormLayout>
          <div>
            Enter your email address and we will send you a link to reset your password.
          </div>
          <Form onSubmit={this.handleSubmit}>
            <Form.Item>
              {getFieldDecorator('email', {
                rules: [{
                  required: true,
                  message: 'Please enter email'
                }, {
                  type: 'email',
                  message: 'It is not valid email',
                }]
              })(
                <Input placeholder="Email" />
              )}
            </Form.Item>
            <Form.Item>
              <Button
                htmlType="submit"
                type="primary"
                style={{ width: '100%' }}
              >
                Send password reset email
              </Button>
            </Form.Item>
            <div style={{ textAlign: 'center' }}>
              <Link href="/about">
                <a>What is SD Scheduler?</a>
              </Link>
            </div>
          </Form>
        </FormLayout>
      </AppLayout>
    );
  }
}

export default Form.create()(PasswordIndex);