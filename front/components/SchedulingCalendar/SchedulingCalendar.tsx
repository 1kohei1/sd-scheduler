import * as React from 'react';

import { Semester } from '../../models/Semester';
import Faculty from '../../models/Faculty';
import Presentation from '../../models/Presentation';
import AvailableSlot from '../../models/AvailableSlot';
import CalendarControl from './CalendarControl';
import DatetimeUtil from '../../utils/DatetimeUtil';

export interface SchedulingCalendarProps {
  semester: Semester;
  faculties: Faculty[];
  availableSlots: AvailableSlot[];
  presentations: Presentation[];
}

interface SchedulingCalendarState {
  presentationDatesIndex: number;
}

export default class SchedulingCalendar extends React.Component<SchedulingCalendarProps, SchedulingCalendarState> {
  constructor(props: SchedulingCalendarProps) {
    super(props);

    this.state = {
      presentationDatesIndex: 0,
    };

    this.changeIndex = this.changeIndex.bind(this);
  }

  changeIndex(op: string) {
    if (op === '+') {
      this.setState((prevState: SchedulingCalendarState) => {
        return {
          presentationDatesIndex: prevState.presentationDatesIndex + 1,
        }
      })
    } else {
      this.setState((prevState: SchedulingCalendarState) => {
        return {
          presentationDatesIndex: prevState.presentationDatesIndex - 1,
        }
      })
    }
  }

  render() {
    const presentationDates = this.props.semester.presentationDates.map(date => {
      return {
        _id: date._id,
        start: DatetimeUtil.getMomentFromISOString(date.start),
        end: DatetimeUtil.getMomentFromISOString(date.end),
      };
    })
    return (
      <div>
        <CalendarControl 
          index={this.state.presentationDatesIndex}
          presentationDates={presentationDates}
          changeIndex={this.changeIndex}
        />
        Scheduling calendar
      </div>
    );
  }
}
