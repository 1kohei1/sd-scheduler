import * as React from 'react';
import Router from 'next/router';
import { Form, Checkbox, Button } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';

import FilterQuery from '../../models/FilterQuery';

export interface SchedulingFilterProps {
  form: WrappedFormUtils,
}

const formItemLayout = {
  labelCol: {
    span: 4,
  },
  wrapperCol: {
    span: 20,
  }
}

const tailFormItemLayout = {
  wrapperCol: {
    span: 20,
    offset: 4,
  }
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

      // Update router
      Router.push({
        pathname: '/',
        query: {

        }
      });
    })
  }

  render() {
    return (
      <div className="ko-filter-form">
        <Form onSubmit={this.handleSubmit}>
          <Form.Item
            {...formItemLayout}
            label="Date"
          >
            {this.props.form.getFieldDecorator('presentationDates')(
              <div>
                <Checkbox value={true}>Date 1</Checkbox>
                <Checkbox value={true}>Date 2</Checkbox>
                <Checkbox value={true}>Date 3</Checkbox>
              </div>
            )}
          </Form.Item>
          <Form.Item
            {...formItemLayout}
            label="Faculties"
          >
            {this.props.form.getFieldDecorator('faculties')(
              <div>
                <Checkbox value={true}>Faculty 1</Checkbox>
                <Checkbox value={true}>Faculty 2</Checkbox>
                <Checkbox value={true}>Faculty 3</Checkbox>
              </div>
            )}
          </Form.Item>
          <Form.Item
            {...tailFormItemLayout}
          >
            <Button type="primary" htmlType="submit">
              Filter
            </Button>
          </Form.Item>
        </Form>
        <style jsx>{`
          .ko-filter-form {
            padding: 16px;
            background: #fbfbfb;
            border: 1px solid #d9d9d9;
            border-radius: 6px;
          }
        `}
        </style>
      </div>
    );
  }
}

export default Form.create()(SchedulingFilter);