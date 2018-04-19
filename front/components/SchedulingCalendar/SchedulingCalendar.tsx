import * as React from 'react';
import { Moment } from 'moment';

import Faculty from '../../models/Faculty';
import AvailableSlot from '../../models/AvailableSlot';
import Presentation from '../../models/Presentation';
import FacultyColumn from './FacultyColumn';
import CalendarBody from './CalendarBody';
import DatetimeUtil from '../../utils/DatetimeUtil';
import { DateConstants } from '../../models/Constants';
import TimeSlot from '../../models/TimeSlot';
import PresentationDate from '../../models/PresentationDate';

export interface SchedulingCalendarProps {
  presentationDate: PresentationDate;
  faculties: Faculty[];
  availableSlots: AvailableSlot[];
  presentations: Presentation[];
  facultyColumnRatio: number;
}

export default class SchedulingCalendar extends React.Component<SchedulingCalendarProps, any> {
  render() {
    return (
      <div>
        {this.props.presentationDate.dates.map(date => {
          const presentationDate = DatetimeUtil.convertToTimeSlot(date);

          return (
            <CalendarBody
              key={date._id}
              presentationDate={presentationDate}
              faculties={this.props.faculties}
              availableSlots={this.props.availableSlots}
              presentations={this.props.presentations}
              facultyColumnRatio={this.props.facultyColumnRatio}
            />
          )
        })}
      </div>
    );
  }
}
