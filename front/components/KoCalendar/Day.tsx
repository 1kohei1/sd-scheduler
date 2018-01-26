import * as React from 'react';
import { Moment } from 'moment-timezone';

import { KoCalendarConstants } from '../../models/Constants';
import Event from '../../models/Event';
import DayHeader from './DayHeader';
import Hourlines from './Hourlines';
import AvailableSlots from './AvailableSlots';
import TimeSlot from '../../models/TimeSlot';

export interface DayProps {
  presentationDate: TimeSlot;
  ruler: number[];
  isLastColumn: boolean;
  events: Event[];
  eventItem: (event: Event, style: any) => JSX.Element
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
          isLastColumn={this.props.isLastColumn}
          ruler={this.props.ruler}
        />
        <AvailableSlots
          ruler={this.props.ruler}
          availableSlots={this.props.availableSlots}
          onAvailableSlotChange={this.props.onAvailableSlotChange}
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
