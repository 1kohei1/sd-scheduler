import * as React from 'react';
import { Form, Icon, Input, Card, Button, Alert } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';

import { Semester } from '../models/Semester';
import Faculty from '../models/Faculty';
import UserUtil from '../utils/UserUtil';

export interface LocationProps {
  form: WrappedFormUtils,
  prop: string;
  semester: Semester,
  editing: boolean;
  updating: boolean;
  error: string;
  toggleForm: (menu: string) => void;
  updateSemester: (updateObj: any, menu: string) => void;
}

interface LocationState {
  user: Faculty | undefined;
}

class Location extends React.Component<LocationProps, LocationState> {
  userUpdateKey = `Location_${new Date().toISOString()}`;

  constructor(props: LocationProps) {
    super(props);

    this.state = {
      user: undefined,
    }

    UserUtil.registerOnUserUpdates(this.userUpdateKey, this.setUser.bind(this));

    this.handleSubmit = this.handleSubmit.bind(this);
    this.extra = this.extra.bind(this);
    this.info = this.info.bind(this);
    this.form = this.form.bind(this);
  }

  setUser(user: Faculty | undefined) {
    this.setState({
      user,
    });
  }

  componentWillUnmount() {
    UserUtil.removeOnUserUpdates(this.userUpdateKey);
  }

  handleSubmit(e: React.FormEvent<any>) {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) return;
      this.props.updateSemester(values, this.props.prop);
    })
  }

  extra() {
    const isAdmin = this.state.user && this.state.user.isAdmin;
    const isArchived = false;

    let extra: string | JSX.Element = '';
    if (isAdmin && !isArchived && this.props.editing) {
      return (<Button
        icon="close"
        size="small"
        loading={this.props.updating}
        onClick={(e) => this.props.toggleForm(this.props.prop)}
      >
        Cancel
      </Button>);
    } else if (isAdmin && !isArchived) {
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