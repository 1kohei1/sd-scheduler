import * as React from 'react';
import { Row, Col, Button } from 'antd';
import ObjectID from 'bson-objectid';
import * as moment from 'moment-timezone';
import Link from 'next/link'

import AppLayout from '../components/AppLayout';
import InitialProps from '../models/InitialProps';
import { Semester } from '../models/Semester';
import Faculty from '../models/Faculty';
import AvailableSlot from '../models/AvailableSlot';
import SchedulingFilter from '../components/SchedulingCalendar/SchedulingFilter';
// import SchedulingCalendar from '../components/SchedulingCalendar/SchedulingCalendar';
import { DateConstants } from '../models/Constants';
import Api from '../utils/Api';

interface Props {
  checkedFaculties: string[];
  faculties: Faculty[];
  semester: Semester;
}

interface IndexState {
  presentationDateIndex: number;
  availableSlots: AvailableSlot[],
  loading: boolean;
  err: string;
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

class Index extends React.Component<Props, IndexState> {
  static async getInitialProps(props: InitialProps) {
    const semesters: Semester[] = await Api.getSemesters();
    const faculties: Faculty[] = await Api.getFaculties();

    const semester = semesters[0];
    const facultiesInSemester = faculties.filter((f) => {
      return semester.faculties.indexOf(f._id) >= 0;
    });

    let checkedFaculties = [];
    if (props.query.faculties) {
      checkedFaculties = props.query.faculties.split(',');
    }

    return {
      checkedFaculties,
      faculties: facultiesInSemester,
      semester,
    };
  }

  constructor(props: Props) {
    super(props);

    this.state = {
      presentationDateIndex: 0,
      availableSlots: [],
      loading: true,
      err: '',
    };

    this.getAvailableSlots();
  }

  private async getAvailableSlots() {
    const ids = this.props.faculties.map(f => f._id);
    const query = `ids=${ids.join(',')}&semester=${this.props.semester._id}`;
    
    try {
      const availableSlots = await Api.getAvailableSlots(query);
      this.setState({
        loading: false,
        availableSlots,
      });
    } catch (err) {
      this.setState({
        err: err.message,
        loading: false,
      })
    }
  }

  render() {
    return (
      <AppLayout>
        <Row>
          <Col
            {...columnLayout}
          >
            <SchedulingFilter 
              checkedFaculties={this.props.checkedFaculties}
              faculties={this.props.faculties}
            />
            {/* <SchedulingCalendar 
              semester={this.props.semester}
              faculties={this.props.faculties}
            /> */}
          </Col>
        </Row>
      </AppLayout>
    )
  }
}
export default Index
