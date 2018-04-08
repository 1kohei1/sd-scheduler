import * as React from 'react';
import { Select, Checkbox, Icon, Form, Input, Button } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';

import PresentationDate from '../models/PresentationDate';
import Faculty from '../models/Faculty';
import AvailableSlot from '../models/AvailableSlot';
import Presentation, { ExternalFaculty } from '../models/Presentation';
import TimeSlot from '../models/TimeSlot';
import DatetimeUtil, { TimeSlotLikeObject } from '../utils/DatetimeUtil';
import CardInfo from './CardInfo';
import { DateConstants } from '../models/Constants';

export interface SelectDatetimeProps {
  // antd form util
  form: WrappedFormUtils,

  presentationDate: PresentationDate;
  faculties: Faculty[];
  availableSlots: AvailableSlot[];
  presentations: Presentation[];
  adminFaculty: Faculty;
  schedulingPresentation: Presentation;
  presentationDatestr: string;
  onSelectDatetimeRef: (selectDatetimeRef: any) => void;
  presentationDatestrPicked: (dateStr: string) => void;
  presentationDatetimePicked: (start: string, end: string) => void;
  presentationFacultyPicked: (checked: boolean, fid: string) => void;
  addExternalFaculty: () => void;
  deleteExternalFaculty: (_id: string) => void;
  setExternalFaculty: (faculties: ExternalFaculty[], diff: number) => void;
}

class SelectDatetime extends React.Component<SelectDatetimeProps, any> {
  constructor(props: SelectDatetimeProps) {
    super(props);

    this.onDateClicked = this.onDateClicked.bind(this);
    this.onHourOptionChanged = this.onHourOptionChanged.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    this.props.onSelectDatetimeRef(this);
  }

  componentWillUnmount() {
    this.props.onSelectDatetimeRef(undefined);
  }

  onDateClicked(date: TimeSlotLikeObject) {
    const dateStr = DatetimeUtil.formatISOString(date.start, DateConstants.dateFormat);
    this.props.presentationDatestrPicked(dateStr);
  }

  onHourOptionChanged(val: string) {
    const { presentationDatestr } = this.props;

    if (presentationDatestr) {
      const start = DatetimeUtil.getMomentByFormat(`${presentationDatestr} ${val}`, `${DateConstants.dateFormat} ${DateConstants.hourFormat}`);
      const end = DatetimeUtil.addToMoment(start, 1, 'hour');

      this.props.presentationDatetimePicked(start.toISOString(), end.toISOString())
    }
  }

  private getHourOption() {
    const { presentationDatestr } = this.props;

    if (presentationDatestr) {
      const presentationDate = this.props.presentationDate.dates
        .find(date => DatetimeUtil.formatISOString(date.start, DateConstants.dateFormat) === presentationDatestr)

      if (presentationDate) {
        const presentationDateSlot = DatetimeUtil.convertToTimeSlot(presentationDate);

        return DatetimeUtil.getTimeOptions()
          .filter((hourOption: string) => {
            const start = DatetimeUtil.getMomentByFormat(`${presentationDatestr} ${hourOption}`, `${DateConstants.dateFormat} ${DateConstants.hourFormat}`);
            const end = DatetimeUtil.addToMoment(start, 1, 'hour');

            const slot = {
              _id: 'dummy id',
              start,
              end,
            }

            return DatetimeUtil.doesCover(presentationDateSlot, slot);
          })
      }
    }
    return [];
  }

  getAvailableFaculties() {
    return this.props.faculties.filter(faculty => this.isAvailable(faculty._id));
  }

  private isAvailable(fid: string) {
    // Check if specified faculty has availableSlot instance
    const availableSlot = this.props.availableSlots.find(slot => slot.faculty === fid);
    if (!availableSlot) {
      return false;
    }

    const presentationSlot = DatetimeUtil.convertToTimeSlot(this.props.schedulingPresentation);

    // Check if specified faculty is available on specified time
    const isFacultyAvailable = availableSlot.availableSlots
      .map(DatetimeUtil.convertToTimeSlot)
      .filter(slot => DatetimeUtil.doesCover(slot, presentationSlot))
      .length > 0;

    if (!isFacultyAvailable) {
      return false;
    }

    // Check if other group is requesting the faculty
    const isOtherGroupRequesting = this.props.presentations
      .filter(presentation => presentation._id !== this.props.schedulingPresentation._id)
      .filter(presentation => presentation.faculties.indexOf(fid) >= 0)
      .map(DatetimeUtil.convertToTimeSlot)
      .filter(slot => DatetimeUtil.doesOverlap(slot, presentationSlot))
      .length > 0;
    if (isOtherGroupRequesting) {
      return false;
    }

    return true;
  }

  handleSubmit(diff: number) {
    this.props.form.validateFields((err, values) => {
      if (err) {
        return;
      }

      const externalFaculties: ExternalFaculty[] = Object.entries(values.externalFaculties)
        .map(([_id, externalFaculty]) => externalFaculty as ExternalFaculty);

      this.props.setExternalFaculty(externalFaculties, diff);
    })
  }

  is4FacultiesPicked() {
    const { schedulingPresentation } = this.props;
    return schedulingPresentation.faculties.length + schedulingPresentation.externalFaculties.length >= 4;
  }

  isSD2FacultyPicked() {
    return this.props.schedulingPresentation.faculties.indexOf(this.props.adminFaculty._id) >= 0;
  }

  render() {
    const { presentationDatestr, schedulingPresentation } = this.props;

    let availableFaculties: Faculty[] = [];
    if (schedulingPresentation.start) {
      availableFaculties = this.getAvailableFaculties();
    }

    return (
      <div>
        <p>Please select the date you would like to do presentation.</p>
        <div className="section date-container">
          {
            this.props.presentationDate.dates
              .map((date: TimeSlotLikeObject) => (
                <CardInfo
                  key={date._id}
                  onClick={e => this.onDateClicked(date)}
                  isSelected={DatetimeUtil.formatISOString(date.start, DateConstants.dateFormat) === presentationDatestr}
                  title={DatetimeUtil.formatISOString(date.start, DateConstants.dateFormat)}
                  description={`${DatetimeUtil.formatISOString(date.start, DateConstants.hourMinFormat)} - ${DatetimeUtil.formatISOString(date.end, DateConstants.hourMinFormat)}`}
                />
              ))
          }
        </div>
        {presentationDatestr && (
          <div className="section">
            <p>
              Please select the time to start presentation.&nbsp;
              <a href="/calendar" target="_blank">
                Check faculty's schedule
              </a>
            </p>
            <Select
              style={{ width: '500px' }}
              onChange={this.onHourOptionChanged}
              value={schedulingPresentation.start ? DatetimeUtil.formatISOString(schedulingPresentation.start, DateConstants.hourFormat) : undefined}
              placeholder="9:00 AM"
            >
              {
                this.getHourOption()
                  .map(hourOption => (
                    <Select.Option
                      key={hourOption}
                      value={hourOption}
                    >
                      {hourOption}
                    </Select.Option>
                  ))
              }
            </Select>
          </div>
        )}
        {schedulingPresentation.start && (
          <div className="section">
            <p>
              <span className={this.is4FacultiesPicked() ? 'success' : ''}>
                <Icon type="check-circle-o" />
                &nbsp;Select 4 faculties<br />
              </span>
              <span className={this.isSD2FacultyPicked() ? 'success' : ''}>
                <Icon type="check-circle-o" />
                &nbsp;Select your SD faculty
                  </span>
            </p>
            <h3>CSEE faculties</h3>
            <p>Please select faculties to invite your presentations.</p>
            <div className="section">
              {availableFaculties.map(faculty => (
                <Checkbox
                  key={faculty._id}
                  className="section"
                  checked={schedulingPresentation.faculties.indexOf(faculty._id) >= 0}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.props.presentationFacultyPicked(e.target.checked, faculty._id)}
                >
                  Dr. {faculty.firstName} {faculty.lastName}
                  {faculty.isAdmin && (
                    <span>(SD Faculty)</span>
                  )}
                </Checkbox>
              ))}
              {availableFaculties.length === 0 && (
                <p>No facultis are available at specified time. Please change the time.</p>
              )}
            </div>
            <h3>Other department faculties</h3>
            <p>If you need to invite other department's faculty, please add them below.</p>
            <Form>
              {this.props.schedulingPresentation.externalFaculties.length === 0 && (
                <Form.Item>
                  No other department faculty is registered.
                </Form.Item>
              )}
              {this.props.schedulingPresentation.externalFaculties.map(faculty => (
                <div
                  key={faculty._id}
                  style={{ display: 'flex', flexDirection: 'row' }}
                >
                  <Form.Item
                    style={{ width: '0' }}
                  >
                    {this.props.form.getFieldDecorator(`externalFaculties[${faculty._id}]._id`, {
                      initialValue: faculty._id,
                    })(
                      <Input disabled />
                    )}
                  </Form.Item>
                  <Form.Item
                    style={{ marginRight: '8px' }}
                  >
                    {this.props.form.getFieldDecorator(`externalFaculties[${faculty._id}].firstName`, {
                      rules: [{
                        required: true,
                        message: 'Please enter first name',
                      }],
                      initialValue: faculty.firstName,
                    })(
                      <Input
                        placeholder="First name"
                      />
                    )}
                  </Form.Item>
                  <Form.Item
                    style={{ marginRight: '8px' }}
                  >
                    {this.props.form.getFieldDecorator(`externalFaculties[${faculty._id}].lastName`, {
                      rules: [{
                        required: true,
                        message: 'Please enter last name',
                      }],
                      initialValue: faculty.lastName,
                    })(
                      <Input
                        placeholder="Last name"
                      />
                    )}
                  </Form.Item>
                  <Form.Item
                    style={{ marginRight: '8px' }}
                  >
                    {this.props.form.getFieldDecorator(`externalFaculties[${faculty._id}].email`, {
                      rules: [{
                        required: true,
                        message: 'Please enter email',
                      }, {
                        type: 'email',
                        message: 'Please enter valid email',
                      }],
                      initialValue: faculty.email,
                    })(
                      <Input
                        placeholder="Email"
                      />
                    )}
                  </Form.Item>
                  <Form.Item
                    style={{ marginRight: '8px' }}
                  >
                    <Button
                      icon="delete"
                      shape="circle"
                      onClick={e => this.props.deleteExternalFaculty(faculty._id)}
                    />
                  </Form.Item>
                </div>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  style={{ width: '300px' }}
                  onClick={this.props.addExternalFaculty}
                >
                  <Icon type="plus" /> Add new other department faculty
                </Button>
              </Form.Item>
            </Form>
          </div>
        )}
        <style jsx>{`
          .section {
            margin-bottom: 16px;
          }
          .success {
            color: #52c41a;
          }
          .date-container {
            display: flex;
            flex-wrap: wrap;
            // Add a gap when admin faculties display in multiple lines
            margin-top: -16px;
          }
        `}</style>
      </div>
    );
  }
}

export default Form.create()(SelectDatetime);