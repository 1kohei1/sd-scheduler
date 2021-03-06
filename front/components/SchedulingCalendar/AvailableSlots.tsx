import * as React from 'react';

import TimeSlot from '../../models/TimeSlot';
import { SchedulingCalendarConstants } from '../../models/Constants';
import AvailableSlotTile from './AvailableSlotTile';

export interface AailableSlotsProps {
  hoursArray: number[];
  availableSlots: TimeSlot[];
  presentationDate: TimeSlot;
}

export default class AailableSlots extends React.Component<AailableSlotsProps, any> {
  render() {
    return (
      <div
        className="availableslots-wrapper"
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
            z-index: 5;
          }
        `}</style>
      </div>
    );
  }
}
