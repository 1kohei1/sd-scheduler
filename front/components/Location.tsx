import * as React from 'react';
import * as shortid from 'shortid';
import { Form, Icon, Input, Card, Button } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';

import { Semester } from '../models/Semester';

export interface LocationProps {
  form: WrappedFormUtils,
  semester: Semester,
  editing: boolean;
  toggleForm: (menu: string) => void;
  updateSemester: (updateObj: any, menu: string) => void;
}

class Location extends React.Component<LocationProps, {}> {
  constructor(props: LocationProps) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.extra = this.extra.bind(this);
    this.info = this.info.bind(this);
    this.form = this.form.bind(this);
  }

  handleSubmit(e: React.FormEvent<any>) {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) return;
      this.props.updateSemester(values, 'location');
    })
  }

  extra() {
    const isAdmin = true;
    const isArchived = false;

    let extra: string | JSX.Element = '';
    if (isAdmin && !isArchived && this.props.editing) {
      return (<Button 
        icon="close"
        size="small"
        onClick={(e) => this.props.toggleForm('location')}
      >
        Cancel
      </Button>);
    } else if (isAdmin && !isArchived) {
      return (<Button ghost
        type="primary"
        size="small"
        onClick={(e) => this.props.toggleForm('location')}
      >
        Edit location
      </Button>);
    } else {
      return '';
    }
  }

  info() {
    return (
      <div>HEC 450</div>
    );
  }

  form() {
    return (
      <Form onSubmit={this.handleSubmit}>
        <Form.Item>
          {this.props.form.getFieldDecorator('location', {
            rules: [{ required: true, message: 'Please enter the location!' }]
          })(
            <Input prefix={<Icon type="home" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Presentation location" />
          )}
        </Form.Item>
        <Form.Item>
          <Button htmlType="submit" type="primary" style={{ marginRight: '16px' }}>
            Update
          </Button>
          <Button onClick={(e) => this.props.toggleForm('location')}>
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