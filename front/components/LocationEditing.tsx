import * as React from 'react';
import { Form, Icon, Button, Alert, Input } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';

import Location from '../models/Location';

export interface LocationEditingProps {
  form: WrappedFormUtils;
  err: string;
  updating: boolean;
  location: Location;
  updateLocation: (location: string) => void;
  toggleForm: () => void;
}

class LocationEditing extends React.Component<LocationEditingProps, any> {
  constructor(props: LocationEditingProps) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e: React.FormEvent<any>) {
    e.preventDefault();

    this.props.form.validateFields((err, values) => {
      if (err) {
        return;
      }

      this.props.updateLocation(values.location);
    })
  }


  render() {
    return (
      <Form onSubmit={this.handleSubmit}>
        <Form.Item>
          Set presentation location of your class.
        </Form.Item>
        {this.props.err && (
          <Form.Item>
            <Alert message={this.props.err} type="error" />
          </Form.Item>
        )}
        <Form.Item>
          {this.props.form.getFieldDecorator('location', {
            rules: [{
              required: true,
              message: 'Please enter the location',
            }],
            initialValue: this.props.location.location,
          })(
            <Input prefix={<Icon type="home" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Presentation location" />
          )}
        </Form.Item>
        <Form.Item>
          <Button
            htmlType="submit"
            type="primary"
            loading={this.props.updating}
            style={{ marginRight: '16px' }}
          >
            Update
          </Button>
          <Button
            onClick={(e) => this.props.toggleForm()}
            loading={this.props.updating}
          >
            Cancel
          </Button>
        </Form.Item>
      </Form>
    );
  }
}

export default Form.create()(LocationEditing);