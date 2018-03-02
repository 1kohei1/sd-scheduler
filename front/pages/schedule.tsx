import * as React from 'react';
import { Row, Col, Steps, Button, Alert, message } from 'antd';
import { Map, List } from 'immutable';
import { Moment } from 'moment';
import * as io from 'socket.io-client';

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
import PresentationDate from '../models/PresentationDate';
import SelectAdmin from '../components/SelectAdmin';
import Group from '../models/Group';
import SelectGroup from '../components/SelectGroup';

interface ScheduleProps {
  facultiesInSemester: Faculty[];
  semester: Semester;
}

interface ScheduleState {
  schedulingPresentation: Presentation,
  availableSlots: AvailableSlot[],
  presentations: Presentation[],
  adminFaculty: Faculty | undefined;
  presentationDate: PresentationDate | undefined;
  selectedGroup: Group | undefined;
  verifyEmailAddresses: {
    email: string;
    sentiso: string;
  }[];
  email: string;
  groups: Group[];
  loading: boolean;
  current: number;
  errs: string[];
  identityVerified: boolean;
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
  static async getInitialProps(context: InitialProps) {
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
      adminFaculty: undefined,
      presentationDate: undefined,
      presentations: Array<Presentation>(),
      selectedGroup: undefined,
      verifyEmailAddresses: [],
      email: '',
      groups: Array<Group>(),
      current: 0,
      loading: false,
      errs: Array<string>(),
      identityVerified: false,
    };

    this.content = this.content.bind(this);
    this.changeCurrent = this.changeCurrent.bind(this);

    // Step 1
    this.onAdminSelected = this.onAdminSelected.bind(this);

    // Step 2
    this.presentationSlotPicked = this.presentationSlotPicked.bind(this);
    this.clearPresentationSlot = this.clearPresentationSlot.bind(this);

    // Step 3
    this.onGroupSelected = this.onGroupSelected.bind(this);
    this.onEmailChange = this.onEmailChange.bind(this);
    this.onSendIdentityVerification = this.onSendIdentityVerification.bind(this);
  }

  content() {
    if (this.state.loading) {
      return <Loading />
    }
    if (this.state.current === 0) {
      return (
        <SelectAdmin
          faculties={this.props.facultiesInSemester}
          adminFaculty={this.state.adminFaculty}
          onAdminSelected={this.onAdminSelected}
        />
      )
    } else if (this.state.current === 1) {
      let presentations: any = List(this.state.presentations);
      presentations = presentations.push(this.state.schedulingPresentation);

      return (
        <div>
          <SchedulingCalendar
            presentationDate={this.state.presentationDate as PresentationDate}
            faculties={this.props.facultiesInSemester}
            availableSlots={this.state.availableSlots}
            presentations={presentations.toArray()}
            presentationSlotPicked={this.presentationSlotPicked}
          />
          <SchedulingDate
            presentation={this.state.schedulingPresentation}
            faculties={this.props.facultiesInSemester}
            clearPresentationSlot={this.clearPresentationSlot}
          />
        </div>
      )
    } else if (this.state.current === 2) {
      return (
        <SelectGroup
          groups={this.state.groups}
          selectedGroup={this.state.selectedGroup}
          email={this.state.email}
          verifyEmailAddresses={this.state.verifyEmailAddresses}
          onGroupSelected={this.onGroupSelected}
          onEmailChange={this.onEmailChange}
          onSendIdentityVerification={this.onSendIdentityVerification}
        />
      )
    }
  }

  changeCurrent(diff: number) {
    if (diff > 0) {
      const msg = this.validateMessage();
      if (msg) {
        message.error(msg);
        return;
      }
    } else if (this.state.current + diff > 3 || this.state.current + diff < 0) {
      return;
    }

    this.setState((prevState: ScheduleState, props: ScheduleProps) => {
      const newCurrent = prevState.current + diff;

      const newState: any = {};
      newState.current = newCurrent;

      // Only entering step 2, fetch available slots and presentations
      if (diff > 0 && newCurrent === 1) {
        newState.loading = true;
        this.onScheduleTime();
      } else if (diff > 0 && newCurrent === 2) {
        newState.loading = true;
        this.onGroups();
      }

      return newState;
    });
  }

  validateMessage() {
    if (this.state.current === 0) {
      if (!this.state.adminFaculty) {
        return 'Pleas select the faculty of your senior design';
      }
    } else if (this.state.current === 1) {
      const numFaculties = this.state.schedulingPresentation.faculties.length;
      const isAdminSelected = this.state.schedulingPresentation.faculties.filter(fid => {
        const faculty = this.props.facultiesInSemester.find(faculty => faculty._id === fid);
        return faculty && faculty.isAdmin;
      })
        .length > 0;

      if (numFaculties < 4 || !isAdminSelected) {
        return 'Please select 4 faculties including your senior design 2 faculty';
      }
    } else if (this.state.current === 2) {
      if (!this.state.selectedGroup) {
        return 'Please select the group';
      }
      if (!this.state.identityVerified) {
        return 'Please verify you are one of the group member';
      }
    }
    return undefined;
  }

  onError(err: any) {
    this.setState((prevState: ScheduleState, props: ScheduleProps) => {
      let newErrs = List(prevState.errs);
      newErrs = newErrs.push(err.message);

      return {
        errs: newErrs.toArray(),
      }
    })
  }

  /**
   * Step 1
   */

  onAdminSelected(faculty: Faculty) {
    this.setState({
      adminFaculty: faculty,
    });
  }

  /**
   * Step 2
   */

  private async onScheduleTime() {
    await Promise.all([
      this.getPresentationDate(),
      this.getAvailableSlots(),
      this.getPresentations(),
    ]);
    this.setState({
      loading: false,
    })
  }

  private async getPresentationDate() {
    let query = `semester=${this.props.semester._id}`;
    if (this.state.adminFaculty) {
      query += `&admin=${this.state.adminFaculty._id}`;
    }

    try {
      const presentationDates = await Api.getPresentationDates(query);
      const presentationDate = presentationDates[0];

      this.setState({
        presentationDate,
      });
    } catch (err) {
      this.onError(err);
    }
  }

  private async getAvailableSlots() {
    const ids = this.props.facultiesInSemester.map(f => f._id);
    const facultyQuery = this.props.facultiesInSemester.map(f => `faculty[$in]=${f._id}`);
    const query = `semester=${this.props.semester._id}&${facultyQuery.join('&')}`;

    try {
      const availableSlots = await Api.getAvailableSlots(query);
      this.setState({
        availableSlots,
      });
    } catch (err) {
      this.onError(err);
    }
  }

  private async getPresentations() {
    // Get presentations
    const query = `semester=${this.props.semester._id}`;
  }

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

  /**
   * Step 3
   */

  async onGroups() {
    if (this.state.adminFaculty) {
      const query = `semester=${this.props.semester._id}&adminFaculty=${this.state.adminFaculty._id}`;

      try {
        const groups = await Api.getGroups(query);
        this.setState({
          groups,
          loading: false,
        });
      } catch (err) {
        this.onError(err);
      }
    }
  }

  onGroupSelected(groupId: string) {
    const group = this.state.groups.find(g => g._id === groupId);

    this.setState({
      email: '',
      selectedGroup: group,
    });
  }

  onEmailChange(email: string) {
    this.setState({
      email,
    })
  }

  async onSendIdentityVerification() {
    // Use email and group id to send verification email
    try {
      if (this.state.selectedGroup) {
        const verifyToken = await Api.verifyStudentIdentity(this.state.selectedGroup._id, {
          email: this.state.email,
        });

        this.setState((prevState: ScheduleState, props: ScheduleProps) => {
          let newVerifyEmailAddresses = List(prevState.verifyEmailAddresses);
          newVerifyEmailAddresses = newVerifyEmailAddresses.push({
            email: this.state.email,
            sentiso: new Date().toISOString(),
          });
          return {
            verifyEmailAddresses: newVerifyEmailAddresses.toArray(),
          }
        })

        // Open socket.io and listen on token change
        const socket = io();
        socket.on(verifyToken, (isVerified: boolean) => {
          if (isVerified) {
            this.setState({
              identityVerified: true,
            });
            this.changeCurrent(1);
            socket.off(verifyToken);
            socket.close();
          }
        })
      }
    } catch (err) {
      this.onError(err);
    }
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
                <Steps.Step title="Pick your SD 2 faculty" />
                <Steps.Step title="Pick time and faculties" />
                <Steps.Step title="Pick your group" />
                <Steps.Step title="Fill group info" />
              </Steps>
            </div>
            <div className="steps-content">
              {this.state.errs.map((err, index) => (
                <Alert type="error" message={err} key={index} />
              ))}
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
                  disabled={this.state.current === 3}
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
            margin-top: 16px;
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