import * as React from 'react';

import Presentation from '../../models/Presentation';
import { SchedulingCalendarConstants } from '../../models/Constants';
import PresentationSlotTile from './PresentationSlotTile';

export interface PresentationSlotsProps {
  hoursArray: number[];
  presentations: Presentation[];
  colorsByAdmin: { [key: string]: string };
}

export default class PresentationSlots extends React.Component<PresentationSlotsProps, any> {
  render() {
    return (
      <div className="presentationslots-wrapper">
        {this.props.presentations.map(presentation => (
          <PresentationSlotTile
            key={presentation._id}
            hoursArray={this.props.hoursArray}
            presentation={presentation}
            colorsByAdmin={this.props.colorsByAdmin}
          />
        ))}
        <style jsx>{`
          .presentationslots-wrapper {
            position: absolute;
            left: 0;
            top: ${SchedulingCalendarConstants.tileHeight};
            height: ${SchedulingCalendarConstants.tileHeight};
            width: 100%;
            z-index: 10;
          }
        `}</style>
      </div>
    );
  }
}
