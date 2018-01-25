import * as React from 'react';
import { Moment } from 'moment-timezone';

import Event from '../../models/Event';
import Ruler from './Ruler';
import Day from './Day';

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
        <Ruler 
          startTime={this.props.startTime}
          endTime={this.props.endTime}
        />
        {this.props.dates.map((date, index) => (
          <Day 
            key={date.valueOf()}
            timezone={this.props.timezone}
            date={date}
            startTime={this.props.startTime}
            endTime={this.props.endTime}
            dateFormat={this.props.dateFormat}
            events={this.props.events}
            isLastColumn={index === this.props.dates.length - 1}
            eventItem={this.props.eventItem}
          />
        ))}
        <style jsx>{`
          .ko-calendar_wrapper {
            position: relative;
            display: flex;
            justify-content: flex-start;
            width: 100%;
            overflow-x: scroll;
          }
        `}
        </style>
        <style jsx global>{`
          .ko-calendar_wrapper {
            color: #666;
          }
        `}
        </style>
      </div>
    );
  }
}

