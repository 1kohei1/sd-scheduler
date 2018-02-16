import * as React from 'react';

import DatetimeUtil from '../../utils/DatetimeUtil';
import { SchedulingCalendarConstants } from '../../models/Constants';

export interface TimeTableHeaderProps {
  hoursArray: number[];
}

export default class TimeTableHeader extends React.Component<TimeTableHeaderProps, any> {
  render() {
    const { hoursArray } = this.props;

    return (
      <div className="time-table-header">
        {hoursArray.map(hour => (
          <div style={{ width: SchedulingCalendarConstants.columnWidth }}>
            {DatetimeUtil.convertTo12Hr(hour)}
          </div>
        ))}
        <style jsx>{`
          .time-table-header {
            display: flex;
            height: ${SchedulingCalendarConstants.rowHeight}
            line-height: ${SchedulingCalendarConstants.rowHeight}
          }
        `}
        </style>
      </div>
    );
  }
}
