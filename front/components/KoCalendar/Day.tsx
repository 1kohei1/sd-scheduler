import * as React from 'react';
import { Moment } from 'moment-timezone';

import { Constants } from './Constants';
import Event from './Event';
import DayHeader from './DayHeader';

export interface DayProps {
  timezone: string;
  date: Moment;
  startTime: number;
  endTime: number;
  dateFormat: string;
  events: Event[];
  eventItem: (event: Event, style: any) => JSX.Element
}

export default class Day extends React.Component<DayProps, any> {
  constructor(props: DayProps) {
    super(props);


  }
  
  render() {
    return (
      <div className="ko-day_container">
        <DayHeader
          date={this.props.date}
          dateFormat={this.props.dateFormat}
        />
        <style jsx>{`
          .ko-day_container {
            width: ${Constants.dayColumnWidth}
          }
        `}
        </style>
      </div>
    );
  }
}
