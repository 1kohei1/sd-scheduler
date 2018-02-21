import * as React from 'react';

import TimeSlot from '../../models/TimeSlot';
import Faculty from '../../models/Faculty';
import AvailableSlot from '../../models/AvailableSlot';
import Presentation from '../../models/Presentation';
import FacultyColumn from './FacultyColumn';
import TimeTable from './TimeTable';

export interface CalendarBodyProps {
  presentationDate: TimeSlot;
  checkedFaculties: string[];
  faculties: Faculty[];
  availableSlots: AvailableSlot[];
  presentations: Presentation[];
  updateCheckedFaculties: (ids: string[]) => void;
}

export default class CalendarBody extends React.Component<CalendarBodyProps, any> {
  render() {
    const facultiesToDisplay = this.props.faculties.filter(f => this.props.checkedFaculties.indexOf(f._id) >= 0);
    
    return (
      <div className="ko-calendar-body">
        <div style={{ display: 'flex' }}>
          <FacultyColumn 
            {...this.props}
            presentationDate={this.props.presentationDate}
            checkedFaculties={this.props.checkedFaculties}
            faculties={this.props.faculties}
            facultiesToDisplay={facultiesToDisplay}
            updateCheckedFaculties={this.props.updateCheckedFaculties}
          />
          <TimeTable
            presentationDate={this.props.presentationDate}
            faculties={facultiesToDisplay}
            availableSlots={this.props.availableSlots}
            presentations={this.props.presentations}
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
