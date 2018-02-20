import * as React from 'react';

import TimeSlot from '../../models/TimeSlot';
import DatetimeUtil from '../../utils/DatetimeUtil';
import Faculty from '../../models/Faculty';
import { SchedulingCalendarConstants, DateConstants } from '../../models/Constants';

export interface FacultyColumnProps {
  presentationDate: TimeSlot;
  faculties: Faculty[];
}

export default class FacultyColumn extends React.Component<FacultyColumnProps, any> {
  render() {
    return (
      <div style={{ minWidth: '200px' }}>
        <div className="row" style={{ fontSize: '18px' }}></div>
        {this.props.faculties.map(faculty => (
          <div key={faculty._id} className="row">
            Dr. {faculty.firstName} {faculty.lastName}
          </div>
        ))}
        <style jsx>{`
          .row {
            height: ${SchedulingCalendarConstants.rowHeight};
            line-height: ${SchedulingCalendarConstants.rowHeight};
            padding: 0 16px 0 8px;
          }
        `}</style>
      </div>
    );
  }
}
