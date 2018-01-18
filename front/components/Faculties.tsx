import * as React from 'react';
import * as shortid from 'shortid';
import { Card, Button } from 'antd';

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
    this.info = this.info.bind(this);
    this.form = this.form.bind(this);
  }

  handleSubmit(e: React.FormEvent<any>) {

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
      <div>Hello</div>
    )

  }

  render() {
    const isAdmin = true;
    const isArchived = false;

    const extra = isAdmin && !isArchived ? (
      <Button ghost
        type="primary"
        size="small"
        onClick={(e) => this.props.toggleForm('faculties')}
      >
        Edit location
      </Button>
    ) : (``);

    return (
      <Card title="Faculty" extra={extra} style={{ marginBottom: '16px' }}>
        {this.props.editing ? this.form() : this.info() }
      </Card>
    );
  }
}
