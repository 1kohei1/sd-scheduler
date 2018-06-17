import * as React from 'react';
import { Form, Checkbox, Button } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';

import Faculty from '../../models/Faculty';
import DividerWithLeftTitle from '../DividerWithLeftTitle';

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
      <Form onSubmit={this.handleSubmit}>
        <DividerWithLeftTitle
          title="Filter faculties in the calendar"
        />
        <div style={{ display: 'flex' }}>
          {this.props.faculties.map(f => (
            <Form.Item key={f._id}>
              {this.props.form.getFieldDecorator(f._id, {
                initialValue: this.props.checkedFaculties.indexOf(f._id) >= 0,
                valuePropName: 'checked',
              })(
                <Checkbox>Dr. {f.firstName} {f.lastName}</Checkbox>
              )}
            </Form.Item>
          ))}
        </div>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Filter
          </Button>
        </Form.Item>
      </Form>
    );
  }
}

export default Form.create()(SchedulingFilter);