import * as React from 'react';

import TimeSlot from '../../models/TimeSlot';
import DatetimeUtil from '../../utils/DatetimeUtil';
import Faculty from '../../models/Faculty';
import AvailableSlot from '../../models/AvailableSlot';
import Presentation from '../../models/Presentation';
import { SchedulingCalendarConstants, DateConstants } from '../../models/Constants';

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
        {/* Create TimeTableHeader component? */}
        <div style={{ display: 'flex' }}>
          {hoursArray.map(hour => (
            <div style={{ width: SchedulingCalendarConstants.columnWidth }}>
              {DatetimeUtil.convertTo12Hr(hour)}
            </div>
          ))}
        </div>
        <style jsx>{`
          .cell {
            width: ${SchedulingCalendarConstants.columnWidth};
          }
        `}</style>
      </div>
    );
  }
}
