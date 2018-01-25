import * as React from 'react';
import { Moment } from 'moment-timezone';

import Event from '../../models/Event';
import AvailableSlot from '../../models/AvailableSlot';
import Ruler from './Ruler';
import Day from './Day';
import DatetimeUtil from '../../utils/DatetimeUtil';

interface KoCalendarProps {
  timezone: string;
  dates: Moment[];
  startTime: number;
  endTime: number;
  dateFormat: string;
  events: Event[];
  eventItem: (event: Event, style: any) => JSX.Element
  availableSlots: AvailableSlot[]
  onAvailableSlotChange: (updatedAvailableSlot: AvailableSlot, isDelete: boolean) => void;
}
interface KoCalendarState { }

export default class KoCalendar extends React.Component<KoCalendarProps, KoCalendarState> {
  constructor(props: KoCalendarProps) {
    super(props);

  }

  render() {
    const hours = DatetimeUtil.createHoursArray(this.props.startTime, this.props.endTime);

    return (
      <div className="ko-calendar_wrapper">
        <Ruler
          hours={hours}
        />
        {this.props.dates.map((date, index) => (
          <Day 
            key={date.valueOf()}
            timezone={this.props.timezone}
            date={date}
            hours={hours}
            dateFormat={this.props.dateFormat}
            events={this.props.events}
            isLastColumn={index === this.props.dates.length - 1}
            eventItem={this.props.eventItem}
            availableSlots={this.props.availableSlots}
            onAvailableSlotChange={this.props.onAvailableSlotChange}
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

