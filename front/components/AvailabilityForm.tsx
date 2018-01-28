import * as React from 'react';
import ObjectID from 'bson-objectid';
import { Form, Icon, Select, Button } from 'antd';

import { DateConstants } from '../models/Constants';
import TimeSlot from '../models/TimeSlot';
import DatetimeUtil from '../utils/DatetimeUtil';

export interface AvailabilityFormProps {
  presentationDate: TimeSlot;
  availableSlots: TimeSlot[];
  onAvailableSlotChange: (updatedAvailableSlot: TimeSlot, isDelete: boolean) => void;
}

export default class AvailabilityForm extends React.Component<AvailabilityFormProps, any> {
  constructor(props: AvailabilityFormProps) {
    super(props);

    this.addNewSlot = this.addNewSlot.bind(this);
    this.deleteSlot = this.deleteSlot.bind(this);
  }

  deleteSlot(slot: TimeSlot) {
    this.props.onAvailableSlotChange(slot, true);
  }

  addNewSlot() {

  }

  render() {
    const start = DatetimeUtil.convertToHourlyNumber(this.props.presentationDate.start);
    const end = DatetimeUtil.convertToHourlyNumber(this.props.presentationDate.end);
    const dateStr = DatetimeUtil.formatDate(this.props.presentationDate.start, DateConstants.dateFormat);

    const timeOptions = DatetimeUtil.getTimeOptions(true).filter(option => {
      const m = DatetimeUtil.getMomentByFormat(`${dateStr} ${option}`, `${DateConstants.dateFormat} ${DateConstants.hourMinFormat}`);
      const optionNum = DatetimeUtil.convertToHourlyNumber(m);

      return start <= optionNum && optionNum <= end;
    });

    return (
      <div>
        <h2>{DatetimeUtil.formatDate(this.props.presentationDate.start, DateConstants.dateFormat)}</h2>
        <Form>
          {this.props.availableSlots.map((slot: TimeSlot) => (
            <div style={{ display: 'flex', flexDirection: 'row' }} key={ObjectID.generate()}>
              <Form.Item style={{ marginRight: '8px' }}>
                <Select placeholder="Start time" style={{ width: 120 }}>
                  {timeOptions.map((val: string) => (
                    <Select.Option value={val} key={val}>{val}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item style={{ marginRight: '8px' }}>
                <Select placeholder="End time" style={{ width: 120 }}>
                  {timeOptions.map((val: string) => (
                    <Select.Option value={val} key={val}>{val}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item>
                <Button icon="delete" shape="circle" onClick={(e) => this.deleteSlot(slot)} />
              </Form.Item>
            </div>
          ))}
          <Form.Item>
            <Button type="dashed" onClick={this.addNewSlot} style={{ width: '200px' }}>
              <Icon type="plus" /> Add new availablity
          </Button>
          </Form.Item>
        </Form>
      </div>
    );
  }
}
