import * as React from 'react';
import Link from 'next/link';
import { Form, Icon, Input, Button, Alert } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';

import AppLayout from '../../components/AppLayout';
import FormLayout from '../../components/FormLayout';
import NextClientProps from '../../models/NextClientProps';
import Api from '../../utils/Api';

export interface PasswordIndexProps extends NextClientProps {
  form: WrappedFormUtils
}

interface PasswordIndexState {
  err: string;
  message: string;
  loading: boolean;
}

class PasswordIndex extends React.Component<PasswordIndexProps, PasswordIndexState> {
  constructor(props: PasswordIndexProps) {
    super(props);

    const { query } = this.props.url;

    this.state = {
      err: query.err || '',
      message: query.message || '',
      loading: false,
    }

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e: React.FormEvent<any>) {
    e.preventDefault();

    this.props.form.validateFields(async (err, values) => {
      if (err) {
        return;
      }

      this.setState({
        err: '',
        loading: true,
      });
      try {
        await Api.sendPasswordreset({
          email: values.email,
        });
        this.setState({
          loading: false,
          message: 'Password reset email is queued. You will receive the email in 5 minutes',
        })
      } catch (err) {
        this.setState({
          loading: false,
          err: err.message,
        });
      }
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <AppLayout>
        <FormLayout>
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
            <div>
              Enter your email address and we will send you a link to reset your password.
            </div>
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
                size="large"
                loading={this.state.loading}
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