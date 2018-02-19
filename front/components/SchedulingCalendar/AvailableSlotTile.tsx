import * as React from 'react';

import TimeSlot from '../../models/TimeSlot';
import DatetimeUtil from '../../utils/DatetimeUtil';
import { SchedulingCalendarConstants } from '../../models/Constants';

export interface AvailableSlotTileProps {
  hoursArray: number[];
  availableSlot: TimeSlot;
}

export default class AvailableSlotTile extends React.Component<AvailableSlotTileProps, any> {
  render() {
    const { hoursArray, availableSlot } = this.props;

    const blockWidth = SchedulingCalendarConstants.columnWidthNum / 2;
    const start = DatetimeUtil.convertToHourlyNumber(availableSlot.start);
    const end = DatetimeUtil.convertToHourlyNumber(availableSlot.end);

    const left = `${(start - hoursArray[0]) * blockWidth}px`;
    const width = `${(end - start) * blockWidth}px`;

    return (
      <div className="slot-tile">
        Available
        <style jsx>{`
          .slot-tile {
            position: absolute;
            opacity: 0.8;
            left: ${left};
            width: ${width};
            background-color: ${SchedulingCalendarConstants.tileBackgroundColor};
            color: white;
            font-size: 12px;
            padding: 0 8px;
            z-index: 2;
          }
        `}</style>
      </div>
    );
  }
}
