import * as React from 'react';
import * as shortid from 'shortid';
import { Card, Button } from 'antd';

import { Semester } from '../models/Semester';

export interface DateProps {
  semester: Semester,
  editing: boolean;
  toggleForm: (menu: string) => void;
  updateSemester: (updateObj: any, menu: string) => void;
}

export default class Date extends React.Component<DateProps, any> {
  constructor(props: DateProps) {
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
        <div>11/28 10:00AM - 6:00PM</div>
        <div>11/30 10:00AM - 6:00PM</div>
        <div>12/01 10:00AM - 6:00PM</div>
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
        onClick={(e) => this.props.toggleForm('date')}
      >
        Edit date
      </Button>
    ) : (``);

    return (
      <Card title="Date" extra={extra} style={{ marginBottom: '16px' }}>
        {this.props.editing ? this.form() : this.info() }
      </Card>
    );
  }
}
