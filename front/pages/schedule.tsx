import * as React from 'react';
import { Row, Col, Steps, Button } from 'antd';

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
  current: number;
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
      current: 0,
      loading: true,
      err: '',
    };

    this.content = this.content.bind(this);
    this.changeCurrent = this.changeCurrent.bind(this);
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

  content() {
    if (this.state.current === 0) {
      return (
        <SchedulingCalendar
          semester={this.props.semester}
          faculties={this.props.facultiesInSemester}
          availableSlots={this.state.availableSlots}
          presentations={this.state.presentations}
          loading={this.state.loading}
        />
      )
    }
  }

  changeCurrent(diff: number) {
    this.setState((prevState: ScheduleState, props: ScheduleProps) => {
      return {
        current: prevState.current + diff,
      }
    });
  }

  /**
   * Step 1
   */

  render() {
    return (
      <AppLayout>
        <Row>
          <Col
            {...columnLayout}
          >
            <div className="steps">
              <Steps
                current={this.state.current}
              >
                <Steps.Step title="Pick presentation time" description="from the calendar below" />
                <Steps.Step title="Pick faculties" description="Select committee member" />
                <Steps.Step title="Register your grroup" description="Please register your group" />
                <Steps.Step title="Done" />
              </Steps>
            </div>
            <div className="steps-content">
              {this.content()}
            </div>
            <div className="steps-action">
              <Button
                disabled={this.state.current === 0}
                onClick={e => this.changeCurrent(-1)}
              >
                Previous
              </Button>
              <Button
                type="primary"
                onClick={e => this.changeCurrent(1)}
              >
                Next
              </Button>
            </div>
          </Col>
        </Row>
        <style jsx>{`
          .steps {
            margin: 16px 0;
          }
          .steps-action {
            border-top: 1px solid #eee;
            display: flex;
            padding: 16px 0;
            margin-top: 16px;
            justify-content: space-between;
          }
        `}</style>
      </AppLayout>
    )
  }
}