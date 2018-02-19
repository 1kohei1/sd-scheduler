import * as React from 'react';
import Router from 'next/router';
import { Form, Checkbox, Button } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';

import { Semester } from '../../models/Semester';
import Faculty from '../../models/Faculty';

export interface SchedulingFilterProps {
  form: WrappedFormUtils;
  checkedFaculties: string[];
  faculties: Faculty[];
  onUpdateFilter: (ids: string[]) => void;
}

class SchedulingFilter extends React.Component<SchedulingFilterProps, any> {
  constructor(props: SchedulingFilterProps) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e: React.FormEvent<any>) {
    e.preventDefault();

    this.props.form.validateFields((err, values) => {
      if (err) {
        return;
      }

      const ids = Object.entries(values).filter(([_id, isChecked]) => isChecked).map(([_id]) => _id);
      this.props.onUpdateFilter(ids);
    })
  }

  render() {
    return (
      <div className="ko-filter-form">
        <Form onSubmit={this.handleSubmit}>
          <Form.Item>
            {this.props.faculties.map(f => {
              return this.props.form.getFieldDecorator(f._id, {
                initialValue: this.props.checkedFaculties.indexOf(f._id) >= 0,
                valuePropName: 'checked',
              })(
                <Checkbox key={f._id}>Dr. {f.firstName} {f.lastName}</Checkbox>
              )
            })}
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Filter
            </Button>
          </Form.Item>
        </Form>
        <style jsx>{`
          .ko-filter-form {
            // padding: 16px;
            // background: #fbfbfb;
            // border: 1px solid #d9d9d9;
            // border-radius: 6px;
          }
        `}
        </style>
      </div>
    );
  }
}

export default Form.create()(SchedulingFilter);