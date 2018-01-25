import * as React from 'react';

import { Constants } from './Constants';

export interface RulerProps {
  startTime: number;
  endTime: number;
}

export default class Ruler extends React.Component<RulerProps, any> {
  constructor(props: RulerProps) {
    super(props);
  }

  convertTo12Hr(hour: number) {
    if (hour < 12) {
      return `${hour} AM`;
    } else if (hour === 12) {
      return `${hour} PM`;
    } else {
      return `${hour - 12} PM`;
    }
  }

  render() {
    return (
      <div className="ko-ruler_container">
        
        <style jsx>{`
          .ko-ruler_container {
            padding-top: ${Constants.dayTitleHeight};
          }
        `}
        </style>
      </div>
    );
  }
}
