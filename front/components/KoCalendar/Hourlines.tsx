import * as React from 'react';
import ObjectID from 'bson-objectid';

import { KoCalendarConstants } from '../../models/Constants';
import TimeSlot from '../../models/TimeSlot';
import DatetimeUtil from '../../utils/DatetimeUtil';

export interface HourlinesProps {
  presentationDate: TimeSlot;
  isLastColumn: boolean;
  ruler: number[];
}

export default class Hourlines extends React.Component<HourlinesProps, any> {
  render() {
    const startHour = parseInt(DatetimeUtil.formatDate(this.props.presentationDate.start, 'H'));
    const endHour = parseInt(DatetimeUtil.formatDate(this.props.presentationDate.end, 'H'));

    return (
      <div>
        {this.props.ruler.map(ruler => (
          <div
            key={ObjectID.generate()}
            className={`${ruler < startHour || endHour <= ruler ? 'ko-hour_cell_inactive' : ''}`}
          >
            <div className={`ko-hour_cell ${startHour <= ruler && ruler < endHour ? 'ko-hour_cell_top' : ''}`}></div>
            <div className={`ko-hour_cell ${startHour <= ruler && ruler < endHour ? 'ko-hour_cell_bottom' : ''}`}></div>
          </div>
        ))}
        <style jsx>{`
          .ko-hour_cell {
            height: calc(${KoCalendarConstants.rulerColumnHeight} / 2 - 1px);
            border-left: 1px solid #ccc;
            box-sizing: content-box;
            border-bottom: 1px dashed rgba(0, 0, 0, 0);
            ${this.props.isLastColumn ? 'border-right: 1px solid #ccc' : null}
          }
          .ko-hour_cell_top {
            border-bottom: 1px dashed #ccc;
          }
          .ko-hour_cell_bottom {
            border-bottom: 1px solid #ccc;
          }
          .ko-hour_cell_inactive {
            background-color: #888;
          }
        `}
        </style>
      </div>
    );
  }
}
