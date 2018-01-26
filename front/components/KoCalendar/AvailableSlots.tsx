import * as React from 'react';
import ObjectID from 'bson-objectid';

import { KoCalendarConstants, DateConstants } from '../../models/Constants';
import TimeSlot from '../../models/TimeSlot';
import DatetimeUtil from '../../utils/DatetimeUtil';
import AvailableSlotTile from './AvailableSlotTile';

export interface AvailableSlotsProps {
  ruler: number[];
  availableSlots: TimeSlot[];
  presentationDate: TimeSlot;
  onAvailableSlotChange: (updatedAvailableSlot: TimeSlot, isDelete: boolean) => void;
}

export default class AvailableSlots extends React.Component<AvailableSlotsProps, any> {
  constructor(props: AvailableSlotsProps) {
    super(props);

    this.onClick = this.onClick.bind(this);
  }

  onClick(event: React.MouseEvent<HTMLDivElement>) {
    const start = Math.floor(event.nativeEvent.offsetY / KoCalendarConstants.rulerColumnHeightNum + this.props.ruler[0]);
    const dateStr = DatetimeUtil.formatDate(this.props.presentationDate.start, DateConstants.dateFormat);

    const slot = {
      _id: ObjectID.generate(),
      start: DatetimeUtil.getMomentByFormat(`${dateStr} ${start}`, `${DateConstants.dateFormat} H`),
      end: DatetimeUtil.getMomentByFormat(`${dateStr} ${start + 1}`, `${DateConstants.dateFormat} H`),
    }
    const newSlot = this.adjustSlot(slot);

    if (newSlot) {
      console.log(newSlot);
      console.log('start', DatetimeUtil.formatDate(newSlot.start, `${DateConstants.dateFormat} ${DateConstants.hourFormat}`));
      console.log('end', DatetimeUtil.formatDate(newSlot.end, `${DateConstants.dateFormat} ${DateConstants.hourFormat}`));
  
      this.props.onAvailableSlotChange(newSlot, false);
    }
  }

  /**
   * Returns adjusted slop that does not overlap with existing props.availableSlots
   */
  private adjustSlot(slot: TimeSlot) {
    // Check if there is one availableSlot that can contain given slot
    const doesOverlap = this.props.availableSlots.some(slotA => {
      return (slotA.start.isBefore(slot.start) || slotA.start.isSame(slot.start)) &&
        (slotA.end.isAfter(slot.end) || slotA.end.isSame(slot.end));
    });

    if (doesOverlap) {
      return false;
    }

    // If the some slot's end is in the range, adjust start
    let slotA = this.props.availableSlots.find(slotA => {
      return slotA.end.isAfter(slot.start) && slotA.end.isBefore(slot.end);
    });
    if (slotA) {
      slot.start = slotA.end;
    }

    // If some slot's start is in the range, adjust end
    slotA = this.props.availableSlots.find(slotA => {
      return slotA.start.isAfter(slot.start) && slotA.start.isBefore(slot.end);
    });
    if (slotA) {
      slot.end = slotA.start;
    }

    // If start and end has a time gap, return given slot. Otherwise, return false.
    if (slot.start.isBefore(slot.end)) {
      return slot;
    } else {
      return false;
    }
  }

  render() {
    return (
      <div
        className="ko-availableslots_wrapper"
        onClick={this.onClick}
      >
        {this.props.availableSlots.map(slot => (
          <AvailableSlotTile
            key={slot._id}
            slot={slot}
            ruler={this.props.ruler}
            onAvailableSlotChange={this.props.onAvailableSlotChange}
          />
        ))}
        <style jsx>{`
          .ko-availableslots_wrapper {
            position: absolute;
            left: 0;
            top: calc(${KoCalendarConstants.dayTitleHeight} - 1px);
            height: calc(100% - ${KoCalendarConstants.dayTitleHeight});
            width: 100%;
            z-index: 1;
          }
        `}
        </style>
      </div>
    );
  }
}
