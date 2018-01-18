import * as React from 'react';
import * as shortid from 'shortid';
import * as moment from 'moment';
import { Set } from 'immutable';
import { Form, Icon, Select, DatePicker, Card, Button } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';

import { Semester } from '../models/Semester';

export interface DateProps {
  form: WrappedFormUtils,
  semester: Semester,
  editing: boolean;
  toggleForm: (menu: string) => void;
  updateSemester: (updateObj: any, menu: string) => void;
}

interface DateState {
  objectIdsInForm: Set<string>
}

const ampm = ['AM', 'PM'];
const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const temp = ampm.map(val => {
  return hours.map(h => `${h} ${val}`);
});
const timeOptions = [].concat.apply([], temp); // Taken from http://www.jstips.co/en/javascript/flattening-multidimensional-arrays-in-javascript/

class Date extends React.Component<DateProps, DateState> {
  constructor(props: DateProps) {
    super(props);

    this.state = {
      objectIdsInForm: Set(this.props.semester.dates.map(date => date._id))
    }

    this.handleSubmit = this.handleSubmit.bind(this);
    this.extra = this.extra.bind(this);
    this.info = this.info.bind(this);
    this.form = this.form.bind(this);
  }

  componentWillReceiveProps(nextProps: DateProps) {
    if (this.props.semester !== nextProps.semester) {
      this.setState({
        objectIdsInForm: Set(nextProps.semester.dates.map(date => date._id))
      })
    }
  }

  handleSubmit(e: React.FormEvent<any>) {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) return;
      console.log(values)
      this.props.updateSemester(values, 'date');
    })
  }

  extra() {
    const isAdmin = true;
    const isArchived = false;

    let extra: string | JSX.Element = '';
    if (isAdmin && !isArchived && this.props.editing) {
      return (<Button
        icon="close"
        size="small"
        onClick={(e) => this.props.toggleForm('date')}
      >
        Cancel
      </Button>);
    } else if (isAdmin && !isArchived) {
      return (<Button ghost
        type="primary"
        size="small"
        onClick={(e) => this.props.toggleForm('date')}
      >
        Edit location
      </Button>);
    } else {
      return '';
    }
  }

  info() {
    return (
      <div>
        {this.props.semester.dates.map(date => (
          <div key={date._id}>
            {date.date} {date.startTime} - {date.endTime}
          </div>
        ))}
      </div>
    );
  }

  deleteDate(objectId: string) {

  }

  getInitialValue(objectId: string | undefined, property: string) {
    if (!objectId) return '';
    
    const date = this.props.semester.dates.find(date => date._id === objectId);
    if (date && property === 'date') {
      return moment(date[property], 'YYYY-MM-DD');
    } else if (date) {
      return date[property];
    } else {
      return '';
    }
  }

  form() {
    return (
      <Form onSubmit={this.handleSubmit}>
        {this.state.objectIdsInForm.map((id) => (
          <div style={{ display: 'flex', flexDirection: 'row' }} key={id}>
            <Form.Item style={{ marginRight: 8 }}>
              {this.props.form.getFieldDecorator(`date_${id}`, {
                initialValue: this.getInitialValue(id, 'date')
              })(
                <DatePicker placeholder="Presentation date" />
              )}
            </Form.Item>
            <Form.Item style={{ marginRight: 8 }}>
              {this.props.form.getFieldDecorator(`startTime_${id}`, {
                initialValue: this.getInitialValue(id, 'startTime')
              })(
                <Select placeholder="Start time" style={{ width: 120 }}>
                  {timeOptions.map((val: string) => (
                    <Select.Option value={val} key={val}>{val}</Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
            <Form.Item style={{ marginRight: 8 }}>
              {this.props.form.getFieldDecorator(`endTime_${id}`, {
                initialValue: this.getInitialValue(id, 'endTime')
              })(
                <Select placeholder="End time" style={{ width: 120 }}>
                  {timeOptions.map((val: string) => (
                    <Select.Option value={val} key={val}>{val}</Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
            <Form.Item>
              <Icon type="delete" style={{ fontSize: '1.5em', cursor: 'pointer' }} />
            </Form.Item>
          </div>
        ))}
        <Form.Item>
          <Button htmlType="submit" type="primary" style={{ marginRight: '16px' }}>
            Update
          </Button>
          <Button onClick={(e) => this.props.toggleForm('date')}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    )
  }

  render() {
    return (
      <Card title="Date" extra={this.extra()} style={{ marginBottom: '16px' }}>
        {this.props.editing ? this.form() : this.info()}
      </Card>
    );
  }
}

export default Form.create()(Date);