import * as React from 'react';
import { Moment } from 'moment-timezone';

import { KoCalendarConstants } from '../../models/Constants';
import Event from '../../models/Event';
import DayHeader from './DayHeader';
import DatetimeUtil from '../../utils/DatetimeUtil';
import Hourlines from './Hourlines';

export interface DayProps {
  timezone: string;
  date: Moment;
  startTime: number;
  endTime: number;
  dateFormat: string;
  events: Event[];
  isLastColumn: boolean;
  eventItem: (event: Event, style: any) => JSX.Element
}

export default class Day extends React.Component<DayProps, any> {
  constructor(props: DayProps) {
    super(props);


  }
  
  render() {
    const hours = DatetimeUtil.createHoursArray(this.props.startTime, this.props.endTime);

    return (
      <div className="ko-day_container">
        <DayHeader
          date={this.props.date}
          dateFormat={this.props.dateFormat}
        />
        <Hourlines
          isLastColumn={this.props.isLastColumn}
          hours={hours}
        />
        <div className="ko-day_mouse_target"></div>
        <style jsx>{`
          .ko-day_container {
            width: ${KoCalendarConstants.dayColumnWidth};
            position: relative;
          }
          .ko-day_mouse_target {
            position: absolute;
            left: 0;
            top: ${KoCalendarConstants.dayTitleHeight};
            height: calc(100% - ${KoCalendarConstants.dayTitleHeight});
            width: 100%;
            z-index: 2;
          }
        `}
        </style>
      </div>
    );
  }
}
