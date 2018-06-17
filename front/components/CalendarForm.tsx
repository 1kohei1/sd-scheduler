import * as React from 'react';
import { Row, Col, Form, Checkbox, Collapse } from 'antd';

import Faculty from '../models/Faculty';
import { ScheduleFormLayoutConstants } from '../models/Constants';

export interface CalendaroFormProps {
  faculties: Faculty[];
  checkedFaculties: string[];
  onFacultyChange: (fid: string, checked: boolean) => void;
}

export default class CalendaroForm extends React.Component<CalendaroFormProps, any> {
  render() {
    return (
      <Collapse
        style={{ marginBottom: '16px' }}
      >
        <Collapse.Panel
          header="Filter data"
          key="filter"
        >
          <Form>
            <Form.Item
              label="Presentation dates of"
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
              label="Faculties"
              {...ScheduleFormLayoutConstants.layoutWithColumn}
              style={{ marginBottom: 0 }}
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
        </Collapse.Panel>
      </Collapse>
    );
  }
}
