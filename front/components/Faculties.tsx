import * as React from 'react';
import { Form, Icon, Select, DatePicker, Card, Button, Tooltip } from 'antd';

import { Semester } from '../models/Semester';

export interface FacultiesProps {
  semester: Semester,
  editing: boolean;
  toggleForm: (menu: string) => void;
  updateSemester: (updateObj: any, menu: string) => void;
}

export default class Faculties extends React.Component<FacultiesProps, any> {
  constructor(props: FacultiesProps) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.extra = this.extra.bind(this);
    this.info = this.info.bind(this);
    this.form = this.form.bind(this);
  }

  handleSubmit(e: React.FormEvent<any>) {

  }

  extra() {
    const isAdmin = true;
    const isArchived = false;

    let extra: string | JSX.Element = '';
    if (isAdmin && !isArchived && this.props.editing) {
      return (<Button 
        icon="close"
        size="small"
        onClick={(e) => this.props.toggleForm('faculties')}
      >
        Cancel
      </Button>);
    } else if (isAdmin && !isArchived) {
      return (<Button ghost
        type="primary"
        size="small"
        onClick={(e) => this.props.toggleForm('faculties')}
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
      
        <Form.Item>
          <Button htmlType="submit" type="primary" style={{ marginRight: '16px' }}>
            Update
          </Button>
          <Button onClick={(e) => this.props.toggleForm('faculties')}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    )

  }

  render() {
    return (
      <Card title="Faculty" extra={this.extra()} style={{ marginBottom: '16px' }}>
        {this.props.editing ? this.form() : this.info() }
      </Card>
    );
  }
}
