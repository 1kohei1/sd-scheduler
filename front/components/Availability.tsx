import * as React from 'react';
import { List } from 'immutable';
import ObjectID from 'bson-objectid';

import * as moment from 'moment-timezone';
import KoCalendar from './KoCalendar/KoCalendar';
import Event from '../models/Event';
import AvailableSlot from '../models/AvailableSlot';
import { DateConstants } from '../models/Constants';
import { Semester } from '../models/Semester';

export interface AvailabilityProps {
  semester: Semester;
}

interface AvailableState {
  events: List<Event>;
  availableSlots: List<AvailableSlot>;
}

export default class Availability extends React.Component<AvailabilityProps, AvailableState> {
  constructor(props: AvailabilityProps) {
    super(props);

    this.state = {
      events: List([]),
      availableSlots: List([])
    };

    this.eventItem = this.eventItem.bind(this);
    this.onAvailableSlotChange = this.onAvailableSlotChange.bind(this);
  }

  eventItem(event: any, style: any) {
    return (
      <div>Item</div>
    )
  }

  onAvailableSlotChange(availableSlot: AvailableSlot, isDelete: boolean) {
    if (isDelete) {
      // Remove from the state where ._id === availableSlot._id 
    } else if (availableSlot._id) {
      // Find one in the state, and replace the value of start and end
    } else {
      // Generate objectid and assign to _id. Then, add passed availableSlot to the state
    }
  }

  render() {
    const dates = [
      moment.tz('2017-11-28', DateConstants.dateFormat, DateConstants.timezone),
      moment.tz('2017-11-30', DateConstants.dateFormat, DateConstants.timezone),
      moment.tz('2017-12-01', DateConstants.dateFormat, DateConstants.timezone),
    ]

    return (
      <div>
        <h1>Available calendar</h1>
        <KoCalendar
          timezone={DateConstants.timezone}
          dates={dates}
          startTime={9}
          endTime={18}
          dateFormat="MM-DD (ddd)"
          events={this.state.events.toArray()}
          eventItem={this.eventItem}
          availableSlots={this.state.availableSlots.toArray()}
          onAvailableSlotChange={this.onAvailableSlotChange}
        />
      </div>
    );
  }
}
