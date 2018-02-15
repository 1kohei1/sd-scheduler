import * as React from 'react';
import { Row, Col, Button } from 'antd';
import ObjectID from 'bson-objectid';
import * as moment from 'moment-timezone';
import Link from 'next/link'

import AppLayout from '../components/AppLayout';
import InitialProps from '../models/InitialProps';
import { Semester } from '../models/Semester';
import SchedulingFilter from '../components/SchedulingCalendar/SchedulingFilter';
import SchedulingCalendar from '../components/SchedulingCalendar/SchedulingCalendar';
import { DateConstants } from '../models/Constants';
import Api from '../utils/Api';

interface Props {
  faculties: string[];
  semester: Semester;
}

interface IndexState {
  presentationDateIndex: number;
}

const columnLayout = {
  xs: {
    span: 22,
    offset: 1,
  },
  lg: {
    span: 18,
    offset: 3
  },
};

class Index extends React.Component<Props, {}> {
  static async getInitialProps(props: InitialProps) {
    const semesters: Semester[] = await Api.getSemesters();

    return {
      faculties: props.query.faculties.split(','),
      semester: semesters[0],
    };
  }

  constructor(props: Props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <AppLayout>
        <Row>
          <Col
            {...columnLayout}
          >
            <SchedulingFilter 
              semester={this.props.semester}
              faculties={this.props.faculties}
            />
            <SchedulingCalendar 
              semester={this.props.semester}
              faculties={this.props.faculties}
            />
          </Col>
        </Row>
      </AppLayout>
    )
  }
}
export default Index
