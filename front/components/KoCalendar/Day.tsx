import * as React from 'react';
import { Moment } from 'moment-timezone';

import { Constants } from './Constants';
import Event from './Event';
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
        <style jsx>{`
          .ko-day_container {
            width: ${Constants.dayColumnWidth};
            position: relative;
          }
        `}
        </style>
      </div>
    );
  }
}
