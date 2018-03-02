import * as React from 'react';
import { Row, Col, Button, Alert, Icon } from 'antd';

import Presentation from '../models/Presentation';
import DatetimeUtil from '../utils/DatetimeUtil';
import { DateConstants } from '../models/Constants';
import Faculty from '../models/Faculty';

export interface SchedulingDateProps {
  presentation: Presentation;
  faculties: Faculty[];
  displayClear: boolean;
  clearPresentationSlot: () => void;
}

export default class SchedulingDate extends React.Component<SchedulingDateProps, any> {
  constructor(props: SchedulingDateProps) {
    super(props);

    this.calendarText = this.calendarText.bind(this);
    this.facultiesText = this.facultiesText.bind(this);
  }

  calendarText() {
    const { presentation } = this.props;

    if (presentation.start) {
      const startM = DatetimeUtil.getMomentFromISOString(presentation.start);
      const start = DatetimeUtil.formatDate(startM, DateConstants.hourMinFormat);

      const endM = DatetimeUtil.getMomentFromISOString(presentation.end);
      const end = DatetimeUtil.formatDate(endM, DateConstants.hourMinFormat);

      const date = DatetimeUtil.formatDate(startM, DateConstants.dateFormat);

      return (
        <div>
          <p>Your presentation is from <b>{start}</b> to <b>{end}</b> on <b>{date}</b></p>
        </div>
      )
    } else {
      return (
        <div>
          <p>You haven't picked the presentation date time. </p>
          <p>Please click the time in the calendar.</p>
        </div>
      )
    }
  }

  facultiesText() {
    const { presentation } = this.props;

    if (presentation.faculties.length === 0) {
      return (
        <div>
          <p>No faculties are selected.</p>
        </div>
      )
    } else {
      const isAdminSelected = this.props.presentation.faculties.filter(fid => {
        const faculty = this.props.faculties.find(faculty => faculty._id === fid);
        return faculty && faculty.isAdmin;
      })
        .length > 0;

      return (
        <div>
          {this.props.presentation.faculties.map(fid => {
            const faculty = this.props.faculties.find(f => f._id === fid);
            if (faculty) {
              return <p key={faculty._id}>Dr. {faculty.firstName} {faculty.lastName} {faculty.isAdmin && <span>(SD 2 Faculty)</span>}</p>
            } else {
              return null;
            }
          })}
          {this.props.presentation.faculties.length < 4 && (
            <div style={{ marginBottom: '1em' }}>
              <Alert message="Please select 4 faculties including your senior design 2 faculty." type="warning" showIcon />
            </div>
          )}
          {!isAdminSelected && (
            <div style={{ marginBottom: '1em' }}>
              <Alert message="Please select the faculty of your senior design 2 class." type="warning" showIcon />
            </div>
          )}
        </div>
      )
    }
  }

  render() {
    return (
      <div className="scheduling-date">
        <div className="row">
          <Icon
            type="calendar"
            style={{ fontSize: '20px', marginRight: '8px' }}
          />
          <div>{this.calendarText()}</div>
        </div>
        <div className="row">
          <Icon
            type="team"
            style={{ fontSize: '20px', marginRight: '8px' }}
          />
          <div>{this.facultiesText()}</div>
        </div>
        {this.props.displayClear && (
          <p>
            <Button size="small" onClick={this.props.clearPresentationSlot} icon="delete">Clear</Button>
          </p>
        )}
        <style jsx>{`
          .scheduling-date {
            padding: 16px;
            background-color: #fbfbfb;
            border: 1px solid #d9d9d9;
            border-radius: 6px;
          }
          .row {
            display: flex;
          }
        `}</style>
      </div>
    );
  }
}
