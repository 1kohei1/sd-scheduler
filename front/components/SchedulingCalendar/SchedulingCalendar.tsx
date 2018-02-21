import * as React from 'react';
import { Tabs } from 'antd';

import Faculty from '../../models/Faculty';
import AvailableSlot from '../../models/AvailableSlot';
import Presentation from '../../models/Presentation';
import FacultyColumn from './FacultyColumn';
import { Semester } from '../../models/Semester';
import Loading from '../Loading';
import CalendarBody from './CalendarBody';
import DatetimeUtil from '../../utils/DatetimeUtil';
import { DateConstants } from '../../models/Constants';
import CookieUtil from '../../utils/CookieUtil';

export interface SchedulingCalendarProps {
  semester: Semester;
  faculties: Faculty[];
  availableSlots: AvailableSlot[];
  presentations: Presentation[];
  loading: boolean;
}

interface SchedulingCalendarState {
  checkedFaculties: string[];
}

export default class SchedulingCalendar extends React.Component<SchedulingCalendarProps, SchedulingCalendarState> {
  constructor(props: SchedulingCalendarProps) {
    super(props);

    let checkedFaculties = CookieUtil.getFaculties();
    if (!checkedFaculties) {
      checkedFaculties = this.props.faculties.map(f => f._id);
    }

    this.state = {
      checkedFaculties,
    }
  }

  render() {
    return (
      <Tabs>
      {this.props.semester.presentationDates.map(date => {
        const presentationDate = DatetimeUtil.convertToTimeSlot(date);
        const facultiesToDisplay = this.props.faculties.filter(f => this.state.checkedFaculties.indexOf(f._id) >= 0);

        return (
          <Tabs.TabPane
            key={date._id}
            tab={DatetimeUtil.formatDate(presentationDate.start, DateConstants.dateFormat)}
          >
            {this.props.loading ? (
              <Loading />
            ) : (
              <CalendarBody
                presentationDate={presentationDate}
                faculties={facultiesToDisplay}
                availableSlots={this.props.availableSlots}
                presentations={this.props.presentations}
              />
            )}
          </Tabs.TabPane>
        )
      })}
    </Tabs>
    );
  }
}
