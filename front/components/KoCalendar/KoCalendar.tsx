import * as React from 'react';
import { Moment } from 'moment-timezone';

import Event from '../../models/Event';
import AvailableSlot from '../../models/AvailableSlot';
import Ruler from './Ruler';
import Day from './Day';
import DatetimeUtil from '../../utils/DatetimeUtil';
import PresentationDate from '../../models/PresentationDate';

interface KoCalendarProps {
  presentationDates: PresentationDate[];
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
    let startTime = 24;
    let endTime = -1;

    this.props.presentationDates.forEach(date => {
      const s = parseInt(DatetimeUtil.formatDate(date.start, 'H'));
      const e = parseInt(DatetimeUtil.formatDate(date.end, 'H'));

      startTime = Math.min(startTime, s);
      endTime = Math.max(endTime, e);
    });

    const ruler = DatetimeUtil.createHoursArray(startTime, endTime);

    return (
      <div className="ko-calendar_wrapper">
        <Ruler
          ruler={ruler}
        />
        {/* 
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
        ))} */}
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

