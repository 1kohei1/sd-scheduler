import * as React from 'react';

import { SchedulingCalendarConstants } from '../../models/Constants';

export interface HourLinesProps {
  hoursArray: number[];
  isLastFaculty: boolean;
}

export default class HourLines extends React.Component<HourLinesProps, any> {
  render() {
    const halfWidth = `${SchedulingCalendarConstants.columnWidthNum / 2}px`;
    const heightOffset = this.props.isLastFaculty ? 2 : 1;

    return (
      <div className="hourlines-container">
        {this.props.hoursArray.map((hour, index) => (
          <div key={hour} className="hour-wrapper">
            <div className="hour hour-left"></div>
            <div className={`hour hour-right ${index === this.props.hoursArray.length - 1 ? 'hour-last' : ''}`}></div>
          </div>
        ))}
        <style jsx>{`
          .hourlines-container {
            display: flex;
            border-top: 1px solid #ccc;
            ${this.props.isLastFaculty ? 'border-bottom: 1px solid #ccc' : null}
          }
          .hour-wrapper {
            display: flex;
          }
          .hour {
            display: border-box;
            height: ${SchedulingCalendarConstants.rowHeightNum - heightOffset}px;
            min-width: ${halfWidth};
          }
          .hour-left {
            border-left: 1px solid #ccc;
          }
          .hour-right {
            border-left: 1px dashed #ccc;
          }
          .hour-last {
            border-right: 1px solid #ccc;
          }
        `}</style>
      </div>
    );
  }
}
