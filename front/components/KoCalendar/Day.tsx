import * as React from 'react';
import { Moment } from 'moment-timezone';

import { KoCalendarConstants } from '../../models/Constants';
import Event from '../../models/Event';
import DayHeader from './DayHeader';
import Hourlines from './Hourlines';
import AvailableSlots from './AvailableSlots';
import AvailableSlot from '../../models/AvailableSlot';

export interface DayProps {
  timezone: string;
  date: Moment;
  hours: number[];
  dateFormat: string;
  events: Event[];
  isLastColumn: boolean;
  eventItem: (event: Event, style: any) => JSX.Element
  availableSlots: AvailableSlot[]
  onAvailableSlotChange: (updatedAvailableSlot: AvailableSlot, isDelete: boolean) => void;
}

export default class Day extends React.Component<DayProps, any> {
  constructor(props: DayProps) {
    super(props);
  }
  
  render() {
    return (
      <div className="ko-day_container">
        <DayHeader
          date={this.props.date}
          dateFormat={this.props.dateFormat}
        />
        <Hourlines
          isLastColumn={this.props.isLastColumn}
          hours={this.props.hours}
        />
        <AvailableSlots
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
