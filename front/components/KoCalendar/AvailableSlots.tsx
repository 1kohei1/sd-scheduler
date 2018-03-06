import * as React from 'react';
import ObjectID from 'bson-objectid';
import { Observable } from 'rxjs';

import { KoCalendarConstants, DateConstants } from '../../models/Constants';
import TimeSlot from '../../models/TimeSlot';
import DatetimeUtil from '../../utils/DatetimeUtil';
import AvailableSlotTile from './AvailableSlotTile';

export interface AvailableSlotsProps {
  ruler: number[];
  availableSlots: TimeSlot[];
  presentationDate: TimeSlot;
  onAvailableSlotChange: (updatedAvailableSlot: TimeSlot, isDelete: boolean, updateDB?: boolean) => void;
}

// blockHeight represents how many pixel is for 30 min
const blockHeight = KoCalendarConstants.rulerColumnHeightNum / 2;

export default class AvailableSlots extends React.Component<AvailableSlotsProps, any> {
  private wrapperRef: HTMLDivElement = document.createElement('div');
  private isResizing: boolean = false;

  constructor(props: AvailableSlotsProps) {
    super(props);

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onWrapperRef = this.onWrapperRef.bind(this);
    this.onResizeStart = this.onResizeStart.bind(this);
    this.onMoveStart = this.onMoveStart.bind(this);
  }

  onMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    const targetDOM = event.target as HTMLElement;
    const className = targetDOM.className;
    if (!className.includes('ko-availableslots_wrapper')) {
      return;
    }

    const presentationStart = parseInt(DatetimeUtil.formatDate(this.props.presentationDate.start, 'H'));

    const start = Math.floor(event.nativeEvent.offsetY / KoCalendarConstants.rulerColumnHeightNum + presentationStart);
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
   * Adjust given slot so that it does not overlap with existing slot
   */
  private adjustSlot(slot: TimeSlot) {
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

  onResizeStart(slot: TimeSlot) {
    this.isResizing = true;

    const _id = slot._id;

    Observable.fromEvent<MouseEvent>(this.wrapperRef, 'mousemove')
      .takeUntil(Observable.fromEvent(window.document, 'mouseup'))
      // Convert to how many blocks apart from .ko-availableslots_wrapper
      .map(event => {
        // clientY gets Y coordinate of the mouse in relate to the window.
        // this.wrapperRef.getClientRects()[0].top gets how far the top of the elemenet from the top window
        // Reference: http://javascript.info/coordinates
        const diff = event.clientY - this.wrapperRef.getClientRects()[0].top;
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
      }, undefined, () => {
        // When resizing completes, update DB
        const index = this.props.availableSlots.findIndex(slot => slot._id === _id);
        if (index >= 0) {
          this.props.onAvailableSlotChange(this.props.availableSlots[index], false, true);
        }
        this.isResizing = false;
      });
  }

  onMoveStart(e: React.MouseEvent<HTMLDivElement>, slot: TimeSlot) {
    if (this.isResizing) {
      return;
    }

    const targetDOM = e.target as HTMLElement;
    const className = targetDOM.className;
    if (!className.includes('ko-availableslotstile')) {
      return;
    }

    const startClientY = e.clientY;
    const _id = slot._id;

    Observable.fromEvent<MouseEvent>(this.wrapperRef, 'mousemove')
      .takeUntil(Observable.fromEvent(window.document, 'mouseup'))
      .map((event: MouseEvent) => Math.floor((event.clientY - startClientY) / blockHeight))
      .distinctUntilChanged()
      .subscribe((blockDiff: number) => {
        const newSlot = {
          _id: slot._id,
          start: DatetimeUtil.addToMoment(slot.start, blockDiff * 30, 'm'),
          end: DatetimeUtil.addToMoment(slot.end, blockDiff * 30, 'm'),
        };

        const doesOverlap = this.props.availableSlots.some(slotA => DatetimeUtil.doesOverlap(slotA, newSlot));

        if (
          !doesOverlap &&
          (this.props.presentationDate.start.isBefore(newSlot.start) || this.props.presentationDate.start.isSame(newSlot.start)) &&
          (this.props.presentationDate.end.isAfter(newSlot.end) || this.props.presentationDate.end.isSame(newSlot.end))
        ) {
          this.props.onAvailableSlotChange(newSlot, false);
        }
      }, undefined, () => {
        // When moving completes, update DB
        const index = this.props.availableSlots.findIndex(slot => slot._id === _id);
        if (index >= 0) {
          this.props.onAvailableSlotChange(this.props.availableSlots[index], false, true);
        }
      })
  }

  render() {
    const topHourBlock = parseInt(DatetimeUtil.formatDate(this.props.presentationDate.start, 'H')) - this.props.ruler[0];
    const topOffset = `${topHourBlock * KoCalendarConstants.rulerColumnHeightNum}px`;

    const hourBlock =
      parseInt(DatetimeUtil.formatDate(this.props.presentationDate.end, 'H')) -
      parseInt(DatetimeUtil.formatDate(this.props.presentationDate.start, 'H'));
    const height = `${hourBlock * KoCalendarConstants.rulerColumnHeightNum}px`;

    return (
      <div
        className="ko-availableslots_wrapper"
        onMouseDown={this.onMouseDown}
        ref={this.onWrapperRef}
      >
        {this.props.availableSlots.map(slot => (
          <AvailableSlotTile
            key={slot._id}
            ruler={this.props.ruler}
            slot={slot}
            presentationDate={this.props.presentationDate}
            onAvailableSlotChange={this.props.onAvailableSlotChange}
            onResizeStart={this.onResizeStart}
            onMoveStart={this.onMoveStart}
          />
        ))}
        <style jsx>{`
          .ko-availableslots_wrapper {
            position: absolute;
            left: 0;
            top: calc(${KoCalendarConstants.dayTitleHeight} - 1px + ${topOffset});
            height: calc(${height} + 15px);
            width: 100%;
            z-index: 1;
          }
        `}
        </style>
      </div>
    );
  }
}
