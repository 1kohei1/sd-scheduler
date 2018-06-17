import * as React from 'react';

import Faculty from '../../models/Faculty';
import TimeSlot from '../../models/TimeSlot';
import Presentation from '../../models/Presentation';
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
  colorsByAdmin: { [key: string]: string };
}

export default class FacultySchedule extends React.Component<FacultyScheduleProps, any> {
  render() {
    return (
      <div className="ko-faculty-schedule">
        <HourLines
          hoursArray={this.props.hoursArray}
          isLastFaculty={this.props.isLastFaculty}
        />
        <AvailableSlots
          hoursArray={this.props.hoursArray}
          availableSlots={this.props.availableSlots}
          presentationDate={this.props.presentationDate}
        />
        <PresentationSlot
          hoursArray={this.props.hoursArray}
          presentations={this.props.presentations}
          colorsByAdmin={this.props.colorsByAdmin}
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
