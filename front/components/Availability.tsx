import * as React from 'react';
import { List } from 'immutable';
import ObjectID from 'bson-objectid';
import * as moment from 'moment-timezone';

import KoCalendar from './KoCalendar/KoCalendar';
import Presentation from '../models/Presentation';
import { DateConstants } from '../models/Constants';
import { Semester } from '../models/Semester';
import DatetimeUtil from '../utils/DatetimeUtil';
import TimeSlot from '../models/TimeSlot';
import AvailabilityForm from './AvailabilityForm';

export interface AvailabilityProps {
  semester: Semester;
}

interface AvailabilityState {
  presentations: List<Presentation>;
  availableSlots: List<TimeSlot>;
}

export default class Availability extends React.Component<AvailabilityProps, AvailabilityState> {
  constructor(props: AvailabilityProps) {
    super(props);

    // Get presentations and available slots

    this.state = {
      presentations: List<Presentation>([{
        _id: ObjectID.generate(),
        start: moment.tz('2018-04-26 12 PM', `${DateConstants.dateFormat} ${DateConstants.hourFormat}`, DateConstants.timezone),
        end: moment.tz('2018-04-26 1 PM', `${DateConstants.dateFormat} ${DateConstants.hourFormat}`, DateConstants.timezone),
        semester: this.props.semester._id,
        group: {
          _id: ObjectID.generate(),
          projectName: 'Automate detecting the system flow',
          semester: this.props.semester._id,
          members: [{
            _id: ObjectID.generate(),
            firstName: 'AAA',
            lastName: 'AAA',
            email: 'aaa@aaa.com',
          }, {
            _id: ObjectID.generate(),
            firstName: 'BBB',
            lastName: 'BBB',
            email: 'bbb@bbb.com',
          }, {
            _id: ObjectID.generate(),
            firstName: 'CCC',
            lastName: 'CCC',
            email: 'ccc@ccc.com',
          }],
          sponsors: [],
          sponsorName: 'Veritas Technology',
          groupNumber: 8,
          adminFaculty: '',
          created_at: new Date(),
          updated_at: new Date(),
        },
        faculties: [],
        midPresentationLink: '',
        committeeFormLink: '',
      }, {
        _id: ObjectID.generate(),
        start: moment.tz('2018-04-27 3:30 PM', `${DateConstants.dateFormat} h:m A`, DateConstants.timezone),
        end: moment.tz('2018-04-27 4:30 PM', `${DateConstants.dateFormat} h:m A`, DateConstants.timezone),
        semester: this.props.semester._id,
        group: {
          projectName: 'Develop the posture controling software of Lunar rober',
          _id: ObjectID.generate(),
          semester: this.props.semester._id,
          members: [{
            _id: ObjectID.generate(),
            firstName: 'XXX',
            lastName: 'XXX',
            email: 'xxx@xxx.com',
          }, {
            _id: ObjectID.generate(),
            firstName: 'YYY',
            lastName: 'YYY',
            email: 'yyy@yyy.com',
          }, {
            _id: ObjectID.generate(),
            firstName: 'ZZZ',
            lastName: 'ZZZ',
            email: 'zzz@zzz.com',
          }],
          sponsors: [],
          sponsorName: 'NASA',
          groupNumber: 7,
          adminFaculty: '',
          created_at: new Date(),
          updated_at: new Date(),
        },
        faculties: [],
        midPresentationLink: '',
        committeeFormLink: '',
      }]),
      availableSlots: List<TimeSlot>([{
        _id: ObjectID.generate(),
        start: moment.tz('2018-04-25 9 AM', `${DateConstants.dateFormat} ${DateConstants.hourFormat}`, DateConstants.timezone),
        end: moment.tz('2018-04-25 11 AM', `${DateConstants.dateFormat} ${DateConstants.hourFormat}`, DateConstants.timezone),
      }, {
        _id: ObjectID.generate(),
        start: moment.tz('2018-04-25 1:30 PM', `${DateConstants.dateFormat} h:m A`, DateConstants.timezone),
        end: moment.tz('2018-04-25 3:30 PM', `${DateConstants.dateFormat} h:m A`, DateConstants.timezone),
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

  onAvailableSlotChange(updatedSlot: TimeSlot, isDelete: boolean) {
    const index = this.state.availableSlots.findIndex(slot => {
      if (slot) {
        return slot._id === updatedSlot._id;
      } else {
        return false;
      }
    });

    if (isDelete) {
      if (index >= 0) {
        this.setState((prevState: AvailabilityState, props: AvailabilityProps) => {
          return {
            availableSlots: prevState.availableSlots.delete(index)
          }
        })
      }
    } else if (index >= 0) {
      this.setState((prevState: AvailabilityState, props: AvailabilityProps) => {
        return {
          availableSlots: prevState.availableSlots.set(index, updatedSlot)
        }
      })
    } else {
      this.setState((prevState: AvailabilityState, props: AvailabilityProps) => {
        return {
          availableSlots: prevState.availableSlots.push(updatedSlot)
        }
      });
    }
  }

  render() {
    // Semester.presentationDates are in string format. So convert them to moment.
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
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <div>
            {presentationDates.map(date => {
              const availableSlots = this.state.availableSlots.toArray().filter((slot: TimeSlot) => {
                return DatetimeUtil.formatDate(slot.start, DateConstants.dateFormat) === DatetimeUtil.formatDate(date.start, DateConstants.dateFormat);
              });

              return (
                <AvailabilityForm
                  key={ObjectID.generate()}
                  presentationDate={date}
                  availableSlots={availableSlots}
                  onAvailableSlotChange={this.onAvailableSlotChange}
                />
              )
            })}
          </div>
          <KoCalendar
            presentationDates={presentationDates}
            presentations={this.state.presentations.toArray()}
            availableSlots={this.state.availableSlots.toArray()}
            onAvailableSlotChange={this.onAvailableSlotChange}
          />
        </div>
      </div>
    );
  }
}
