import * as React from 'react';
import { List } from 'immutable';
import ObjectID from 'bson-objectid';
import * as moment from 'moment-timezone';
import { Button, Icon } from 'antd';

import KoCalendar from './KoCalendar/KoCalendar';
import Presentation from '../models/Presentation';
import { DateConstants, KoCalendarConstants } from '../models/Constants';
import { Semester } from '../models/Semester';
import DatetimeUtil from '../utils/DatetimeUtil';
import TimeSlot from '../models/TimeSlot';

export interface MyCalendarProps {
  semester: Semester;
}

interface MyCalendarState {
  presentations: List<Presentation>;
  availableSlots: List<TimeSlot>;
}

export default class MyCalendar extends React.Component<MyCalendarProps, MyCalendarState> {
  constructor(props: MyCalendarProps) {
    super(props);

    // Get presentations and available slots

    this.state = {
      // presentations: List<Presentation>([{
      //   _id: ObjectID.generate(),
      //   start: moment.tz('2018-04-26 12 PM', `${DateConstants.dateFormat} ${DateConstants.hourFormat}`, DateConstants.timezone),
      //   end: moment.tz('2018-04-26 1 PM', `${DateConstants.dateFormat} ${DateConstants.hourFormat}`, DateConstants.timezone),
      //   semester: this.props.semester._id,
      //   group: {
      //     _id: ObjectID.generate(),
      //     projectName: 'Automate detecting the system flow',
      //     semester: this.props.semester._id,
      //     members: [{
      //       _id: ObjectID.generate(),
      //       firstName: 'AAA',
      //       lastName: 'AAA',
      //       email: 'aaa@aaa.com',
      //     }, {
      //       _id: ObjectID.generate(),
      //       firstName: 'BBB',
      //       lastName: 'BBB',
      //       email: 'bbb@bbb.com',
      //     }, {
      //       _id: ObjectID.generate(),
      //       firstName: 'CCC',
      //       lastName: 'CCC',
      //       email: 'ccc@ccc.com',
      //     }],
      //     sponsors: [],
      //     sponsorName: 'Veritas Technology',
      //     groupNumber: 8,
      //     adminFaculty: '',
      //     created_at: new Date(),
      //     updated_at: new Date(),
      //   },
      //   faculties: [],
      //   midPresentationLink: '',
      //   committeeFormLink: '',
      // }, {
      //   _id: ObjectID.generate(),
      //   start: moment.tz('2018-04-27 3:30 PM', `${DateConstants.dateFormat} h:m A`, DateConstants.timezone),
      //   end: moment.tz('2018-04-27 4:30 PM', `${DateConstants.dateFormat} h:m A`, DateConstants.timezone),
      //   semester: this.props.semester._id,
      //   group: {
      //     projectName: 'Develop the posture controling software of Lunar rober',
      //     _id: ObjectID.generate(),
      //     semester: this.props.semester._id,
      //     members: [{
      //       _id: ObjectID.generate(),
      //       firstName: 'XXX',
      //       lastName: 'XXX',
      //       email: 'xxx@xxx.com',
      //     }, {
      //       _id: ObjectID.generate(),
      //       firstName: 'YYY',
      //       lastName: 'YYY',
      //       email: 'yyy@yyy.com',
      //     }, {
      //       _id: ObjectID.generate(),
      //       firstName: 'ZZZ',
      //       lastName: 'ZZZ',
      //       email: 'zzz@zzz.com',
      //     }],
      //     sponsors: [],
      //     sponsorName: 'NASA',
      //     groupNumber: 7,
      //     adminFaculty: '',
      //     created_at: new Date(),
      //     updated_at: new Date(),
      //   },
      //   faculties: [],
      //   midPresentationLink: '',
      //   committeeFormLink: '',
      // }]),
      // availableSlots: List<TimeSlot>([{
      //   _id: ObjectID.generate(),
      //   start: moment.tz('2018-04-25 9 AM', `${DateConstants.dateFormat} ${DateConstants.hourFormat}`, DateConstants.timezone),
      //   end: moment.tz('2018-04-25 11 AM', `${DateConstants.dateFormat} ${DateConstants.hourFormat}`, DateConstants.timezone),
      // }, {
      //   _id: ObjectID.generate(),
      //   start: moment.tz('2018-04-25 1:30 PM', `${DateConstants.dateFormat} h:m A`, DateConstants.timezone),
      //   end: moment.tz('2018-04-25 3:30 PM', `${DateConstants.dateFormat} h:m A`, DateConstants.timezone),
      // }]),
      presentations: List<Presentation>(),
      availableSlots: List<TimeSlot>(),
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
        this.setState((prevState: MyCalendarState, props: MyCalendarProps) => {
          return {
            availableSlots: prevState.availableSlots.delete(index)
          }
        })
      }
    } else if (index >= 0) {
      this.setState((prevState: MyCalendarState, props: MyCalendarProps) => {
        return {
          availableSlots: prevState.availableSlots.set(index, updatedSlot)
        }
      })
    } else {
      this.setState((prevState: MyCalendarState, props: MyCalendarProps) => {
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
        <h1>My Calendar</h1>
        <p className="ko-description">
          You can put your available time and check assigned presentations.
          <Button
            icon="question-circle"
            href={KoCalendarConstants.helpVideoLink}
            target="blank"
          >
            Check how to put available time
          </Button>
        </p>
        <KoCalendar
          presentationDates={presentationDates}
          presentations={this.state.presentations.toArray()}
          availableSlots={this.state.availableSlots.toArray()}
          onAvailableSlotChange={this.onAvailableSlotChange}
        />
        <style jsx>{`
          .ko-description {
            display: flex;
            width: ${ `${KoCalendarConstants.rulerColumnWidthNum + KoCalendarConstants.dayColumnWidthNum * presentationDates.length}px`};
            align-items: baseline;
            justify-content: space-between;
          }
        `}
        </style>
      </div>
    );
  }
}
