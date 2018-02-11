import * as React from 'react';
import ObjectID from 'bson-objectid';
import { List } from 'immutable';
import { Form, Icon, Select, DatePicker, Card, Button, Alert, Tag } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';

import { Semester } from '../models/Semester';
import { DateConstants } from '../models/Constants';
import DatetimeUtil from '../utils/DatetimeUtil';

export interface PresentationDateProps {
  form: WrappedFormUtils,
  prop: string;
  isAdmin: boolean;
  semester: Semester,
  editing: boolean;
  updating: boolean;
  error: string;
  toggleForm: (menu: string) => void;
  updateSemester: (updateObj: any, menu: string) => void;
}

interface PresentationDateState {
  objectIdsInForm: List<string>;
}

class PresentationDate extends React.Component<PresentationDateProps, PresentationDateState> {
  constructor(props: PresentationDateProps) {
    super(props);

    this.state = {
      objectIdsInForm: List(this.props.semester.presentationDates.map(date => date._id)),
    }

    this.handleSubmit = this.handleSubmit.bind(this);
    this.extra = this.extra.bind(this);
    this.info = this.info.bind(this);
    this.form = this.form.bind(this);
    this.deleteDate = this.deleteDate.bind(this);
    this.addDate = this.addDate.bind(this);
  }

  componentWillReceiveProps(nextProps: PresentationDateProps) {
    if (!nextProps.editing) {
      this.setState({
        objectIdsInForm: List(nextProps.semester.presentationDates.map(date => date._id))
      })
    }
  }

  handleSubmit(e: React.FormEvent<any>) {
    e.preventDefault();

    this.props.form.validateFields((err, values) => {
      if (err) {
        return
      }

      // Format dates object to be DB format
      const presentationDates: any = [];
      for (let id in values.presentationDates) {
        const formValue = values.presentationDates[id];

        // If all data is not given, skip it
        if (!formValue.date || !formValue.startTime || !formValue.endTime) {
          continue;
        }

        const dateString = DatetimeUtil.formatDate(formValue.date, DateConstants.dateFormat);

        presentationDates.push({
          _id: id,
          start: DatetimeUtil.getISOString(dateString, formValue.startTime),
          end: DatetimeUtil.getISOString(dateString, formValue.endTime),
        });
      }
      const updateObj = {
        presentationDates,
      }
      this.props.updateSemester(updateObj, this.props.prop);
    })
  }

  extra() {
    const isArchived = false;

    let extra: string | JSX.Element = '';
    if (this.props.isAdmin && !isArchived && this.props.editing) {
      return (<Button
        icon="close"
        size="small"
        loading={this.props.updating}
        onClick={(e) => this.props.toggleForm(this.props.prop)}
      >
        Cancel
      </Button>);
    } else if (this.props.isAdmin && !isArchived) {
      return (<Button ghost
        type="primary"
        size="small"
        onClick={(e) => this.props.toggleForm(this.props.prop)}
      >
        Edit presentation dates
      </Button>);
    } else {
      return '';
    }
  }

  info() {
    if (!this.props.semester.presentationDates || this.props.semester.presentationDates.length === 0) {
      return <div>Date is not defined yet.</div>
    }
    return (
      <div>
        {this.props.semester.presentationDates.map(date => (
          <div key={date._id}>
            {this.getInitialValue(date._id, 'date')}&nbsp;
            {this.getInitialValue(date._id, 'startTime')} -&nbsp;
            {this.getInitialValue(date._id, 'endTime')}
          </div>
        ))}
      </div>
    );
  }

  addDate() {
    this.setState((prevState: PresentationDateState, props: PresentationDateProps) => {
      return {
        objectIdsInForm: prevState.objectIdsInForm.push(`${ObjectID.generate()}`)
      }
    });
  }

  deleteDate(objectId: string | undefined) {
    if (!objectId) {
      return;
    }

    this.setState((prevState: PresentationDateState, props: PresentationDateProps) => {
      const index = prevState.objectIdsInForm.indexOf(objectId);
      return {
        objectIdsInForm: prevState.objectIdsInForm.delete(index)
      }
    });
  }

  getInitialValue(objectId: string | undefined, property: string) {
    if (!objectId) {
      return undefined;
    }

    const date = this.props.semester.presentationDates.find(date => date._id === objectId);

    if (!date) {
      return undefined;
    }

    if (property === 'date') {
      return DatetimeUtil.formatISOString(date.start, DateConstants.dateFormat);
    } else if (property === 'dateMoment') {
      return DatetimeUtil.getMomentFromISOString(date.start);
    } else if (property === 'startTime') {
      return DatetimeUtil.formatISOString(date.start, DateConstants.hourFormat);
    } else if (property === 'endTime') {
      return DatetimeUtil.formatISOString(date.end, DateConstants.hourFormat);
    } else {
      return undefined;
    }
  }

  form() {
    return (
      <Form onSubmit={this.handleSubmit}>
        <Form.Item>
          Editing is <Tag>Admin only</Tag>feature
        </Form.Item>
        {this.props.error.length > 0 && (
          <Form.Item>
            <Alert message={this.props.error} type="error" />
          </Form.Item>
        )}
        {this.state.objectIdsInForm.map((id) => (
          <div style={{ display: 'flex', flexDirection: 'row' }} key={id}>
            <Form.Item style={{ marginRight: 8 }}>
              {this.props.form.getFieldDecorator(`presentationDates[${id}].date`, {
                initialValue: this.getInitialValue(id, 'dateMoment')
              })(
                <DatePicker placeholder="Presentation date" />
                )}
            </Form.Item>
            <Form.Item style={{ marginRight: 8 }}>
              {this.props.form.getFieldDecorator(`presentationDates[${id}].startTime`, {
                initialValue: this.getInitialValue(id, 'startTime')
              })(
                <Select placeholder="Start time" style={{ width: 120 }}>
                  {DatetimeUtil.getTimeOptions().map((val: string) => (
                    <Select.Option value={val} key={val}>{val}</Select.Option>
                  ))}
                </Select>
                )}
            </Form.Item>
            <Form.Item style={{ marginRight: 8 }}>
              {this.props.form.getFieldDecorator(`presentationDates[${id}].endTime`, {
                initialValue: this.getInitialValue(id, 'endTime')
              })(
                <Select placeholder="End time" style={{ width: 120 }}>
                  {DatetimeUtil.getTimeOptions().map((val: string) => (
                    <Select.Option value={val} key={val}>{val}</Select.Option>
                  ))}
                </Select>
                )}
            </Form.Item>
            <Form.Item>
              <Button icon="delete" shape="circle" onClick={(e) => this.deleteDate(id)} />
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
            onClick={(e) => this.props.toggleForm(this.props.prop)}
            loading={this.props.updating}
          >
            Cancel
          </Button>
        </Form.Item>
      </Form>
    )
  }

  render() {
    return (
      <Card title="Presentation dates" extra={this.extra()} style={{ marginBottom: '16px' }}>
        {this.props.editing ? this.form() : this.info()}
      </Card>
    );
  }
}

export default Form.create()(PresentationDate);