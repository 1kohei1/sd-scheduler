import * as React from 'react';

import { KoCalendarConstants } from '../../models/Constants';
import DatetimeUtil from '../../utils/DatetimeUtil';

export interface RulerProps {
  hours: number[];
}

export default class Ruler extends React.Component<RulerProps, any> {
  constructor(props: RulerProps) {
    super(props);
  }

  render() {
    return (
      <div className="ko-ruler_container">
        {this.props.hours.map(hour => (
          <div className="ko-ruler_cell" key={hour}>
            {DatetimeUtil.convertTo12Hr(hour)}
          </div>
        ))}
        <style jsx>{`
          .ko-ruler_container {
            padding-top: ${KoCalendarConstants.dayTitleHeight};
          }
          .ko-ruler_cell {
            width: ${KoCalendarConstants.rulerColumnWidth};
            height: ${KoCalendarConstants.rulerColumnHeight};
            text-align: right;
          }
        `}
        </style>
      </div>
    );
  }
}
