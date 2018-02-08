import * as React from 'react';
import { Form, Icon, Select, DatePicker, Card, Button, Tooltip, Alert } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';

import { Semester } from '../models/Semester';
import Faculty from '../models/Faculty';
import UserUtil from '../utils/UserUtil';

export interface FacultiesProps {
  form: WrappedFormUtils,
  prop: string;
  semester: Semester,
  editing: boolean;
  updating: boolean;
  error: string;
  toggleForm: (menu: string) => void;
  updateSemester: (updateObj: any, menu: string) => void;
}

interface FacultiesState {
  user: Faculty | undefined;
}

class Faculties extends React.Component<FacultiesProps, any> {
  userUpdateKey = `Faculties_${new Date().toISOString()}`;
  
  constructor(props: FacultiesProps) {
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
        Edit faculties
      </Button>);
    } else {
      return '';
    }
  }

  info() {
    if (this.props.semester.faculties && this.props.semester.faculties.length > 0) {
      return (
        <div>
          {this.props.semester.faculties.map((faculty, index) => (
            <div key={index}>AAA AAA | aaa@aaa.com</div>
          ))}
        </div>
      )
    } else {
      return <div>No faculties are found.</div>
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
      <Card title="Faculty" extra={this.extra()} style={{ marginBottom: '16px' }}>
        {this.props.editing ? this.form() : this.info()}
      </Card>
    );
  }
}


export default Form.create()(Faculties);