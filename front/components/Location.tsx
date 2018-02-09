import * as React from 'react';
import { Form, Icon, Input, Card, Button, Alert, Tag } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';

import { Semester } from '../models/Semester';

export interface LocationProps {
  form: WrappedFormUtils,
  prop: string;
  isAdmin: boolean;
  semester: Semester,
  editing: boolean;
  updating: boolean;
  error: string;
  toggleForm: (menu: string) => void;
  updateSemester: (updateObj: any, menu: string) => void;
}

interface LocationState {
}

class Location extends React.Component<LocationProps, LocationState> {
  constructor(props: LocationProps) {
    super(props);

    this.state = {}

    this.handleSubmit = this.handleSubmit.bind(this);
    this.extra = this.extra.bind(this);
    this.info = this.info.bind(this);
    this.form = this.form.bind(this);
  }

  handleSubmit(e: React.FormEvent<any>) {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) return;
      this.props.updateSemester(values, this.props.prop);
    })
  }

  extra() {
    const isArchived = false;

    let extra: string | JSX.Element = '';
    if (this.props.isAdmin && !isArchived && this.props.editing) {
      return (<Button
        icon="close"
        size="small"
        loading={this.props.updating}
        onClick={(e) => this.props.toggleForm(this.props.prop)}
      >
        Cancel
      </Button>);
    } else if (this.props.isAdmin && !isArchived) {
      return (<Button ghost
        type="primary"
        size="small"
        onClick={(e) => this.props.toggleForm(this.props.prop)}
      >
        Edit location
      </Button>);
    } else {
      return '';
    }
  }

  info() {
    if (this.props.semester.location) {
      return <div>{this.props.semester.location}</div>
    } else {
      return <div>Location is not defined yet.</div>
    }
  }

  form() {
    return (
      <Form onSubmit={this.handleSubmit}>
        <Form.Item>
          Editing is <Tag>Admin only</Tag> feature
        </Form.Item>
        {this.props.error.length > 0 && (
          <Form.Item>
            <Alert message={this.props.error} type="error" />
          </Form.Item>
        )}
        <Form.Item>
          {this.props.form.getFieldDecorator('location', {
            rules: [{ required: true, message: 'Please enter the location!' }],
            initialValue: this.props.semester.location,
          })(
            <Input prefix={<Icon type="home" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Presentation location" />
            )}
        </Form.Item>
        <Form.Item>
          <Button
            htmlType="submit"
            type="primary"
            style={{ marginRight: '16px' }}
            loading={this.props.updating}
          >
            Update
          </Button>
          <Button
            onClick={(e) => this.props.toggleForm(this.props.prop)}
            loading={this.props.updating}
          >
            Cancel
          </Button>
        </Form.Item>
      </Form>
    )
  }

  render() {
    return (
      <Card title="Location" extra={this.extra()} style={{ marginBottom: '16px' }}>
        {this.props.editing ? this.form() : this.info()}
      </Card>
    );
  }
}

export default Form.create()(Location);