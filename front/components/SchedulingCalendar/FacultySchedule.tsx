import * as React from 'react';

import Faculty from '../../models/Faculty';
import TimeSlot from '../../models/TimeSlot';
import Presentation from '../../models/Presentation';

export interface FacultyScheduleProps {
  faculty: Faculty;
  hoursArray: number[];
  availableSlots: TimeSlot[];
  presentations: Presentation[];
}

export default class FacultySchedule extends React.Component<FacultyScheduleProps, any> {
  render() {
    return (
      <div>
        
      </div>
    );
  }
}
