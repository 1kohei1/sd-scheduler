import * as React from 'react';

import AppLayout from '../components/AppLayout';

export interface CalendarProps {
}

export default class Calendar extends React.Component<CalendarProps, any> {
  render() {
    return (
      <AppLayout>
        Use scheduling calendar body to show the schedule.
        Receive admin faculty and date in here
      </AppLayout>
    );
  }
}
