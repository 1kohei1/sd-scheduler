import * as React from 'react';
import { Form, Icon, Card, Button, Alert, Input, message } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';

import Api from '../utils/Api';

export interface InviteFacultyProps {
  form: WrappedFormUtils,
}

interface InviteFacultyState {
  loading: boolean;
  err: string;
}

class InviteFaculty extends React.Component<InviteFacultyProps, InviteFacultyState> {
  constructor(props: InviteFacultyProps) {
    super(props);

    this.state = {
      loading: false,
      err: '',
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
        loading: true,
        err: '',
      });

      try {
        await Api.createFaculty(values);
        this.setState({
          loading: false,
        });
        message.success(`Successfully invited Dr. ${values.firstName} ${values.lastName}`);
        this.props.form.resetFields();
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

    const title = (
      <div>
        Invite faculty
      </div>
    )

    return (
      <Card title={title} style={{ marginBottom: '16px' }}>
        <Form onSubmit={this.handleSubmit}>
          {this.state.err && (
            <Form.Item>
              <Alert message={this.state.err} type="error" />
            </Form.Item>
          )}
          <div>
            We will send the sign up emails to the email address.
          </div>
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <Form.Item style={{ marginRight: '8px' }}>
              {getFieldDecorator('firstName', {
                rules: [{
                  required: true,
                  message: 'Please enter first name',
                }]
              })(
                <Input placeholder="First name" />
              )}
            </Form.Item>
            <Form.Item style={{ marginRight: '8px' }}>
              {getFieldDecorator('lastName', {
                rules: [{
                  required: true,
                  message: 'Please enter last name',
                }]
              })(
                <Input placeholder="Last name" />
              )}
            </Form.Item>
            <Form.Item style={{ marginRight: '8px' }}>
              {getFieldDecorator('email', {
                rules: [{
                  required: true,
                  message: 'Please enter email',
                }, {
                  type: 'email',
                  message: 'Please enter valid email',
                }]
              })(
                <Input placeholder="Email" />
              )}
            </Form.Item>
            <Form.Item>
              <Button
                htmlType="submit"
                loading={this.state.loading}
                type="primary"
              >
                Invite
              </Button>
            </Form.Item>
          </div>
        </Form>
      </Card>
    );
  }
}

export default Form.create()(InviteFaculty);