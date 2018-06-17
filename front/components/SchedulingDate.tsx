import * as React from 'react';
import { Icon } from 'antd';

import Presentation from '../models/Presentation';
import DatetimeUtil from '../utils/DatetimeUtil';
import { DateConstants } from '../models/Constants';
import Faculty from '../models/Faculty';

export interface SchedulingDateProps {
  presentation: Presentation;
  faculties: Faculty[];
}

export default class SchedulingDate extends React.Component<SchedulingDateProps, any> {
  constructor(props: SchedulingDateProps) {
    super(props);

    this.calendarText = this.calendarText.bind(this);
    this.facultiesText = this.facultiesText.bind(this);
  }

  calendarText() {
    const { presentation } = this.props;

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
  }

  facultiesText() {
    const { presentation } = this.props;

    return (
      <div>
        {presentation.faculties.map(fid => {
          const faculty = this.props.faculties.find(f => f._id === fid);
          if (faculty) {
            return <p key={faculty._id}>Dr. {faculty.firstName} {faculty.lastName} {faculty.isAdmin && <span>(SD 2 Faculty)</span>}</p>
          } else {
            return null;
          }
        })}
        {presentation.externalFaculties.map(faculty => (
          <p key={faculty._id}>
            Dr. {faculty.firstName} {faculty.lastName} (Other department faculty)
          </p>
        ))}
      </div>
    )
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
