import * as React from 'react';
import { List } from 'immutable';
import ObjectID from 'bson-objectid';
import * as moment from 'moment-timezone';
import { Button, Icon, message, Alert, Popover } from 'antd';

import KoCalendar from './KoCalendar/KoCalendar';
import Presentation from '../models/Presentation';
import { DateConstants, KoCalendarConstants } from '../models/Constants';
import { Semester } from '../models/Semester';
import DatetimeUtil, { TimeSlotLikeObject } from '../utils/DatetimeUtil';
import TimeSlot from '../models/TimeSlot';
import Loading from './Loading';
import Api from '../utils/Api';
import AvailableSlot from '../models/AvailableSlot';
import PresentationDate from '../models/PresentationDate';
import Faculty from '../models/Faculty';

export interface MyCalendarProps {
  user: Faculty;
  semester: Semester;
}

interface MyCalendarState {
  loading: boolean;
  errors: List<string>;
  presentations: List<Presentation>;
  availableSlots: List<TimeSlot>;
  presentationDates: TimeSlot[];
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
      const presentationDates = await Api.getPresentationDates(`semester=${this.props.semester._id}`) as PresentationDate[];
      const presentationSlots = this.getPresentationSlots(presentationDates);

      this.setState({
        presentationDates: presentationSlots,
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

  /**
   * PresentationDate[] could contain the same date, but different time range.
   * Return an array of TimeSlot that covers the all presentation date time
   */
  private getPresentationSlots(presentationDates: PresentationDate[]) {
    const presentationSlots = presentationDates
    .map((pd: PresentationDate) => pd.dates)
    // Flatten array of array
    .reduce((accumulator: TimeSlotLikeObject[], dates: TimeSlotLikeObject[]) => {
      dates.forEach(date => {
        accumulator.push(date);
      });
      return accumulator;
    }, [])
    .map(DatetimeUtil.convertToTimeSlot)
    .sort((a: TimeSlot, b: TimeSlot) => {
      return a.start.valueOf() - b.start.valueOf();
    });

  // Store the formated dates of presentation dates. 
  // This works as index locator and check of duplicates
  const dateStrs: string[] = [];
  // Stores the TimeSlot of presentation dates that doesn't contain the duplicate of the presentation dates
  const noDupSlots: TimeSlot[] = [];

  presentationSlots.forEach((slot: TimeSlot) => {
    const dateStr = DatetimeUtil.formatDate(slot.start, DateConstants.dateFormat);
    const index = dateStrs.indexOf(dateStr);

    // Duplicate presentation date is found. Take smaller start and large end
    if (index >= 0) {
      const existingSlot: TimeSlot = noDupSlots[index];
      noDupSlots[index].start = DatetimeUtil.smaller(existingSlot.start, slot.start);
      noDupSlots[index].end = DatetimeUtil.larger(existingSlot.end, slot.end);
    }
    // This presentation date is not found yet. Add it to noDupSlots
    else {
      dateStrs.push(dateStr);
      noDupSlots.push(slot);
    }
  });

  return noDupSlots;
}

  private async getAvailableSlot() {
    const semesterId = this.props.semester._id;
    const facultyId = this.props.user._id;

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
        <p>
          You will not be booked in a row if you need to move to a different location.
          <Popover
            title="What does this mean?"
            content={this.content()}
            placement="bottom"
          >
            <Icon type="question-circle" style={{ marginLeft: '8px' }} />
          </Popover>
        </p>
        {this.state.presentationDates.length === 0 ? (
          <div>Presentation dates are not defined. Once the date is set, the system sends email. Please check later!</div>
        ) : (
            <KoCalendar
              presentationDates={this.state.presentationDates}
              presentations={this.state.presentations.toArray()}
              availableSlots={this.state.availableSlots.toArray()}
              onAvailableSlotChange={this.onAvailableSlotChange}
            />
          )}
      </div>
    )
  }

  content() {
    return (
      <div style={{ width: '500px' }}>
        There could be a case that two senior design class holds presentations on the same date at different location. In that case, the system doesn't allow you to be booked in a row from a different class.
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
