import * as React from 'react';
import { Moment } from 'moment';

import Event from './Event';
import Ruler from './Ruler';

interface KoCalendarProps {
  timezone: string;
  dates: Moment[];
  startTime: number;
  endTime: number;
  dateFormat: string;
  events: Event[];
  eventItem: (event: Event, style: any) => JSX.Element
}
interface KoCalendarState { }

export default class KoCalendar extends React.Component<KoCalendarProps, KoCalendarState> {
  constructor(props: KoCalendarProps) {
    super(props);

  }

  render() {
    return (
      <div className="ko-calendar_wrapper">
        This is available calendar component
        <Ruler 
          startTime={this.props.startTime}
          endTime={this.props.endTime}
        />
        <style jsx>{`
          .ko-calendar_wrapper {
            position: relative;
            display: grid;
            margin: 0 16px;
            width: 100%;
            overflow-x: scroll
          }
        `}
        </style>
      </div>
    );
  }
}

