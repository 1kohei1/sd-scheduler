import * as React from 'react';

import { KoCalendarConstants } from '../../models/Constants';
import TimeSlot from '../../models/TimeSlot';
import DatetimeUtil from '../../utils/DatetimeUtil';

export interface AvailableSlotTileProps {
  ruler: number[];
  slot: TimeSlot;
  onAvailableSlotChange: (updatedAvailableSlot: TimeSlot, isDelete: boolean) => void;
  onResizeStart: (slot: TimeSlot) => void;
  onMoveStart: (slot: TimeSlot) => void;
}

export default class AvailableSlotTile extends React.Component<AvailableSlotTileProps, any> {
  constructor(props: AvailableSlotTileProps) {
    super(props);
  }

  render() {
    let hour = parseInt(DatetimeUtil.formatDate(this.props.slot.start, 'H'));
    let min = parseInt(DatetimeUtil.formatDate(this.props.slot.start, 'm')) / 60;
    const start = hour + min;

    hour = parseInt(DatetimeUtil.formatDate(this.props.slot.end, 'H'));
    min = parseInt(DatetimeUtil.formatDate(this.props.slot.end, 'm')) / 60;
    const end = hour + min;

    const top = `${(start - this.props.ruler[0]) * KoCalendarConstants.rulerColumnHeightNum}px`;
    const height = `${(end - start) * KoCalendarConstants.rulerColumnHeightNum}px`;

    return (
      <div
        className="ko-availableslotstile"
        style={{ top, height }}
        key={this.props.slot._id}
        onMouseDown={() => this.props.onMoveStart(this.props.slot)}
      >
        <span>
          {DatetimeUtil.formatDate(this.props.slot.start, KoCalendarConstants.tileTimeFormat)}
          -
          {DatetimeUtil.formatDate(this.props.slot.end, KoCalendarConstants.tileTimeFormat)}
        </span>
        <div
          className="ko-availableslotstile_slider"
          onMouseDown={(e) => this.props.onResizeStart(this.props.slot)}>
          ...
        </div>
        <style jsx>{`
          .ko-availableslotstile {
            position: absolute;
            background-color: ${KoCalendarConstants.tileBackgroundColor};
            opacity: 0.8;
            left: 1px;
            width: calc(100% - 2px);
            color: white;
            font-size: 12px;
            padding: 0 8px;
            z-index: 2;
            cursor: -webkit-grab;
            cursor: grab;
          }
          .ko-availableslotstile_slider {
            position: absolute;
            bottom: 0;
            width: calc(100% - 16px);
            text-align: center;
            cursor: ns-resize;
          }
        `}
        </style>
      </div>
    );
  }
}
