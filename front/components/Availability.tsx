import * as React from 'react';
import { List } from 'immutable';
import ObjectID from 'bson-objectid';
import * as moment from 'moment-timezone';

import KoCalendar from './KoCalendar/KoCalendar';
import Event from '../models/Event';
import { DateConstants } from '../models/Constants';
import { Semester } from '../models/Semester';
import DatetimeUtil from '../utils/DatetimeUtil';
import TimeSlot from '../models/TimeSlot';

export interface AvailabilityProps {
  semester: Semester;
}

interface AvailableState {
  events: List<Event>;
  availableSlots: List<TimeSlot>;
}

export default class Availability extends React.Component<AvailabilityProps, AvailableState> {
  constructor(props: AvailabilityProps) {
    super(props);

    this.state = {
      events: List<Event>([]),
      availableSlots: List<TimeSlot>([{
        _id: ObjectID.generate(),
        start: moment.tz('2018-04-25 9 AM', `${DateConstants.dateFormat} ${DateConstants.hourFormat}`, DateConstants.timezone),
        end: moment.tz('2018-04-25 11 AM', `${DateConstants.dateFormat} ${DateConstants.hourFormat}`, DateConstants.timezone),
      }, {
        _id: ObjectID.generate(),
        start: moment.tz('2018-04-25 1:30 PM', `${DateConstants.dateFormat} h:m A`, DateConstants.timezone),
        end: moment.tz('2018-04-25 3 PM', `${DateConstants.dateFormat} ${DateConstants.hourFormat}`, DateConstants.timezone),
      }]),
    };

    this.eventItem = this.eventItem.bind(this);
    this.onAvailableSlotChange = this.onAvailableSlotChange.bind(this);
  }

  eventItem(event: any, style: any) {
    return (
      <div>Item</div>
    )
  }

  onAvailableSlotChange(availableSlot: TimeSlot, isDelete: boolean) {
    if (isDelete) {
      // Remove from the state where ._id === availableSlot._id 
    } else if (availableSlot._id) {
      // Find one in the state, and replace the value of start and end
    } else {
      // Generate objectid and assign to _id. Then, add passed availableSlot to the state
    }
  }

  render() {
    const presentationDates = this.props.semester.presentationDates.map(presentationDate => {
      return {
        _id: presentationDate._id,
        start: DatetimeUtil.getMomentFromISOString(presentationDate.start),
        end: DatetimeUtil.getMomentFromISOString(presentationDate.end)
      };
    });

    return (
      <div>
        <h1>Available calendar</h1>
        <KoCalendar
          presentationDates={presentationDates}
          events={this.state.events.toArray()}
          eventItem={this.eventItem}
          availableSlots={this.state.availableSlots.toArray()}
          onAvailableSlotChange={this.onAvailableSlotChange}
        />
      </div>
    );
  }
}
