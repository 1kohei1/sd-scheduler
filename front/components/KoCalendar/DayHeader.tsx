import * as React from 'react';
import { Moment } from 'moment-timezone';

import { KoCalendarConstants } from '../../models/Constants';
import DatetimeUtil from '../../utils/DatetimeUtil';
import PresentationDate from '../../models/PresentationDate';

export interface DayHeaderProps {
  presentationDate: PresentationDate;
}

export default class DayHeader extends React.Component<DayHeaderProps, any> {
  render() {
    return (
      <div className="ko-day_header">
        {DatetimeUtil.formatDate(this.props.presentationDate.start, KoCalendarConstants.dayFormat)}
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
