import * as React from 'react';
import { Moment } from 'moment-timezone';

import { KoCalendarConstants } from '../../models/Constants';
import Presentation from '../../models/Presentation';
import DayHeader from './DayHeader';
import Hourlines from './Hourlines';
import AvailableSlots from './AvailableSlots';
import PresentationSlots from './PresentationSlots';
import TimeSlot from '../../models/TimeSlot';

export interface DayProps {
  presentationDate: TimeSlot;
  ruler: number[];
  isLastColumn: boolean;
  presentations: Presentation[];
  availableSlots: TimeSlot[]
  onAvailableSlotChange: (updatedAvailableSlot: TimeSlot, isDelete: boolean) => void;
}

export default class Day extends React.Component<DayProps, any> {
  constructor(props: DayProps) {
    super(props);
  }
  
  render() {
    return (
      <div className="ko-day_container">
        <DayHeader
          presentationDate={this.props.presentationDate}
        />
        <Hourlines
          presentationDate={this.props.presentationDate}
          isLastColumn={this.props.isLastColumn}
          ruler={this.props.ruler}
        />
        <AvailableSlots
          ruler={this.props.ruler}
          availableSlots={this.props.availableSlots}
          presentationDate={this.props.presentationDate}
          onAvailableSlotChange={this.props.onAvailableSlotChange}
        />
        <PresentationSlots 
          ruler={this.props.ruler}
          presentations={this.props.presentations}
        />
        <style jsx>{`
          .ko-day_container {
            width: ${KoCalendarConstants.dayColumnWidth};
            position: relative;
          }
        `}
        </style>
      </div>
    );
  }
}
