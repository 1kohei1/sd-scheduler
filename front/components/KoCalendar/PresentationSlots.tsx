import * as React from 'react';

import { KoCalendarConstants } from '../../models/Constants';
import PresentationSlotTile from './PresentationSlotTile';
import Presentation from '../../models/Presentation';
import Location from '../../models/Location';

export interface PresentationSlotsProps {
  ruler: number[];
  presentations: Presentation[];
  locations: Location[];
}

export default class PresentationSlots extends React.Component<PresentationSlotsProps, any> {
  render() {
    return (
      <div className="ko-presentationslot_wrapper">
        {this.props.presentations.map(presentation => (
          <PresentationSlotTile 
            key={presentation._id}
            ruler={this.props.ruler}
            presentation={presentation}
            locations={this.props.locations}
          />
        ))}
        <style jsx>{`
          .ko-presentationslot_wrapper {
            position: absolute;
            left: 0;
            top: ${KoCalendarConstants.dayTitleHeight};
            height: calc(100% - ${KoCalendarConstants.dayTitleHeight} - 1px);
            width: 100%;
          }
        `}
        </style>
      </div>
    );
  }
}
