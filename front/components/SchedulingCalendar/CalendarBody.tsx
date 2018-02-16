import * as React from 'react';

import TimeSlot from '../../models/TimeSlot';
import Faculty from '../../models/Faculty';
import AvailableSlot from '../../models/AvailableSlot';
import Presentation from '../../models/Presentation';
import FacultyColumn from './FacultyColumn';
import TimeTable from './TimeTable';

export interface CalendarBodyProps {
  presentationDate: TimeSlot;
  faculties: Faculty[];
  availableSlots: AvailableSlot[];
  presentations: Presentation[];
}

export default class CalendarBody extends React.Component<CalendarBodyProps, any> {
  render() {
    return (
      <div className="ko-calendar-body">
        <div style={{ display: 'flex' }}>
          <FacultyColumn 
            {...this.props}
          />
          <TimeTable
            {...this.props}
          />
        </div>
        <style jsx>{`
          .ko-calendar-body {
            min-width: 100%;
            overflow: scroll;
          }
        `}</style>
      </div>
    );
  }
}
