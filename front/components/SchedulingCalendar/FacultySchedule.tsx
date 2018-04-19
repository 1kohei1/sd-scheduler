import * as React from 'react';
import { Moment } from 'moment';

import Faculty from '../../models/Faculty';
import TimeSlot from '../../models/TimeSlot';
import Presentation from '../../models/Presentation';
import DatetimeUtil from '../../utils/DatetimeUtil';
import { SchedulingCalendarConstants, DateConstants } from '../../models/Constants';
import HourLines from './HourLines';
import AvailableSlots from './AvailableSlots';
import PresentationSlot from './PresentationSlots';

export interface FacultyScheduleProps {
  faculty: Faculty;
  hoursArray: number[];
  availableSlots: TimeSlot[];
  presentations: Presentation[];
  presentationDate: TimeSlot;
  isLastFaculty: boolean;
}

export default class FacultySchedule extends React.Component<FacultyScheduleProps, any> {
  render() {
    return (
      <div className="ko-faculty-schedule">
        <HourLines
          {...this.props}
        />
        <AvailableSlots
          {...this.props}
        />
        <PresentationSlot
          {...this.props}
        />

        <style jsx>{`
          .ko-faculty-schedule {
            position: relative;
            height: ${SchedulingCalendarConstants.rowHeight};
            width: ${SchedulingCalendarConstants.columnWidthNum * this.props.hoursArray.length}px;
          }
        `}</style>
      </div>
    );
  }
}
