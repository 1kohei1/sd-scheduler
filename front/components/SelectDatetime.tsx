import * as React from 'react';
import { Select, Checkbox, Icon } from 'antd';

import PresentationDate from '../models/PresentationDate';
import Faculty from '../models/Faculty';
import AvailableSlot from '../models/AvailableSlot';
import Presentation from '../models/Presentation';
import TimeSlot from '../models/TimeSlot';
import DatetimeUtil, { TimeSlotLikeObject } from '../utils/DatetimeUtil';
import CardInfo from './CardInfo';
import { DateConstants } from '../models/Constants';

export interface SelectDatetimeProps {
  presentationDate: PresentationDate;
  faculties: Faculty[];
  availableSlots: AvailableSlot[];
  presentations: Presentation[];
  adminFaculty: Faculty;
  schedulingPresentation: Presentation;
  presentationDatestr: string;
  presentationDatestrPicked: (dateStr: string) => void;
  presentationDatetimePicked: (start: string, end: string) => void;
  presentationFacultyPicked: (checked: boolean, fid: string) => void;
}

export default class SelectDatetime extends React.Component<SelectDatetimeProps, any> {
  constructor(props: SelectDatetimeProps) {
    super(props);

    this.onDateClicked = this.onDateClicked.bind(this);
    this.onHourMinOptionChanged = this.onHourMinOptionChanged.bind(this);
  }

  onDateClicked(date: TimeSlotLikeObject) {
    const dateStr = DatetimeUtil.formatISOString(date.start, DateConstants.dateFormat);
    this.props.presentationDatestrPicked(dateStr);
  }

  onHourMinOptionChanged(val: string) {
    const { presentationDatestr } = this.props;

    if (presentationDatestr) {
      const start = DatetimeUtil.getMomentByFormat(`${presentationDatestr} ${val}`, `${DateConstants.dateFormat} ${DateConstants.hourMinFormat}`);
      const end = DatetimeUtil.addToMoment(start, 1, 'hour');

      this.props.presentationDatetimePicked(start.toISOString(), end.toISOString())
    }
  }

  private getHourMinOption() {
    const { presentationDatestr } = this.props;

    if (presentationDatestr) {
      const presentationDate = this.props.presentationDate.dates
        .find(date => DatetimeUtil.formatISOString(date.start, DateConstants.dateFormat) === presentationDatestr)

      if (presentationDate) {
        const presentationDateSlot = DatetimeUtil.convertToTimeSlot(presentationDate);

        return DatetimeUtil.getTimeOptions(true)
          .filter((hourMinOption: string) => {
            const start = DatetimeUtil.getMomentByFormat(`${presentationDatestr} ${hourMinOption}`, `${DateConstants.dateFormat} ${DateConstants.hourMinFormat}`);
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

    // Check if same admin presentation overlaps
    const isSameAdminOtherGroupRequesting = this.props.presentations
      .filter(presentation => presentation.faculties.indexOf(fid) >= 0)
      .filter(presentation => presentation.group.adminFaculty === this.props.adminFaculty._id)
      .map(DatetimeUtil.convertToTimeSlot)
      .filter(slot => DatetimeUtil.doesOverlap(slot, presentationSlot))
      .length > 0;
    if (isSameAdminOtherGroupRequesting) {
      return false;
    }

    // Check if different admin group is requesting
    // In that case, the faculty must have 30 minutes break between this presentation
    const isDifferentAdminGroupRequesting = this.props.presentations
      .filter(presentation => presentation.faculties.indexOf(fid) >= 0)
      .filter(presentation => presentation.group.adminFaculty === this.props.adminFaculty._id)
      .map(DatetimeUtil.convertToTimeSlot)
      // Add 30 minutes gap for different admin presentations
      .map((slot: TimeSlot) => {
        slot.start = DatetimeUtil.addToMoment(slot.start, -30, 'minutes');
        slot.end = DatetimeUtil.addToMoment(slot.start, 30, 'minutes');
        return slot;
      })
      .filter(slot => DatetimeUtil.doesOverlap(slot, presentationSlot))
      .length > 0;
    if (isDifferentAdminGroupRequesting) {
      return false;
    }

    return true;
  }

  is4FacultiesPicked() {
    return this.props.schedulingPresentation.faculties.length >= 4;
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
              onChange={this.onHourMinOptionChanged}
              value={schedulingPresentation.start ? DatetimeUtil.formatISOString(schedulingPresentation.start, DateConstants.hourMinFormat) : undefined}
              placeholder="9:00 AM"
            >
              {
                this.getHourMinOption()
                  .map(hourMinOption => (
                    <Select.Option
                      key={hourMinOption}
                      value={hourMinOption}
                    >
                      {hourMinOption}
                    </Select.Option>
                  ))
              }
            </Select>
          </div>
        )}
        {schedulingPresentation.start && (
          <div className="section">
            {availableFaculties.length === 0 && (
              <div>
                <p>No faculties are available at specified time.</p>
                <p>Please check&nbsp;
                  <a href="/calendar" target="_blank">
                    faculty's schedule
                  </a>
                </p>
              </div>
            )}
            {availableFaculties.length > 0 && (
              <div>
                <p>Please select faculties to invite your presentations.</p>
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
              </div>
            )}
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
