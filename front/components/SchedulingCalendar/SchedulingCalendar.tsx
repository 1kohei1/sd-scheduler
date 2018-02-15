import * as React from 'react';

import { Semester } from '../../models/Semester';
import Faculty from '../../models/Faculty';
import Presentation from '../../models/Presentation';
import AvailableSlot from '../../models/AvailableSlot';

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
  }

  render() {
    return (
      <div>
        Scheduling calendar
      </div>
    );
  }
}
