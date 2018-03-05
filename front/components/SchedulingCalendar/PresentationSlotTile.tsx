import * as React from 'react';

import Presentation from '../../models/Presentation';
import { SchedulingCalendarConstants } from '../../models/Constants';
import DatetimeUtil from '../../utils/DatetimeUtil';

export interface PresentationSlotTileProps {
  hoursArray: number[];
  presentation: Presentation;
}

export default class PresentationSlotTile extends React.Component<PresentationSlotTileProps, any> {
  render() {
    const { presentation } = this.props;

    const timeSlot = DatetimeUtil.convertToTimeSlot(presentation);
    const startHourNumber = DatetimeUtil.convertToHourlyNumber(timeSlot.start);
    const left = `${(startHourNumber - this.props.hoursArray[0]) * SchedulingCalendarConstants.columnWidthNum}px`

    let text = `Group ${presentation.group.groupNumber}`;
    if (!presentation.group.groupNumber) {
      text = 'Your group';
    }

    return (
      <div className={`presentationslottile ${presentation.group.groupNumber ? 'default-group' : 'your-group'}`}>
        {text}
        <style jsx>{`
          .presentationslottile {
            position: absolute;
            left: ${left};
            width: ${SchedulingCalendarConstants.columnWidth};
            height: ${SchedulingCalendarConstants.tileHeight};
            opacity: 0.8;
            font-size: 12px;
            padding: 0 8px;
          }
          .default-group {
            background-color: ${SchedulingCalendarConstants.presentationTileDefaultGroup}
          }
          .your-group {
            background-color: ${SchedulingCalendarConstants.presentationTileYouGroup}
          }
        `}</style>
      </div>
    );
  }
}
