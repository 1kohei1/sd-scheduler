import * as React from 'react';
import { Moment } from 'moment';

import TimeSlot from '../../models/TimeSlot';
import { DateConstants, SchedulingCalendarConstants } from '../../models/Constants';
import AvailableSlotTile from './AvailableSlotTile';
import DatetimeUtil from '../../utils/DatetimeUtil';

export interface AailableSlotsProps {
  hoursArray: number[];
  availableSlots: TimeSlot[];
  presentationDate: TimeSlot;
  datetimePicked: (datetime: { start: Moment, end: Moment}) => void;
}

export default class AailableSlots extends React.Component<AailableSlotsProps, any> {
  constructor(props: AailableSlotsProps) {
    super(props);

    this.onClick = this.onClick.bind(this);
  }

  onClick(e: React.MouseEvent<HTMLDivElement>) {
    const { presentationDate, hoursArray } = this.props;

    const x = e.nativeEvent.offsetX;
    const startH = hoursArray[0];
    let hourlyNumber = startH + x / SchedulingCalendarConstants.columnWidthNum;
    
    if (hourlyNumber - Math.floor(hourlyNumber) >= 0.5) {
      hourlyNumber = Math.floor(hourlyNumber) + 0.5;
    } else {
      hourlyNumber = Math.floor(hourlyNumber);
    }

    // Make sure the start of the presentation has 1 hour in given hoursArray
    if (hoursArray[hoursArray.length - 1] + 1 - hourlyNumber <= 0.5) {
      hourlyNumber -= 0.5;
    }

    // Get pure diff from the start time
    const hourlyDiff = hourlyNumber - startH;

    const presentationSlot = {
      start: DatetimeUtil.addToMoment(presentationDate.start, hourlyDiff, 'h'),
      end: DatetimeUtil.addToMoment(presentationDate.start, hourlyDiff + 1, 'h'),
    }

    // Pass created the presentation range to the parent component 
    // Check if there is any presentation that overlaps in the range
    this.props.datetimePicked(presentationSlot);
  }

  render() {
    return (
      <div
        className="availableslots-wrapper"
        onClick={this.onClick}
      >
        {this.props.availableSlots.map(slot => (
          <AvailableSlotTile
            key={slot._id}
            hoursArray={this.props.hoursArray}
            availableSlot={slot}
          />
        ))}
        <style jsx>{`
          .availableslots-wrapper {
            position: absolute;
            left: 0;
            top: 0;
            height: ${SchedulingCalendarConstants.rowHeight};
            width: ${SchedulingCalendarConstants.columnWidthNum * this.props.hoursArray.length}px;
          }
        `}</style>
      </div>
    );
  }
}
