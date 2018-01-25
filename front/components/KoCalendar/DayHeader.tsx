import * as React from 'react';
import { Moment } from 'moment-timezone';

import { KoCalendarConstants } from '../../models/Constants';
import DatetimeUtil from '../../utils/DatetimeUtil';

export interface DayHeaderProps {
  date: Moment;
  dateFormat: string;
}

export default class DayHeader extends React.Component<DayHeaderProps, any> {
  render() {
    return (
      <div className="ko-day_header">
        {DatetimeUtil.convertToFormat(this.props.date, this.props.dateFormat)}
        <style jsx>{`
          .ko-day_header {
            width: ${KoCalendarConstants.dayColumnWidth};
            height: calc(${KoCalendarConstants.dayTitleHeight} - 1px);
            text-align: center;
            border-bottom: 1px solid #ccc;
          }
        `}
        </style>
      </div>
    );
  }
}
