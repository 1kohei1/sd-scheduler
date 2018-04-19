import * as React from 'react';
import { Moment } from 'moment';

import TimeSlot from '../../models/TimeSlot';
import Faculty from '../../models/Faculty';
import AvailableSlot from '../../models/AvailableSlot';
import Presentation from '../../models/Presentation';
import FacultyColumn from './FacultyColumn';
import TimeTable from './TimeTable';
import { DateConstants } from '../../models/Constants';
import DatetimeUtil from '../../utils/DatetimeUtil';

export interface CalendarBodyProps {
  presentationDate: TimeSlot;
  faculties: Faculty[];
  availableSlots: AvailableSlot[];
  presentations: Presentation[];
}

export default class CalendarBody extends React.Component<CalendarBodyProps, any> {
  render() {
    const presentationDateStr = DatetimeUtil.formatDate(this.props.presentationDate.start, DateConstants.dateFormat);

    return (
      <div className="ko-calendar-body">
        <div style={{ display: 'flex' }}>
          <FacultyColumn
            presentationDateStr={presentationDateStr}
            faculties={this.props.faculties}
          />
          <TimeTable
            presentationDate={this.props.presentationDate}
            faculties={this.props.faculties}
            availableSlots={this.props.availableSlots}
            presentations={this.props.presentations}
          />
        </div>
        <style jsx>{`
          .ko-calendar-body {
            min-width: 100%;
            overflow: hidden;
            margin-bottom: 32px;
          }
        `}</style>
      </div>
    );
  }
}
