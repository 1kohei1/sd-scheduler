import * as React from 'react';

import DatetimeUtil from '../../utils/DatetimeUtil';
import { SchedulingCalendarConstants, DateConstants } from '../../models/Constants';

export interface TimeTableHeaderProps {
  hoursArray: number[];
}

export default class TimeTableHeader extends React.Component<TimeTableHeaderProps, any> {
  render() {
    const { hoursArray } = this.props;

    return (
      <div style={{ display: 'flex' }}>
        {hoursArray.map(hour => (
          <div style={{ width: SchedulingCalendarConstants.columnWidth }}>
            {DatetimeUtil.convertTo12Hr(hour)}
          </div>
        ))}
      </div>
    );
  }
}
