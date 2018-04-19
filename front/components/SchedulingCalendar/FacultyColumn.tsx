import * as React from 'react';

import Faculty from '../../models/Faculty';
import { SchedulingCalendarConstants } from '../../models/Constants';

export interface FacultyColumnProps {
  presentationDateStr: string;
  faculties: Faculty[];
  facultyColumnRatio: number;
}

export default class FacultyColumn extends React.Component<FacultyColumnProps, any> {
  render() {
    return (
      <div className="faculty-column">
        <div className="row date">
          {this.props.presentationDateStr}
        </div>
        {this.props.faculties.map(faculty => (
          <div key={faculty._id} className="row">
            Dr. {faculty.firstName} {faculty.lastName}
          </div>
        ))}
        <style jsx>{`
          .faculty-column {
            min-width: ${SchedulingCalendarConstants.facultyColumnWidthNum * this.props.facultyColumnRatio}px;
          }
          .row {
            height: ${SchedulingCalendarConstants.rowHeight};
          }
          .row.date {
            font-size: 24px;
            line-height: ${SchedulingCalendarConstants.rowHeight}
          }
        `}</style>
      </div>
    );
  }
}
