import * as React from 'react';
import * as shortid from 'shortid';
import { Card, Button } from 'antd';

import { Semester } from '../models/Semester';

export interface LocationProps {
  semester: Semester,
  editing: boolean;
  toggleForm: (menu: string) => void;
  updateSemester: (updateObj: any, menu: string) => void;
}

export default class Location extends React.Component<LocationProps, any> {
  constructor(props: LocationProps) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.info = this.info.bind(this);
    this.form = this.form.bind(this);
  }

  handleSubmit(e: React.FormEvent<any>) {

  }

  info() {
    return (
      <div>HEC 450</div>
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
        onClick={(e) => this.props.toggleForm('location')}
      >
        Edit location
      </Button>
    ) : (``);

    return (
      <Card title="Location" extra={extra} style={{ marginBottom: '16px' }}>
        {this.props.editing ? this.form() : this.info() }
      </Card>
    );
  }
}
