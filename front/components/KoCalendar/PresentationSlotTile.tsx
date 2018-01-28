import * as React from 'react';

import { KoCalendarConstants } from '../../models/Constants';
import DatetimeUtil from '../../utils/DatetimeUtil';
import Presentation from '../../models/Presentation';
import TimeSlot from '../../models/TimeSlot';

export interface PresentationSlotTileProps {
  ruler: number[];
  presentation: Presentation;
}

export default class PresentationSlotTile extends React.Component<PresentationSlotTileProps, any> {
  render() {
    let hour = parseInt(DatetimeUtil.formatDate(this.props.presentation.start, 'H'));
    let min = parseInt(DatetimeUtil.formatDate(this.props.presentation.start, 'm')) / 60;
    const start = hour + min;
    
    // It's supposed to be one hour. But, let's just compute here
    hour = parseInt(DatetimeUtil.formatDate(this.props.presentation.end, 'H'));
    min = parseInt(DatetimeUtil.formatDate(this.props.presentation.end, 'm')) / 60;
    const end = hour + min;
    
    const topOffset = `${(start - this.props.ruler[0]) * KoCalendarConstants.rulerColumnHeightNum}px`;
    const height = `${(end - start) * KoCalendarConstants.rulerColumnHeightNum}px`;

    return (
      <div className="ko-presentationslottile">
        <span>Group 8 presentation</span>
        <style jsx>{`
          .ko-presentationslottile {
            position: absolute;
            top: ${topOffset};
            left: 0;
            height: ${height}
            width: calc(100% - 5px);
            opacity: 0.8;
            background-color: #FFEB3B;
            font-size: 12px;
            z-index: 3;
            display: flex;
          }
          .ko-presentationslottile span {
            align-self: flex-end;
          }
        `}
        </style>
      </div>
    );
  }
}
