import * as React from 'react';
import ObjectID from 'bson-objectid';
import { Observable, Subscription } from 'rxjs';

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
  private wrapperRef: HTMLDivElement;
  private subscriptions: Subscription[] = [];

  constructor(props: AvailableSlotsProps) {
    super(props);

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onWrapperRef = this.onWrapperRef.bind(this);
    this.onResizeStart = this.onResizeStart.bind(this);
  }

  onMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    const targetDOM = event.target as HTMLElement;
    const className = targetDOM.className;
    if (!className.includes('ko-availableslots_wrapper')) {
      return;
    }

    const start = Math.floor(event.nativeEvent.offsetY / KoCalendarConstants.rulerColumnHeightNum + this.props.ruler[0]);
    const dateStr = DatetimeUtil.formatDate(this.props.presentationDate.start, DateConstants.dateFormat);

    const slot = {
      _id: ObjectID.generate(),
      start: DatetimeUtil.getMomentByFormat(`${dateStr} ${start}`, `${DateConstants.dateFormat} H`),
      end: DatetimeUtil.getMomentByFormat(`${dateStr} ${start + 1}`, `${DateConstants.dateFormat} H`),
    }
    const newSlot = this.adjustSlot(slot);

    if (newSlot) {
      this.props.onAvailableSlotChange(newSlot as TimeSlot, false);
      this.onResizeStart(newSlot as TimeSlot);
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

  onWrapperRef(ref: HTMLDivElement | null) {
    if (ref) {
      this.wrapperRef = ref;
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    })
  }

  onResizeStart(slot: TimeSlot) {
    const sub = Observable.fromEvent<MouseEvent>(this.wrapperRef, 'mousemove')
      .takeUntil(Observable.fromEvent(window.document, 'mouseup'))
      // Convert to how many blocks apart from .ko-availableslots_wrapper
      .map(event => {
        // clientY gets Y coordinate of the mouse in relate to the window.
        // this.wrapperRef.getClientRects()[0].top gets how far the top of the elemenet from the top window
        // Reference: http://javascript.info/coordinates
        const diff = event.clientY - this.wrapperRef.getClientRects()[0].top;
        // blockHeight represents how many pixel is for 30 min
        const blockHeight = KoCalendarConstants.rulerColumnHeightNum / 2;
        return Math.floor(diff / blockHeight);
      })
      .distinctUntilChanged()
      .subscribe((num30: number) => {
        const newSlot = {
          _id: slot._id,
          start: slot.start,
          end: DatetimeUtil.addToMoment(this.props.presentationDate.start, num30 * 30, 'm'),
        }

        // Check if slot overlaps with existing ones
        this.props.availableSlots.forEach(slotA => {
          if (slotA._id !== newSlot._id && newSlot.start.isBefore(slotA.start) && newSlot.end.isAfter(slotA.start)) {
            newSlot.end = slotA.start;
          }
        });

        if (newSlot.end.diff(newSlot.start, 'hour') >= 1) {
          this.props.onAvailableSlotChange(newSlot, false);
        }
      });

    this.subscriptions.push(sub);
  }

  render() {
    return (
      <div
        className="ko-availableslots_wrapper"
        onMouseDown={this.onMouseDown}
        ref={this.onWrapperRef}
      >
        {this.props.availableSlots.map(slot => (
          <AvailableSlotTile
            key={slot._id}
            slot={slot}
            ruler={this.props.ruler}
            onAvailableSlotChange={this.props.onAvailableSlotChange}
            onResizeStart={this.onResizeStart}
          />
        ))}
        <style jsx>{`
          .ko-availableslots_wrapper {
            position: absolute;
            left: 0;
            top: calc(${KoCalendarConstants.dayTitleHeight} - 1px);
            height: calc(100% - ${KoCalendarConstants.dayTitleHeight} + 15px);
            width: 100%;
            z-index: 1;
          }
        `}
        </style>
      </div>
    );
  }
}
