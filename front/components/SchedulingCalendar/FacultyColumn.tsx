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
  facultiesToDisplay: Faculty[];
  updateCheckedFaculties: (ids: string[]) => void;
}

interface FacultyColumnState {
  visibleFaculties: {
    [key: string]: boolean;
  }
}

export default class FacultyColumn extends React.Component<FacultyColumnProps, FacultyColumnState> {
  constructor(props: FacultyColumnProps) {
    super(props);

    const newState: FacultyColumnState = {
      visibleFaculties: {}
    };
    this.props.faculties.forEach(f => {
      newState.visibleFaculties[f._id] = this.props.checkedFaculties.indexOf(f._id) >= 0;
    });

    this.state = newState;

    this.content = this.content.bind(this);
    this.onVisibleChange = this.onVisibleChange.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  onChange(_id: string, checked: boolean) {
    this.setState((prevState: FacultyColumnState, props: FacultyColumnProps) => {
      const { visibleFaculties } = prevState;
      visibleFaculties[_id] = checked;
      return {
        visibleFaculties
      };
    })
  }

  content() {
    return (
      <div>
        {this.props.faculties.map((f => (
          <div key={f._id}>
            <Checkbox
              checked={this.state.visibleFaculties[f._id]}
              onChange={(e) => this.onChange(f._id, e.target.checked)}
            >
              Dr. {f.firstName} {f.lastName}
            </Checkbox>
          </div>
        )))}
      </div>
    )
  }

  onVisibleChange(visible: boolean) {
    if (!visible) {
      const ids = Object.entries(this.state.visibleFaculties)
        .filter(([_id, checked]) => checked)
        .map(([_id]) => _id);
      this.props.updateCheckedFaculties(ids);
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
        {this.props.facultiesToDisplay.map(faculty => (
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
