import * as React from 'react';

import Faculty from '../../models/Faculty';
import AvailableSlot from '../../models/AvailableSlot';
import Presentation from '../../models/Presentation';
import CalendarBody from './CalendarBody';
import DatetimeUtil from '../../utils/DatetimeUtil';
import TimeSlot from '../../models/TimeSlot';
import PresentationDate from '../../models/PresentationDate';

export interface SchedulingCalendarProps {
  presentationDates: PresentationDate[];
  faculties: Faculty[];
  availableSlots: AvailableSlot[];
  presentations: Presentation[];
  facultyColumnRatio: number;
  colorsByAdmin: { [key: string]: string };
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
                colorsByAdmin={this.props.colorsByAdmin}
              />
            ))
        }
      </div>
    );
  }
}
