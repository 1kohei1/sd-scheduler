import * as React from 'react';
import { Row, Col, Steps, Button, message } from 'antd';
import { Map, List } from 'immutable';
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
import DatetimeUtil from '../utils/DatetimeUtil';
import TimeSlot from '../models/TimeSlot';

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
    if (this.state.current === 1) {
      let presentations: any = List(this.state.presentations);
      presentations = presentations.push(this.state.schedulingPresentation);

      return (
        <div>
          <SchedulingCalendar
            semester={this.props.semester}
            faculties={this.props.facultiesInSemester}
            availableSlots={this.state.availableSlots}
            presentations={presentations.toArray()}
            loading={this.state.loading}
            presentationSlotPicked={this.presentationSlotPicked}
          />
          <SchedulingDate
            presentation={this.state.schedulingPresentation}
            faculties={this.props.facultiesInSemester}
            clearPresentationSlot={this.clearPresentationSlot}
          />
        </div>
      )
    }
  }

  changeCurrent(diff: number) {
    const msg = this.validateMessage();
    if (msg) {
      message.error(msg);
    } else {
      this.setState((prevState: ScheduleState, props: ScheduleProps) => {
        return {
          current: prevState.current + diff,
        }
      });
    }
  }

  validateMessage() {
    if (this.state.current === 0) {
      const numFaculties = this.state.schedulingPresentation.faculties.length;
      const isAdminSelected = this.state.schedulingPresentation.faculties.filter(fid => {
        const faculty = this.props.facultiesInSemester.find(faculty => faculty._id === fid);
        return faculty && faculty.isAdmin;
      })
        .length > 0;

      if (numFaculties < 4 || !isAdminSelected) {
        return 'Please select 4 faculties including your senior design 2 faculty';
      }
    }
    return undefined;
  }

  /**
   * Step 1
   */

  presentationSlotPicked(presentationSlot: TimeSlot, faculty: Faculty) {
    const { _id } = faculty;

    // Check if specified faculty has availableSlot instance
    const availableSlot = this.state.availableSlots.find(slot => slot.faculty === _id);
    if (!availableSlot) {
      message.error(`Dr. ${faculty.firstName} ${faculty.lastName} is not available at specified time`);
      return;
    }

    // Check if specified faculty is available on specified time
    const facultyAvailableSlot = availableSlot.availableSlots;
    const isFacultyAvailable = facultyAvailableSlot.map(DatetimeUtil.convertToTimeSlot)
      .filter(slot => DatetimeUtil.doesCover(slot, presentationSlot))
      .length > 0;

    if (!isFacultyAvailable) {
      message.error(`Dr. ${faculty.firstName} ${faculty.lastName} is not available at specified time`);
      return;
    }

    // Check if there is other presentations that overlaps with requested time range
    const isOtherGroupRequesting = this.state.presentations.map(DatetimeUtil.convertToTimeSlot)
      .filter(slot => DatetimeUtil.doesOverlap(slot, presentationSlot))
      .length > 0;
    if (isOtherGroupRequesting) {
      message.error(`Other group is requesting the similar time slot`);
      return;
    }

    // All validation passed. Update schedulingPresentation
    this.setState((prevState: ScheduleState, props: ScheduleProps) => {
      const { schedulingPresentation } = prevState;

      const startM = DatetimeUtil.getMomentFromISOString(schedulingPresentation.start);
      // If presentation slot has changed, clear the faculties
      if (startM.valueOf() !== presentationSlot.start.valueOf()) {
        schedulingPresentation.faculties = [];
      }

      if (schedulingPresentation.faculties.indexOf(_id) === -1) {
        schedulingPresentation.faculties.push(_id);
      }

      schedulingPresentation.start = presentationSlot.start.toISOString();
      schedulingPresentation.end = presentationSlot.end.toISOString();

      // Use Map to get new object in the memory
      const newMap = Map(schedulingPresentation);
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
      newMap = newMap.set('faculties', []);

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
                <Steps.Step title="Pick your SD 2 faculty" description="" />
                <Steps.Step title="Pick time and faculties" description="from the calendar below" />
                <Steps.Step title="Pick your group" description="from the list" />
                <Steps.Step title="Confirm" description="your presentation" />
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
              <div style={{ display: 'flex' }}>
                <Button
                  type="primary"
                  onClick={e => this.changeCurrent(1)}
                >
                  Next
                </Button>
              </div>
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