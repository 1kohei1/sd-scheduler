import * as React from 'react';
import ObjectID from 'bson-objectid';
import { Moment } from 'moment';
import { List } from 'immutable';
import { Form, Icon, Select, DatePicker, Card, Button, Alert, Input } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';

import PresentationDate, { PresentationDateDates } from '../models/PresentationDate';
import { DateConstants } from '../models/Constants';
import DatetimeUtil from '../utils/DatetimeUtil';

export interface PresentationDateEditingProps {
  form: WrappedFormUtils;
  err: string;
  updating: boolean;
  presentationDate: PresentationDate;
  updatePresentationDate: (dates: PresentationDateDates[]) => void;
  toggleForm: () => void;
  getInitialValue: (date: PresentationDateDates, property: string) => string | Moment | undefined;
}

interface PresentationDateEditingState {
  dates: PresentationDateDates[];
}

class PresentationDateEditing extends React.Component<PresentationDateEditingProps, any> {
  constructor(props: PresentationDateEditingProps) {
    super(props);

    this.state = {
      dates: this.props.presentationDate.dates,
    }

    this.handleSubmit = this.handleSubmit.bind(this);
    this.addDate = this.addDate.bind(this);
    this.deleteDate = this.deleteDate.bind(this);
  }

  handleSubmit(e: React.FormEvent<any>) {
    e.preventDefault();

    this.props.form.validateFields((err, values) => {
      if (err) {
        return;
      }

      const dates = Object.entries(values)
        .filter(([_id, date]: [string, any]) => {
          return date.date && date.startTime && date.endTime && date.location;
        })
        .map(([_id, date]: [string, any]) => {
          const dateStr = DatetimeUtil.formatDate(date.date, DateConstants.dateFormat);

          return {
            _id,
            start: DatetimeUtil.getISOString(dateStr, date.startTime),
            end: DatetimeUtil.getISOString(dateStr, date.endTime),
            location: date.location,
          }
        });

      this.props.updatePresentationDate(dates);
    })
  }

  addDate() {
    this.setState((prevState: PresentationDateEditingState, props: PresentationDateEditingProps) => {
      const { dates } = prevState;

      let newDates = List<PresentationDateDates>(dates);
      newDates = newDates.push({
        _id: ObjectID.generate(),
        start: '',
        end: '',
        location: '',
      });

      return {
        dates: newDates.toArray(),
      }
    })
  }

  deleteDate(_id: string) {
    this.setState((prevState: PresentationDateEditingState, props: PresentationDateEditingProps) => {
      const { dates } = prevState;
      const index = dates.findIndex(date => date._id === _id);

      if (index >= 0) {
        let newDates = List<PresentationDateDates>(dates);
        newDates = newDates.delete(index);

        return {
          dates: newDates.toArray(),
        }
      } else {
        return prevState;
      }
    });
  }

  render() {
    return (
      <Form onSubmit={this.handleSubmit}>
        <Form.Item>
          Set presentation dates of your class.
        </Form.Item>
        {this.props.err && (
          <Form.Item>
            <Alert message={this.props.err} type="error" />
          </Form.Item>
        )}
        {this.state.dates.map((date: PresentationDateDates) => (
          <div style={{ display: 'flex', flexDirection: 'row' }} key={date._id}>
            <Form.Item style={{ marginRight: 8 }}>
              {this.props.form.getFieldDecorator(`[${date._id}].date`, {
                initialValue: this.props.getInitialValue(date, 'dateMoment')
              })(
                <DatePicker placeholder="Presentation date" />
              )}
            </Form.Item>
            <Form.Item style={{ marginRight: 8 }}>
              {this.props.form.getFieldDecorator(`[${date._id}].startTime`, {
                initialValue: this.props.getInitialValue(date, 'startTime')
              })(
                <Select placeholder="Start time" style={{ width: 120 }}>
                  {DatetimeUtil.getTimeOptions().map((val: string) => (
                    <Select.Option value={val} key={val}>{val}</Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
            <Form.Item style={{ marginRight: 8 }}>
              {this.props.form.getFieldDecorator(`[${date._id}].endTime`, {
                initialValue: this.props.getInitialValue(date, 'endTime')
              })(
                <Select placeholder="End time" style={{ width: 120 }}>
                  {DatetimeUtil.getTimeOptions().map((val: string) => (
                    <Select.Option value={val} key={val}>{val}</Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
            <Form.Item style={{ marginRight: 8 }}>
              {this.props.form.getFieldDecorator(`[${date._id}].location`, {
                initialValue: this.props.getInitialValue(date, 'location')
              })(
                <Input
                  placeholder="Location"
                />
              )}
            </Form.Item>
            <Form.Item>
              <Button icon="delete" shape="circle" onClick={(e) => this.deleteDate(date._id)} />
            </Form.Item>
          </div>
        ))}
        <Form.Item>
          <Button
            type="dashed"
            onClick={this.addDate}
            style={{ width: '200px' }}
          >
            <Icon type="plus" /> Add new date
          </Button>
        </Form.Item>
        <Form.Item>
          <Button
            htmlType="submit"
            type="primary"
            loading={this.props.updating}
            style={{ marginRight: '16px' }}
          >
            Update
          </Button>
          <Button
            onClick={(e) => this.props.toggleForm()}
            loading={this.props.updating}
          >
            Cancel
          </Button>
        </Form.Item>
      </Form>
    );
  }
}

export default Form.create()(PresentationDateEditing);