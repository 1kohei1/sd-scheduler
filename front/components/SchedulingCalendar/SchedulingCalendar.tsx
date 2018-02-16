import * as React from 'react';

import { Semester } from '../../models/Semester';
import Faculty from '../../models/Faculty';
import Presentation from '../../models/Presentation';
import AvailableSlot from '../../models/AvailableSlot';
import CalendarControl from './CalendarControl';
import DatetimeUtil from '../../utils/DatetimeUtil';
import CalendarBody from './CalendarBody';

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
    const presentationDates = this.props.semester.presentationDates.map(DatetimeUtil.convertToTimeSlot)
    return (
      <div>
        <CalendarControl
          index={this.state.presentationDatesIndex}
          presentationDates={presentationDates}
          changeIndex={this.changeIndex}
        />
        <div className="ko-calendar-wrapper">
          <div className="ko-calendar-window">
            {presentationDates.map((date, index) => (
              <CalendarBody
                key={index}
                presentationDate={date}
                faculties={this.props.faculties}
                availableSlots={this.props.availableSlots}
                presentations={this.props.presentations}
              />
            ))}
          </div>
        </div>
        <style jsx>{`
          .ko-calendar-wrapper {
            width: 100%;
            overflow: hidden;
          }
          .ko-calendar-window {
            display: flex;
            position: relative;
            left: 0;
          }
        `}
        </style>
      </div>
    );
  }
}
