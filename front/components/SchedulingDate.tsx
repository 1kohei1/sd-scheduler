import * as React from 'react';
import { Row, Col, Button, Icon } from 'antd';

import Presentation from '../models/Presentation';
import DatetimeUtil from '../utils/DatetimeUtil';
import { DateConstants } from '../models/Constants';

export interface SchedulingDateProps {
  presentation: Presentation;
  clearPresentationSlot: () => void;
}

export default class SchedulingDate extends React.Component<SchedulingDateProps, any> {
  constructor(props: SchedulingDateProps) {
    super(props);

    this.text = this.text.bind(this);
  }

  text() {
    const { presentation } = this.props;

    if (presentation.start) {
      const startM = DatetimeUtil.getMomentFromISOString(presentation.start);
      const start = DatetimeUtil.formatDate(startM, DateConstants.hourFormat);

      const endM = DatetimeUtil.getMomentFromISOString(presentation.end);
      const end = DatetimeUtil.formatDate(endM, DateConstants.hourFormat);

      const date = DatetimeUtil.formatDate(startM, DateConstants.dateFormat);

      return (
        <div>
          <p>Your presentation is from <b>{start}</b> to <b>{end}</b> on <b>{date}</b></p>
          <p>
            <Button size="small" onClick={this.props.clearPresentationSlot} icon="delete">Clear</Button>
          </p>
        </div>
      )
    } else {
      return (
        <div>
          <p>You haven't picked the presentation date time. </p>
          <p>Please click the time in the calendar where you would like to do the presentation.</p>
        </div>
      )
    }
  }

  render() {
    return (
      <div className="scheduling-date">
        <Icon
          type="calendar"
          style={{ fontSize: '20px', marginRight: '8px' }}
        />
        <div>{this.text()}</div>
        <style jsx>{`
          .scheduling-date {
            margin: 16px 0;
            padding: 16px;
            background-color: #fbfbfb;
            border: 1px solid #d9d9d9;
            border-radius: 6px;
            display: flex;
          }
        `}</style>
      </div>
    );
  }
}
