import * as React from 'react';
import { Button, Popover, Icon, Checkbox } from 'antd';
import { ClickParam } from 'antd/lib/menu';

import TimeSlot from '../../models/TimeSlot';
import DatetimeUtil from '../../utils/DatetimeUtil';
import Faculty from '../../models/Faculty';
import { SchedulingCalendarConstants, DateConstants } from '../../models/Constants';

export interface FacultyColumnProps {
  presentationDate: TimeSlot;
  checkedFaculties: string[];
  faculties: Faculty[];
}

export default class FacultyColumn extends React.Component<FacultyColumnProps, any> {
  constructor(props: FacultyColumnProps) {
    super(props);

    this.content = this.content.bind(this);
    this.onVisibleChange = this.onVisibleChange.bind(this);
  }

  content() {
    return (
      <div>
        {this.props.faculties.map((f => (
          <div key={f._id}>
            <Checkbox>
              Dr. {f.firstName} {f.lastName}
            </Checkbox>
          </div>
        )))}
      </div>
    )
  }

  onVisibleChange(visible: boolean) {
    if (!visible) {
      // Fetch the checked faculty ids and call passed function
    }
  }

  render() {
    return (
      <div style={{ minWidth: '200px' }}>
        <div className="row" style={{ fontSize: '18px' }}>
          <Popover
            content={this.content()}
            title="Filter faculties"
            trigger="click"
            placement="bottomLeft"
            onVisibleChange={this.onVisibleChange}
          >
            <Button>
              Filter faculties <Icon type="down" />
            </Button>
          </Popover>
        </div>
        {this.props.faculties.map(faculty => (
          <div key={faculty._id} className="row">
            Dr. {faculty.firstName} {faculty.lastName}
          </div>
        ))}
        <style jsx>{`
          .row {
            height: ${SchedulingCalendarConstants.rowHeight};
            line-height: ${SchedulingCalendarConstants.rowHeight};
            padding: 0 16px 0 8px;
          }
        `}</style>
      </div>
    );
  }
}
