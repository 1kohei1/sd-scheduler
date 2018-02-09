import * as React from 'react';
import { Form, Icon, Card, Button, Alert, Input, Tag } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';

export interface InviteFacultyProps {
  form: WrappedFormUtils,
}

class InviteFaculty extends React.Component<InviteFacultyProps, any> {
  constructor(props: InviteFacultyProps) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e: React.FormEvent<any>) {
    e.preventDefault();

    this.props.form.validateFields(async (err, values) => {
      if (err) {
        return;
      }

      console.log(values);
    })
  }
  render() {
    const { getFieldDecorator } = this.props.form;

    const title = (
      <div>
        Invite faculty&nbsp;
        <Tag>Admin only</Tag>
      </div>
    )

    return (
      <Card title={title} style={{ marginBottom: '16px' }}>
        <div>
          We will send the sign up emails to the email address.
        </div>
        <Form onSubmit={this.handleSubmit}>
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