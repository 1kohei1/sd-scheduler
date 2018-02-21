import * as React from 'react';

import Presentation from '../models/Presentation';

export interface SchedulingDateProps {
  presentation: Presentation;
}

export default class SchedulingDate extends React.Component<SchedulingDateProps, any> {
  render() {
    return (
      <div className="scheduling-date">
        ABC
        <style jsx>{`
          .scheduling-date {
            padding: 16px;
          }
        `}</style>
      </div>
    );
  }
}
