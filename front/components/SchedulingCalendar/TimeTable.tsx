import * as React from 'react';

import TimeSlot from '../../models/TimeSlot';
import DatetimeUtil from '../../utils/DatetimeUtil';
import Faculty from '../../models/Faculty';
import AvailableSlot from '../../models/AvailableSlot';
import Presentation from '../../models/Presentation';
import TimeTableHeader from './TimeTableHeader';
import FacultySchedule from './FacultySchedule';

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

    return (
      <div>
        <TimeTableHeader
          hoursArray={hoursArray}
        />
        {this.props.faculties.map(faculty => {
          let availableSlots: TimeSlot[] = [];
          const index = this.props.availableSlots.findIndex(slot => slot.faculty === faculty._id);
          if (index >= 0) {
            availableSlots = this.props.availableSlots[index].availableSlots.map(slot => {
              return {
                _id: slot._id,
                start: DatetimeUtil.getMomentFromISOString(slot.start),
                end: DatetimeUtil.getMomentFromISOString(slot.end),
              }
            });
          }

          let presentations = this.props.presentations.filter(presentation => {
            return presentation.faculties.indexOf(faculty._id) >= 0
          })
          .filter(presentation => {
            const t = {
              _id: presentation._id,
              start: DatetimeUtil.getMomentFromISOString(presentation.start),
              end: DatetimeUtil.getMomentFromISOString(presentation.end),
            };
            return DatetimeUtil.doesOverlap(this.props.presentationDate, t);
          });
          
          return <FacultySchedule
            faculty={faculty}
            hoursArray={hoursArray}
            availableSlots={availableSlots}
            presentations={presentations}
          />
        })}
      </div>
    );
  }
}
