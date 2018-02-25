import * as React from 'react';
import { List } from 'immutable';
import ObjectID from 'bson-objectid';
import * as moment from 'moment-timezone';
import { Button, Icon, message, Alert } from 'antd';

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
  errors: List<string>;
  presentations: List<Presentation>;
  availableSlots: List<TimeSlot>;
}

export default class MyCalendar extends React.Component<MyCalendarProps, MyCalendarState> {
  availableSpotId: string | undefined = undefined;
  presentationDates: TimeSlot[];

  constructor(props: MyCalendarProps) {
    super(props);

    // Semester.presentationDates are in string format. So convert them to moment.
    this.presentationDates = props.semester.presentationDates.map(DatetimeUtil.convertToTimeSlot);

    this.state = {
      loading: true,
      errors: List<string>(),
      presentations: List<Presentation>(),
      availableSlots: List<TimeSlot>(),
    };

    this.onAvailableSlotChange = this.onAvailableSlotChange.bind(this);
    this.calendar = this.calendar.bind(this);
    this.alert = this.alert.bind(this);
  }

  componentDidMount() {
    this.getAvailableSlot();
    this.getPresentations();
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
      availableSlots = availableSlots.push(DatetimeUtil.convertToTimeSlot(slot))
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
      this.setState((prevState: MyCalendarState, props: MyCalendarProps) => {
        return {
          errors: prevState.errors.push(err.message),
        }
      });
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

  alert(message: string, index: number) {
    return (
      <Alert
        key={index}
        message={message}
        description={(
          <div>
            {message}. To check your available time in DB, please <a href="">reload</a>.
          </div>
        )}
        type="error"
        style={{ marginBottom: '16px' }}
      />
    )
  }

  render() {
    return (
      <div className="ko-mycalendar-wrapper">
        <div>
          <h1>My Calendar</h1>
          {this.calendar()}
        </div>
        <div className="errors">
          {this.state.errors.map(this.alert)}
        </div>
        <style jsx>{`
          .ko-mycalendar-wrapper {
            display: flex;
            justify-content: row;
          }
          .ko-mycalendar-wrapper .errors {
            flex-grow: 1;
            margin-left: 16px;
          }
          .ko-mycalendar-wrapper .ko-description {
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
