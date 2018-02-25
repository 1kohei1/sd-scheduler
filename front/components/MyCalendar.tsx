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
import PresentationDate from '../models/PresentationDate';

export interface MyCalendarProps {
  semester: Semester;
}

interface MyCalendarState {
  loading: boolean;
  errors: List<string>;
  presentations: List<Presentation>;
  availableSlots: List<TimeSlot>;
  presentationDates: PresentationDate[];
}

export default class MyCalendar extends React.Component<MyCalendarProps, MyCalendarState> {
  availableSlotId: string | undefined = undefined;
  dataFetchStatus = {
    presentationDates: false,
    availableSlots: false,
    presentations: false,
  }

  constructor(props: MyCalendarProps) {
    super(props);

    this.state = {
      loading: true,
      errors: List<string>(),
      presentations: List<Presentation>(),
      availableSlots: List<TimeSlot>(),
      presentationDates: [],
    };

    this.onAvailableSlotChange = this.onAvailableSlotChange.bind(this);
    this.calendar = this.calendar.bind(this);
    this.alert = this.alert.bind(this);
  }

  componentDidMount() {
    this.getPresentationDates();
    this.getAvailableSlot();
    this.getPresentations();
  }

  private async getPresentationDates() {
    try {
      const presentationDates = await Api.getPresentationDates(`semester=${this.props.semester._id}`);
      this.setState({
        presentationDates,
      });
      this.onDataFetched('presentationDates');
    } catch (err) {
      this.setState((prevState: MyCalendarState, props: MyCalendarProps) => {
        return {
          errors: prevState.errors.push(err.message),
        }
      });
    }
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
    this.availableSlotId = availableSlot._id;
    let availableSlots = List<TimeSlot>();

    availableSlot.availableSlots.forEach(slot => {
      availableSlots = availableSlots.push(DatetimeUtil.convertToTimeSlot(slot))
    });

    this.setState({
      availableSlots,
    });
    this.onDataFetched('availableSlots');
  }

  private async getPresentations() {
    this.onDataFetched('presentations');
  }

  private onDataFetched(key: 'presentationDates' | 'availableSlots' | 'presentations') {
    this.dataFetchStatus[key] = true;
    const isAllFetched = Object.values(this.dataFetchStatus).filter(isDone => isDone).length === Object.keys(this.dataFetchStatus).length;

    if (isAllFetched) {
      this.setState({
        loading: false,
      })
    }
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
      if (this.availableSlotId) {
        await Api.updateAvailableSlot(this.availableSlotId, {
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
        {this.state.presentationDates.map(presentationDate => {
          const dates = presentationDate.dates.map(DatetimeUtil.convertToTimeSlot);

          return (
            <div key={presentationDate._id}>
              <h3>Class of Dr. {presentationDate.admin.firstName} {presentationDate.admin.lastName}</h3>
              {dates.length === 0 ? (
                <div>Presentation dates are not defined. Once the date is set, the system sends email. Please check later!</div>
              ) : (
                  <KoCalendar
                    presentationDates={dates}
                    presentations={this.state.presentations.toArray()}
                    availableSlots={this.state.availableSlots.toArray()}
                    onAvailableSlotChange={this.onAvailableSlotChange}
                  />
                )}
            </div>
          )
        })}
      </div>
    )
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
        <div className="errors">
          {this.state.errors.map(this.alert)}
        </div>
        <div>
          <h1>My Calendar</h1>
          {this.calendar()}
        </div>
      </div>
    );
  }
}
