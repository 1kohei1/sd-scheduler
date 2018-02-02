import * as React from 'react';

import FilterQuery from '../../models/FilterQuery';
import { Semester } from '../../models/Semester';
import Presentation from '../../models/Presentation';

export interface SchedulingCalendarProps {
  semester: Semester;
  filterQuery: FilterQuery;
}

interface SchedulingCalendarState {
  availableSpots: any[];
  presentations: Presentation[];
}

export default class SchedulingCalendar extends React.Component<SchedulingCalendarProps, any> {
  constructor(props: SchedulingCalendarProps) {
    super(props);
  }

  render() {
    return (
      <div>
        Scheduling calendar
      </div>
    );
  }
}