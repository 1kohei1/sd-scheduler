import * as React from 'react';
import { List } from 'immutable';
import ObjectID from 'bson-objectid';
import * as moment from 'moment-timezone';
import { Button, Icon, message } from 'antd';

import KoCalendar from './KoCalendar/KoCalendar';
import Presentation from '../models/Presentation';
import { DateConstants, KoCalendarConstants } from '../models/Constants';
import { Semester } from '../models/Semester';
import DatetimeUtil from '../utils/DatetimeUtil';
import TimeSlot from '../models/TimeSlot';
import Loading from './Loading';
import UserUtil from '../utils/UserUtil';
import Api from '../utils/Api';
import AvailableSlot from '../models/AvailableSlot';

export interface MyCalendarProps {
  semester: Semester;
}

interface MyCalendarState {
  loading: boolean;
  presentations: List<Presentation>;
  availableSlots: List<TimeSlot>;
}

export default class MyCalendar extends React.Component<MyCalendarProps, MyCalendarState> {
  availableSpotId: string | undefined = undefined;
  presentationDates: TimeSlot[];

  constructor(props: MyCalendarProps) {
    super(props);

      // Semester.presentationDates are in string format. So convert them to moment.
      this.presentationDates = props.semester.presentationDates.map(presentationDate => {
      return {
        _id: presentationDate._id,
        start: DatetimeUtil.getMomentFromISOString(presentationDate.start),
        end: DatetimeUtil.getMomentFromISOString(presentationDate.end)
      };
    });

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
      loading: true,
      presentations: List<Presentation>(),
      availableSlots: List<TimeSlot>(),
    };

    this.getAvailableSlot();
    this.getPresentations();

    this.onAvailableSlotChange = this.onAvailableSlotChange.bind(this);
    this.calendar = this.calendar.bind(this);
  }

  private async getAvailableSlot() {
    const semesterId = this.props.semester._id;
    const loginUser = await UserUtil.getUser();
    const facultyId = loginUser._id;

    const availableSlots = await Api.getAvailableSlots(`semester=${semesterId}&faculty=${facultyId}`) as AvailableSlot[];

    if (availableSlots.length > 0) {
      this.onAvailableSlotGet(availableSlots[0]);
    } else {
      const availableSlot = await Api.createAvailableSlot({
        semester: semesterId,
        faculty: facultyId,
        availableSlots: [],
      });

      this.onAvailableSlotGet(availableSlot);
    }
  }

  private onAvailableSlotGet(availableSlot: AvailableSlot) {
    this.availableSpotId = availableSlot._id;
    let availableSlots = List<TimeSlot>();

    availableSlot.availableSlots.forEach(slot => {
      availableSlots = availableSlots.push({
        _id: slot._id,
        start: DatetimeUtil.getMomentFromISOString(slot.start),
        end: DatetimeUtil.getMomentFromISOString(slot.end),
      })
    });

    this.setState({
      availableSlots,
      loading: false,
    });
  }

  private async getPresentations() {

  }

  onAvailableSlotChange(updatedSlot: TimeSlot, isDelete: boolean, updateDB: boolean = false) {
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
          const newAvailableSlots = prevState.availableSlots.delete(index);
          if (updateDB) {
            this.updateDBAvailableSlot(newAvailableSlots.toArray());
          }
          return {
            availableSlots: newAvailableSlots,
          }
        })
      }
    } else if (index >= 0) {
      this.setState((prevState: MyCalendarState, props: MyCalendarProps) => {
        const newAvailableSlots = prevState.availableSlots.set(index, updatedSlot);
        if (updateDB) {
          this.updateDBAvailableSlot(newAvailableSlots.toArray());
        }
        return {
          availableSlots: newAvailableSlots,
        }
      })
    } else {
      this.setState((prevState: MyCalendarState, props: MyCalendarProps) => {
        const newAvailableSlots = prevState.availableSlots.push(updatedSlot);
        if (updateDB) {
          this.updateDBAvailableSlot(newAvailableSlots.toArray());
        }
        return {
          availableSlots: newAvailableSlots,
        }
      });
    }
  }

  private async updateDBAvailableSlot(newAvailableSlots: TimeSlot[]) {
    try {
      if (this.availableSpotId) {
        await Api.updateAvailableSlot(this.availableSpotId, {
          availableSlots: newAvailableSlots
        });
        message.success('Successfully updated your available time!');
      }
    } catch (err) {
      // Error handling
      console.log(err);
    }
  }

  calendar() {
    if (this.state.loading) {
      return <Loading />
    }
    if (this.props.semester.presentationDates && this.props.semester.presentationDates.length > 0) {
      return (
        <div>
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
            presentationDates={this.presentationDates}
            presentations={this.state.presentations.toArray()}
            availableSlots={this.state.availableSlots.toArray()}
            onAvailableSlotChange={this.onAvailableSlotChange}
          />
        </div>
      )
    } else {
      return <div>Presentation dates are not defined. Once the date is set, the system sends email. Please check later!</div>
    }
  }

  render() {
    return (
      <div>
        <h1>My Calendar</h1>
        {this.calendar()}
        <style jsx>{`
          .ko-description {
            display: flex;
            width: ${ `${KoCalendarConstants.rulerColumnWidthNum + KoCalendarConstants.dayColumnWidthNum * this.props.semester.presentationDates.length}px`};
            align-items: baseline;
            justify-content: space-between;
          }
        `}
        </style>
      </div>
    );
  }
}
