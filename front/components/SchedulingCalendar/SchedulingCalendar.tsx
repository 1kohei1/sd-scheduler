import * as React from 'react';
import * as Cookie from 'js-cookie';
import { Card } from 'antd';

import { Semester } from '../../models/Semester';
import Faculty from '../../models/Faculty';
import Presentation from '../../models/Presentation';
import AvailableSlot from '../../models/AvailableSlot';
import CalendarControl from './CalendarControl';
import DatetimeUtil from '../../utils/DatetimeUtil';
import CalendarBody from './CalendarBody';
import SchedulingFilter from './SchedulingFilter';

export interface SchedulingCalendarProps {
  semester: Semester;
  faculties: Faculty[];
  availableSlots: AvailableSlot[];
  presentations: Presentation[];
}

interface SchedulingCalendarState {
  presentationDatesIndex: number;
  checkedFaculties: string[];
}

const COOKIE_KEY = 'faculties';

export default class SchedulingCalendar extends React.Component<SchedulingCalendarProps, SchedulingCalendarState> {
  constructor(props: SchedulingCalendarProps) {
    super(props);

    let checkedFaculties = this.props.faculties.map(f => f._id);
    const ids = Cookie.get(COOKIE_KEY);
    if (ids) {
      checkedFaculties = ids.split(',');
    }

    this.state = {
      presentationDatesIndex: 0,
      checkedFaculties,
    };

    this.changeIndex = this.changeIndex.bind(this);
    this.onUpdateFilter = this.onUpdateFilter.bind(this);
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

  onUpdateFilter(ids: string[]) {
    this.setState({
      checkedFaculties: ids,
    });
    Cookie.set(COOKIE_KEY, ids.join(','));
  }

  render() {
    const presentationDates = this.props.semester.presentationDates.map(DatetimeUtil.convertToTimeSlot)
    const facultiesToDisplay = this.props.faculties.filter(f => {
      return this.state.checkedFaculties.indexOf(f._id) >= 0;
    });

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
                faculties={facultiesToDisplay}
                availableSlots={this.props.availableSlots}
                presentations={this.props.presentations}
              />
            ))}
          </div>
        </div>
        <Card title="Filter faculties">
          <SchedulingFilter
            faculties={this.props.faculties}
            checkedFaculties={this.state.checkedFaculties}
            onUpdateFilter={this.onUpdateFilter}
          />
        </Card>
        <style jsx>{`
          .ko-calendar-wrapper {
            width: 100%;
            overflow: hidden;
            margin-bottom: 32px;
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
