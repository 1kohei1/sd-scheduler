import * as React from 'react';

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
  facultyColumnRatio: number;
  colorsByAdmin: { [key: string]: string };
}

export default class CalendarBody extends React.Component<CalendarBodyProps, any> {
  render() {
    const presentationDateStr = DatetimeUtil.formatDate(this.props.presentationDate.start, DateConstants.dateFormat);

    return (
      <div className="ko-calendar-body">
        <div className="color-section">
          {
            this.props.faculties
              .filter((f: Faculty) => f.isAdmin)
              .map((f: Faculty) => (
                <div
                  key={f._id}
                  className="colors"
                >
                  <div
                    className="color-box"
                    style={{ backgroundColor: this.props.colorsByAdmin[f._id] }}
                  ></div>
                  <div>Dr. {f.firstName} {f.lastName}'s group</div>
                </div>
              ))
          }
        </div>
        <div style={{ display: 'flex' }}>
          <FacultyColumn
            presentationDateStr={presentationDateStr}
            faculties={this.props.faculties}
            facultyColumnRatio={this.props.facultyColumnRatio}
          />
          <TimeTable
            presentationDate={this.props.presentationDate}
            faculties={this.props.faculties}
            availableSlots={this.props.availableSlots}
            presentations={this.props.presentations}
            facultyColumnRatio={this.props.facultyColumnRatio}
            colorsByAdmin={this.props.colorsByAdmin}
          />
        </div>
        <style jsx>{`
          .ko-calendar-body {
            min-width: 100%;
            overflow: hidden;
            margin-bottom: 32px;
          }
          .color-section {
            display: flex;
            flex-wrap: wrap;
          }
          .colors {
            line-height: 24px;
            display: flex;
            margin-bottom: 4px;
            margin-right: 8px;
          }
          .color-box {
            margin-right: 8px;
            width: 24px;
            height: 24px;
          }
        `}</style>
      </div>
    );
  }
}
