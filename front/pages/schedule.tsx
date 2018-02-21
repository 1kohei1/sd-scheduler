import * as React from 'react';
import { Row, Col, Steps, Button } from 'antd';
import { Map } from 'immutable';
import { Moment } from 'moment';

import AppLayout from '../components/AppLayout';
import InitialProps from '../models/InitialProps';
import { Semester } from '../models/Semester';
import Faculty from '../models/Faculty';
import AvailableSlot from '../models/AvailableSlot';
import SchedulingCalendar from '../components/SchedulingCalendar/SchedulingCalendar';
import Api from '../utils/Api';
import Presentation, { newPresentation } from '../models/Presentation';
import Loading from '../components/Loading';
import SchedulingDate from '../components/SchedulingDate';

interface ScheduleProps {
  facultiesInSemester: Faculty[];
  semester: Semester;
}

interface ScheduleState {
  schedulingPresentation: Presentation,
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
      schedulingPresentation: newPresentation(this.props.semester._id),
      availableSlots: [],
      presentations: [],
      current: 0,
      loading: true,
      err: '',
    };

    this.content = this.content.bind(this);
    this.changeCurrent = this.changeCurrent.bind(this);
    this.presentationSlotPicked = this.presentationSlotPicked.bind(this);
    this.clearPresentationSlot = this.clearPresentationSlot.bind(this);
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
        <div>
          <SchedulingCalendar
            semester={this.props.semester}
            faculties={this.props.facultiesInSemester}
            availableSlots={this.state.availableSlots}
            presentations={this.state.presentations}
            loading={this.state.loading}
            presentationSlotPicked={this.presentationSlotPicked}
          />
          <SchedulingDate
            presentation={this.state.schedulingPresentation}
            clearPresentationSlot={this.clearPresentationSlot}
          />
        </div>
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

  presentationSlotPicked(presentationSlot: { start: Moment, end: Moment}) {
    // Check if given datetime overlaps with existing presentations
    
    this.setState((prevState: ScheduleState, props: ScheduleProps) => {
      // Use Map to get new object in the memory
      let newMap = Map(prevState.schedulingPresentation);
      newMap = newMap.set('start', presentationSlot.start.toISOString());
      newMap = newMap.set('end', presentationSlot.end.toISOString());

      const newState: any = {}
      newState.schedulingPresentation = newMap.toObject();

      return newState;
    })
  }

  clearPresentationSlot() {
    this.setState((prevState: ScheduleState, props: ScheduleProps) => {
      let newMap = Map(prevState.schedulingPresentation);
      newMap = newMap.set('start', '');
      newMap = newMap.set('end', '');

      const newState: any = {}
      newState.schedulingPresentation = newMap.toObject();

      return newState;
    })
  }

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
            justify-content: space-between;
          }
        `}</style>
      </AppLayout>
    )
  }
}