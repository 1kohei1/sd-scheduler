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
    return (
      <div>
        <div>AAA AAA | aaa@aaa.com</div>
        <div>BBB BBB | bbb@bbb.com</div>
        <div>CCC CCC | ccc@ccc.com</div>
        <div>DDD DDD | ddd@ddd.com</div>
      </div>
    );
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
