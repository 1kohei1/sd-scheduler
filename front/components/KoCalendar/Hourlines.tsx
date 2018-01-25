import * as React from 'react';
import * as shortid from 'shortid';

import { KoCalendarConstants } from '../../models/Constants';

export interface HourlinesProps {
  isLastColumn: boolean;
  hours: number[];
}

export default class Hourlines extends React.Component<HourlinesProps, any> {
  render() {
    return (
      <div>
        {this.props.hours.map(hour => (
          <div key={shortid.generate()}>
            <div className="ko-hour_cell ko-hour_cell_top"></div>
            <div className="ko-hour_cell ko-hour_cell_bottom"></div>
          </div>
        ))}
        <style jsx>{`
          .ko-hour_cell {
            height: calc(${KoCalendarConstants.rulerColumnHeight} / 2 - 1px);
            border-left: 1px solid #ccc;
            box-sizing: content-box;
            ${this.props.isLastColumn ? 'border-right: 1px solid #ccc' : null}
          }
          .ko-hour_cell_top {
            border-bottom: 1px dashed #ccc;
          }
          .ko-hour_cell_bottom {
            border-bottom: 1px solid #ccc;
          }
        `}
        </style>
      </div>
    );
  }
}
