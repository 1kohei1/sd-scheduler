import * as React from 'react';

import * as moment from 'moment-timezone';
import KoCalendar from './KoCalendar/KoCalendar';

const timezone = 'America/New_York';

export interface AvailabilityProps {
}

export default class Availability extends React.Component<AvailabilityProps, any> {
  constructor(props: AvailabilityProps) {
    super(props);

    this.eventItem = this.eventItem.bind(this);
  }

  eventItem(event: any, style: any) {
    return (
      <div>Item</div>
    )
  }

  render() {
    const dates = [
      moment.tz('2017-11-28', 'YYYY-MM-DD', timezone),
      moment.tz('2017-11-30', 'YYYY-MM-DD', timezone),
      moment.tz('2017-12-01', 'YYYY-MM-DD', timezone),
    ]

    return (
      <div>
        <h1>Available calendar</h1>
        <KoCalendar
          timezone={timezone}
          dates={dates}
          startTime={9}
          endTime={18}
          dateFormat="MM-DD (ddd)"
          events={[]}
          eventItem={this.eventItem}
        />
      </div>
    );
  }
}
