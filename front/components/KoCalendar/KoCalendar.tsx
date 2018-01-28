import * as React from 'react';

import Presentation from '../../models/Presentation';
import Ruler from './Ruler';
import Day from './Day';
import DatetimeUtil from '../../utils/DatetimeUtil';
import TimeSlot from '../../models/TimeSlot';

interface KoCalendarProps {
  presentationDates: TimeSlot[];
  presentations: Presentation[];
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
        {this.props.presentationDates.map((presentationDate, index) => {
          const availableSlots = this.props.availableSlots.filter(slot => DatetimeUtil.doesOverlap(slot, presentationDate))
          const presentations = this.props.presentations.filter(p => {
            const pSlot = {
              _id: p._id,
              start: p.start,
              end: p.end
            };
            return DatetimeUtil.doesOverlap(pSlot, presentationDate);
          });
          return (
            <Day
              key={presentationDate._id}
              presentationDate={presentationDate}
              ruler={ruler}
              isLastColumn={index === this.props.presentationDates.length - 1}
              presentations={presentations}
              availableSlots={availableSlots}
              onAvailableSlotChange={this.props.onAvailableSlotChange}
            />
          )
        })}
        <style jsx>{`
          .ko-calendar_wrapper {
            position: relative;
            display: flex;
            justify-content: flex-start;
            width: 100%;
            overflow-x: scroll;
            padding-bottom: 15px;
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

