import * as React from 'react';
import { Icon } from 'antd';

import { KoCalendarConstants } from '../../models/Constants';
import TimeSlot from '../../models/TimeSlot';
import DatetimeUtil from '../../utils/DatetimeUtil';

export interface AvailableSlotTileProps {
  ruler: number[];
  slot: TimeSlot;
  presentationDate: TimeSlot;
  onAvailableSlotChange: (updatedAvailableSlot: TimeSlot, isDelete: boolean, updateDB?: boolean) => void;
  onResizeStart: (slot: TimeSlot) => void;
  onMoveStart: (e: React.MouseEvent<HTMLDivElement>, slot: TimeSlot) => void;
}

interface AvailableslotTileState {
  isHover: boolean;
}

export default class AvailableSlotTile extends React.Component<AvailableSlotTileProps, any> {
  constructor(props: AvailableSlotTileProps) {
    super(props);

    this.state = {
      isHover: false
    };

    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    this.props.onAvailableSlotChange(this.props.slot, true, true);
  }

  onMouseEnter() {
    this.setState({
      isHover: true
    });
  }

  onMouseLeave() {
    this.setState({
      isHover: false
    });
  }

  render() {
    const presentationStart = parseInt(DatetimeUtil.formatDate(this.props.presentationDate.start, 'H'));
    const start = DatetimeUtil.convertToHourlyNumber(this.props.slot.start);
    const end = DatetimeUtil.convertToHourlyNumber(this.props.slot.end);

    const top = `${(start - presentationStart) * KoCalendarConstants.rulerColumnHeightNum}px`;
    const height = `${(end - start) * KoCalendarConstants.rulerColumnHeightNum}px`;

    return (
      <div
        className="ko-availableslotstile"
        style={{ top, height }}
        key={this.props.slot._id}
        onMouseDown={(e) => this.props.onMoveStart(e, this.props.slot)}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
      >
        <span>
          {DatetimeUtil.formatDate(this.props.slot.start, KoCalendarConstants.tileTimeFormat)}
          -
          {DatetimeUtil.formatDate(this.props.slot.end, KoCalendarConstants.tileTimeFormat)}
        </span>
        {this.state.isHover && (
          <div
            className="ko-availableslotstile_delete"
            onClick={this.onClick}
          >
            <Icon type="close" style={{ color: '#4477BD', fontSize: '20px', padding: '1px' }} />
          </div>
        )}
        <div
          className="ko-availableslotstile_slider"
          onMouseDown={(e) => this.props.onResizeStart(this.props.slot)}>
          ...
        </div>
        <style jsx>{`
          .ko-availableslotstile {
            position: absolute;
            background-color: ${KoCalendarConstants.tileBackgroundColor};
            opacity: 0.8;
            left: 1px;
            width: calc(100% - 2px);
            color: white;
            font-size: 12px;
            padding: 0 8px;
            z-index: 2;
            cursor: -webkit-grab;
            cursor: grab;
          }
          .ko-availableslotstile_slider {
            position: absolute;
            bottom: 0;
            width: calc(100% - 16px);
            text-align: center;
            cursor: ns-resize;
          }
          .ko-availableslotstile_delete {
            position: absolute;
            top: 1px;
            right: 1px;
            background-color: #fff;
            cursor: pointer;
          }
        `}
        </style>
      </div>
    );
  }
}
