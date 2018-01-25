import * as React from 'react';
import { Range } from 'immutable';

import { Constants } from './Constants';
import DatetimeUtil from '../../utils/DatetimeUtil';

export interface RulerProps {
  startTime: number;
  endTime: number;
}

export default class Ruler extends React.Component<RulerProps, any> {
  constructor(props: RulerProps) {
    super(props);
  }

  render() {
    const hours = Range(this.props.startTime, this.props.endTime + 1).toArray();
    
    return (
      <div className="ko-ruler_container">
        {hours.map(hour => (
          <div className="ko-ruler_cell" key={hour}>
            {DatetimeUtil.convertTo12Hr(hour)}
          </div>
        ))}
        <style jsx>{`
          .ko-ruler_container {
            padding-top: ${Constants.dayTitleHeight};
          }
          .ko-ruler_cell {
            width: ${Constants.rulerColumnWidth};
            height: ${Constants.rulerColumnHeight};
            text-align: right;
            color: #666;
            font-size: 12px;
          }
        `}
        </style>
      </div>
    );
  }
}
