import * as React from 'react';
import ObjectID from 'bson-objectid';
import { List } from 'immutable';
import { Form, Icon, Select, DatePicker, Card, Button, Alert, Tag } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';

import { Semester } from '../models/Semester';
import { DateConstants } from '../models/Constants';
import DatetimeUtil from '../utils/DatetimeUtil';
import PresentationDate from '../models/PresentationDate';
import Loading from './Loading';
import Api from '../utils/Api';
import Faculty from '../models/Faculty';

export interface PresentationDate2Props {
  form: WrappedFormUtils;
  semester: Semester;
  isAdmin: boolean;
  facultyId: string;
}

interface PresentationDate2State {
  loading: boolean;
  editing: boolean;
  updating: boolean;
  err: string;
  presentationDates: PresentationDate[];
  faculties: Faculty[];
}

class PresentationDate2 extends React.Component<PresentationDate2Props, PresentationDate2State> {
  constructor(props: PresentationDate2Props) {
    super(props);

    this.state = {
      loading: true,
      editing: false,
      updating: false,
      err: '',
      presentationDates: Array<PresentationDate>(),
      faculties: Array<Faculty>(),
    }

    this.handleSubmit = this.handleSubmit.bind(this);
    this.extra = this.extra.bind(this);
    this.info = this.info.bind(this);
    this.form = this.form.bind(this);
    this.deleteDate = this.deleteDate.bind(this);
    this.addDate = this.addDate.bind(this);
    this.toggleForm = this.toggleForm.bind(this);
  }

  componentDidMount() {
    // Get presentationDates
    this.setPresentationDates();
  }

  componentWillReceiveProps(nextProps: PresentationDate2Props) {
    if (nextProps.semester !== this.props.semester) {
      this.setState({
        loading: true,
        editing: false,
        updating: false,
      });

      // Get new presentationDates
      this.setPresentationDates(nextProps.semester._id);
    }
  }

  async setPresentationDates(semesterId?: string) {
    let _id = this.props.semester._id;
    if (semesterId) {
      _id = semesterId;
    }
    try {
      const presentationDates = await Api.getPresentationDates(`semester=${_id}`) as PresentationDate[];
      
      const fids = presentationDates.map(date => date.admin);
      const fQuery = fids.map(fid => `_id[$in]=${fid}`).join('&');

      const faculties = await Api.getFaculties(fQuery) as Faculty[];

      this.setState({
        loading: false,
        presentationDates,
        faculties,
      });
    } catch (err) {
      this.setState({
        loading: false,
        err: err.message,
        presentationDates: [],
        faculties: [],
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
      // Update PresentationDate

      // const updateObj = {
      //   presentationDates,
      // }
      // this.props.updateSemester(updateObj, this.props.prop);
    })
  }

  toggleForm() {
    this.setState((prevState: PresentationDate2State, props: PresentationDate2Props) => {
      this.setState({
        editing: !prevState.editing,
      })
    })
  }

  extra() {
    const isArchived = false;

    let extra: string | JSX.Element = '';
    if (this.props.isAdmin && !isArchived && this.state.editing) {
      return (<Button
        icon="close"
        size="small"
        loading={this.state.updating}
        onClick={(e) => this.toggleForm()}
      >
        Cancel
      </Button>);
    } else if (this.props.isAdmin && !isArchived) {
      return (<Button ghost
        type="primary"
        size="small"
        onClick={(e) => this.toggleForm()}
      >
        Edit presentation dates
      </Button>);
    } else {
      return '';
    }
  }

  info() {
    if (this.state.loading) {
      return <Loading />
    }
    return (
      <div>
        Think later how to display here
        {/* {this.state.presentationDates.map(date => (
          <div key={date._id}>
            {this.getInitialValue(date._id, 'date')}&nbsp;
            {this.getInitialValue(date._id, 'startTime')} -&nbsp;
            {this.getInitialValue(date._id, 'endTime')}
          </div>
        ))} */}
      </div>
    );
  }

  addDate() {
    // this.setState((prevState: PresentationDate2State, props: PresentationDate2Props) => {
    //   return {
    //     objectIdsInForm: prevState.objectIdsInForm.push(`${ObjectID.generate()}`)
    //   }
    // });
  }

  deleteDate(objectId: string | undefined) {
    // if (!objectId) {
    //   return;
    // }

    // this.setState((prevState: PresentationDate2State, props: PresentationDate2Props) => {
    //   const index = prevState.objectIdsInForm.indexOf(objectId);
    //   return {
    //     objectIdsInForm: prevState.objectIdsInForm.delete(index)
    //   }
    // });
  }

  getInitialValue(objectId: string | undefined, property: string) {
    if (!objectId) {
      return undefined;
    }

    const date = this.state.presentationDates.find((date: any) => date._id === objectId);

    if (!date) {
      return undefined;
    }

    // if (property === 'date') {
    //   return DatetimeUtil.formatISOString(date.start, DateConstants.dateFormat);
    // } else if (property === 'dateMoment') {
    //   return DatetimeUtil.getMomentFromISOString(date.start);
    // } else if (property === 'startTime') {
    //   return DatetimeUtil.formatISOString(date.start, DateConstants.hourFormat);
    // } else if (property === 'endTime') {
    //   return DatetimeUtil.formatISOString(date.end, DateConstants.hourFormat);
    // } else {
    //   return undefined;
    // }
  }

  form() {
    return (
      <Form onSubmit={this.handleSubmit}>
        <Form.Item>
          Editing is <Tag>Admin only</Tag>feature
        </Form.Item>
        {this.state.err.length > 0 && (
          <Form.Item>
            <Alert message={this.state.err} type="error" />
          </Form.Item>
        )}
        {/* {this.state.objectIdsInForm.map((id) => (
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
        ))} */}
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
            loading={this.state.updating}
            style={{ marginRight: '16px' }}
          >
            Update
          </Button>
          <Button
            onClick={(e) => this.toggleForm()}
            loading={this.state.updating}
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
        {this.state.editing ? this.form() : this.info()}
      </Card>
    );
  }
}

export default Form.create()(PresentationDate2);