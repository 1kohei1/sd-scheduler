import * as React from 'react';

export interface CalendarBodyProps {
}

export default class CalendarBody extends React.Component<CalendarBodyProps, any> {
  render() {
    return (
      <div className="ko-calendar-body">
        Calendar body
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
