import * as React from 'react';

import { KoCalendarConstants } from '../../models/Constants';
import Presentation from '../../models/Presentation';
import TimeSlot from '../../models/TimeSlot';
import DatetimeUtil from '../../utils/DatetimeUtil';

export interface PresentationSlotsProps {
  ruler: number[];
  presentations: Presentation[];
  presentationDate: TimeSlot;
}

export default class PresentationSlots extends React.Component<PresentationSlotsProps, any> {
  render() {
    return (
      <div className="ko-presentationslot_wrapper">
        
        <style jsx>{`
          .ko-presentationslot_wrapper {
            position: absolute;
            left: 0;
            top: ${KoCalendarConstants.dayTitleHeight};
            height: calc(100% - ${KoCalendarConstants.dayTitleHeight} - 1px);
            width: 100%;
            z-index: 3;
          }
        `}
        </style>
      </div>
    );
  }
}
