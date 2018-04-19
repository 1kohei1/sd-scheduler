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
  presentationDates: PresentationDate[];
  faculties: Faculty[];
  availableSlots: AvailableSlot[];
  presentations: Presentation[];
  facultyColumnRatio: number;
}

export default class SchedulingCalendar extends React.Component<SchedulingCalendarProps, any> {
  render() {
    return (
      <div>
        {
          DatetimeUtil.getPresentationSlots(this.props.presentationDates)
            .map((ts: TimeSlot) => (
              <CalendarBody
                key={ts._id}
                presentationDate={ts}
                faculties={this.props.faculties}
                availableSlots={this.props.availableSlots}
                presentations={this.props.presentations}
                facultyColumnRatio={this.props.facultyColumnRatio}
              />
            ))
        }
      </div>
    );
  }
}
