import * as React from 'react';

import Event from '../../models/Event';
import Ruler from './Ruler';
import Day from './Day';
import DatetimeUtil from '../../utils/DatetimeUtil';
import TimeSlot from '../../models/TimeSlot';

interface KoCalendarProps {
  presentationDates: TimeSlot[];
  events: Event[];
  eventItem: (event: Event, style: any) => JSX.Element
  availableSlots: TimeSlot[]
  onAvailableSlotChange: (updatedAvailableSlot: TimeSlot, isDelete: boolean) => void;
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
        {this.props.presentationDates.map((presentationDate, index) => (
          <Day
            key={presentationDate._id}
            presentationDate={presentationDate}
            ruler={ruler}
            isLastColumn={index === this.props.presentationDates.length - 1}
            events={this.props.events}
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

