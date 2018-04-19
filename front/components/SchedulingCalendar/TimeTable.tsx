import * as React from 'react';
import { Moment } from 'moment';

import TimeSlot from '../../models/TimeSlot';
import DatetimeUtil from '../../utils/DatetimeUtil';
import Faculty from '../../models/Faculty';
import AvailableSlot from '../../models/AvailableSlot';
import Presentation from '../../models/Presentation';
import TimeTableHeader from './TimeTableHeader';
import FacultySchedule from './FacultySchedule';
import { SchedulingCalendarConstants } from '../../models/Constants';

export interface TimeTableProps {
  presentationDate: TimeSlot;
  faculties: Faculty[];
  availableSlots: AvailableSlot[];
  presentations: Presentation[];
}

export default class TimeTable extends React.Component<TimeTableProps, any> {
  render() {
    const { presentationDate } = this.props;
    const startTime = DatetimeUtil.convertToHourlyNumber(presentationDate.start);
    const endTime = DatetimeUtil.convertToHourlyNumber(presentationDate.end);

    const hoursArray = DatetimeUtil.createHoursArray(startTime, endTime);

    const { 
      containerWidthNum,
      containerLeftPaddingNum,
      containerRightPaddingNum,
      facultyColumnWidthNum
    } = SchedulingCalendarConstants;
    const timeTableWidth = `${containerWidthNum - containerLeftPaddingNum - containerRightPaddingNum - facultyColumnWidthNum}px`;

    return (
      <div className="time-table">
        <TimeTableHeader
          hoursArray={hoursArray}
        />
        {this.props.faculties.map((faculty, i) => {
          let availableSlots: TimeSlot[] = [];
          const index = this.props.availableSlots.findIndex(slot => slot.faculty === faculty._id);
          if (index >= 0) {
            availableSlots = this.props.availableSlots[index].availableSlots.map(DatetimeUtil.convertToTimeSlot);
          }

          availableSlots = availableSlots.filter(slot => DatetimeUtil.doesOverlap(slot, this.props.presentationDate));

          let presentations = this.props.presentations.filter(presentation => {
            return presentation.faculties.indexOf(faculty._id) >= 0
          })
            .filter(presentation => {
              const t = DatetimeUtil.convertToTimeSlot(presentation);
              return DatetimeUtil.doesOverlap(this.props.presentationDate, t);
            });

          return <FacultySchedule
            key={faculty._id}
            faculty={faculty}
            hoursArray={hoursArray}
            availableSlots={availableSlots}
            presentations={presentations}
            presentationDate={this.props.presentationDate}
            isLastFaculty={i === this.props.faculties.length - 1}
          />
        })}
        <style jsx>{`
          .time-table {
            min-width: ${timeTableWidth};
            overflow: scroll;
          }
        `}</style>
      </div>
    );
  }
}
