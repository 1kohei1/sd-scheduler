import * as React from 'react';
import { Row, Col } from 'antd';

import AppLayout from '../components/AppLayout';
import InitialProps from '../models/InitialProps';
import { Semester } from '../models/Semester';
import Faculty from '../models/Faculty';
import AvailableSlot from '../models/AvailableSlot';
import SchedulingCalendar from '../components/SchedulingCalendar/SchedulingCalendar';
import Api from '../utils/Api';
import Presentation from '../models/Presentation';
import Loading from '../components/Loading';

interface ScheduleProps {
  facultiesInSemester: Faculty[];
  semester: Semester;
}

interface ScheduleState {
  availableSlots: AvailableSlot[],
  presentations: Presentation[],
  loading: boolean;
  err: string;
}

const columnLayout = {
  md: {
    span: 24,
  },
  lg: {
    span: 22,
    offset: 1
  },
  xl: {
    span: 20,
    offset: 2,
  }
};

export default class Schedule extends React.Component<ScheduleProps, ScheduleState> {
  static async getInitialProps(props: InitialProps) {
    const semesters: Semester[] = await Api.getSemesters();
    const semester = semesters[0];

    const ids = semester.faculties.map(fid => `_id[$in]=${fid}`);
    const facultiesInSemester: Faculty[] = await Api.getFaculties(`${ids.join('&')}`);

    return {
      facultiesInSemester,
      semester,
    };
  }

  constructor(props: ScheduleProps) {
    super(props);

    this.state = {
      availableSlots: [],
      presentations: [],
      loading: true,
      err: '',
    };
  }

  componentDidMount() {
    this.getAvailableSlots();
    this.getPresentations();
  }

  private async getAvailableSlots() {
    const ids = this.props.facultiesInSemester.map(f => f._id);
    const facultyQuery = this.props.facultiesInSemester.map(f => `faculty[$in]=${f._id}`);
    const query = `semester=${this.props.semester._id}&${facultyQuery.join('&')}`;

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

  private async getPresentations() {
    // Get presentations
    const query = `semester=${this.props.semester._id}`;
  }

  render() {
    return (
      <AppLayout>
        <Row>
          <Col
            {...columnLayout}
          >
            <SchedulingCalendar
              semester={this.props.semester}
              faculties={this.props.facultiesInSemester}
              availableSlots={this.state.availableSlots}
              presentations={this.state.presentations}
              loading={this.state.loading}
            />
          </Col>
        </Row>
      </AppLayout>
    )
  }
}