import * as React from 'react';

import { KoCalendarConstants } from '../../models/Constants';
import TimeSlot from '../../models/TimeSlot';
import DatetimeUtil from '../../utils/DatetimeUtil';
import AvailableSlotTile from './AvailableSlotTile';

export interface AvailableSlotsProps {
  ruler: number[];
  availableSlots: TimeSlot[];
  onAvailableSlotChange: (updatedAvailableSlot: TimeSlot, isDelete: boolean) => void;
}

export default class AvailableSlots extends React.Component<AvailableSlotsProps, any> {
  render() {
    return (
      <div className="ko-availableslots_wrapper">
        {this.props.availableSlots.map(slot => (
          <AvailableSlotTile
            slot={slot}
            ruler={this.props.ruler}
            onAvailableSlotChange={this.props.onAvailableSlotChange}
          />
        ))}
        <style jsx>{`
          .ko-availableslots_wrapper {
            position: absolute;
            left: 0;
            top: calc(${KoCalendarConstants.dayTitleHeight} - 1px);
            height: calc(100% - ${KoCalendarConstants.dayTitleHeight});
            width: 100%;
            z-index: 1;
          }
        `}
        </style>
      </div>
    );
  }
}
