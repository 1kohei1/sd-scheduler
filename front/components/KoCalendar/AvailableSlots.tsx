import * as React from 'react';

import { KoCalendarConstants } from '../../models/Constants';
import TimeSlot from '../../models/TimeSlot';

export interface AvailableSlotsProps {
  availableSlots: TimeSlot[];
  onAvailableSlotChange: (updatedAvailableSlot: TimeSlot, isDelete: boolean) => void;
}

export default class AvailableSlots extends React.Component<AvailableSlotsProps, any> {
  render() {
    return (
      <div className="ko-availableslots_wrapper">
        
        <style jsx>{`
          .ko-availableslots_wrapper {
            position: absolute;
            left: 0;
            top: ${KoCalendarConstants.dayTitleHeight};
            height: calc(100% - ${KoCalendarConstants.dayTitleHeight});
            width: 100%;
            z-index: 2;
          }
        `}
        </style>
      </div>
    );
  }
}
