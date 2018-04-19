import * as React from 'react';
import { Row, Col, Form, Checkbox, Slider } from 'antd';

import Faculty from '../models/Faculty';
import { ScheduleFormLayoutConstants } from '../models/Constants';

export interface CalendaroFormProps {
  facultyColumnRatio: number;
  onSlideChange: (val: number) => void;
  faculties: Faculty[];
  checkedFaculties: string[];
  onFacultyChange: (fid: string, checked: boolean) => void;
}

export default class CalendaroForm extends React.Component<CalendaroFormProps, any> {
  render() {
    return (
      <Form>
        <Form.Item
          label="Faculty column ratio"
          {...ScheduleFormLayoutConstants.layoutWithColumn}
        >
          <Slider
            defaultValue={1}
            min={0}
            step={0.1}
            max={2}
            value={this.props.facultyColumnRatio}
            onChange={this.props.onSlideChange}
          />
        </Form.Item>
        <Form.Item
          label="Senior design faculty"
          {...ScheduleFormLayoutConstants.layoutWithColumn}
        >
          <Row>
            {
              this.props.faculties
                .filter((f: Faculty) => f.isAdmin)
                .map((f: Faculty) => (
                  <Col
                    key={f._id}
                    span={12}
                  >
                    <Checkbox
                      checked={this.props.checkedFaculties.indexOf(f._id) >= 0}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.props.onFacultyChange(f._id, e.target.checked)}
                    >
                      Dr. {f.firstName} {f.lastName}
                    </Checkbox>
                  </Col>
                ))
            }
          </Row>
        </Form.Item>
        <Form.Item
          label="Faculties to display"
          {...ScheduleFormLayoutConstants.layoutWithColumn}
        >
          <Row>
            {
              this.props.faculties
                .filter((f: Faculty) => !f.isAdmin)
                .map((f: Faculty) => (
                  <Col
                    key={f._id}
                    span={12}
                  >
                    <Checkbox
                      checked={this.props.checkedFaculties.indexOf(f._id) >= 0}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.props.onFacultyChange(f._id, e.target.checked)}
                    >
                      Dr. {f.firstName} {f.lastName}
                    </Checkbox>
                  </Col>
                ))
            }
          </Row>
        </Form.Item>
      </Form>
    );
  }
}
