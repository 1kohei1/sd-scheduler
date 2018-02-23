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
  presentationSlotPicked: (presentationSlot: TimeSlot, faculty: Faculty) => void;
}

export default class FacultySchedule extends React.Component<FacultyScheduleProps, any> {
  constructor(props: FacultyScheduleProps) {
    super(props);

    this.onClick = this.onClick.bind(this);
  }


  onClick(e: React.MouseEvent<HTMLDivElement>) {
    const { presentationDate, hoursArray } = this.props;

    const x = e.nativeEvent.offsetX;
    const startH = hoursArray[0];
    let hourlyNumber = startH + x / SchedulingCalendarConstants.columnWidthNum;

    if (hourlyNumber - Math.floor(hourlyNumber) >= 0.5) {
      hourlyNumber = Math.floor(hourlyNumber) + 0.5;
    } else {
      hourlyNumber = Math.floor(hourlyNumber);
    }

    // Make sure the start of the presentation has 1 hour in given hoursArray
    if (hoursArray[hoursArray.length - 1] + 1 - hourlyNumber <= 0.5) {
      hourlyNumber -= 0.5;
    }

    // Get pure diff from the start time
    const hourlyDiff = hourlyNumber - startH;

    const presentationSlot = {
      _id: 'dummy id',
      start: DatetimeUtil.addToMoment(presentationDate.start, hourlyDiff, 'h'),
      end: DatetimeUtil.addToMoment(presentationDate.start, hourlyDiff + 1, 'h'),
    }

    this.props.presentationSlotPicked(presentationSlot, this.props.faculty);
  }

  render() {
    return (
      <div className="ko-faculty-schedule">
        <HourLines
          {...this.props}
        />
        <AvailableSlots
          {...this.props}
          onClick={this.onClick}
        />
        <PresentationSlot
          {...this.props}
        />

        <style jsx>{`
          .ko-faculty-schedule {
            position: relative;
            height: ${SchedulingCalendarConstants.rowHeight};
          }
        `}</style>
      </div>
    );
  }
}
