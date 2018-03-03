import * as React from 'react';
import { Row, Col, Steps, Button, Alert, message } from 'antd';
import { Map, List } from 'immutable';
import { Moment } from 'moment';
import * as io from 'socket.io-client';
import ObjectID from 'bson-objectid';

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
import { DateConstants } from '../models/Constants';
import FillGroupInfo from '../components/FillGroupInfo';

interface ScheduleProps {
  facultiesInSemester: Faculty[];
  semester: Semester;
}

interface ScheduleState {
  schedulingPresentation: Presentation,
  loading: boolean;
  updating: boolean;
  current: number;
  errs: string[];

  // state.current = 0
  adminFaculty: Faculty | undefined;

  // state.current = 1
  availableSlots: AvailableSlot[],
  presentations: Presentation[],
  presentationDate: PresentationDate | undefined;

  // state.current = 2
  groups: Group[];
  selectedGroup: Group | undefined;
  verifyEmailAddresses: {
    email: string;
    sentiso: string;
  }[];
  email: string;
  identityVerified: boolean;

  // state.current = 3
}

export default class Schedule extends React.Component<ScheduleProps, ScheduleState> {
  fillGroupInfoRef: any = undefined;

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
      loading: false,
      updating: false,
      current: 0,
      errs: Array<string>(),

      // state.current = 0
      adminFaculty: undefined,

      // state.current = 1
      availableSlots: [],
      presentations: Array<Presentation>(),
      presentationDate: undefined,

      // state.current = 2
      groups: Array<Group>(),
      selectedGroup: undefined,
      email: '',
      verifyEmailAddresses: [],
      identityVerified: true,

      // state.current = 3
    };

    this.content = this.content.bind(this);
    this.changeCurrent = this.changeCurrent.bind(this);

    // state.current = 0
    this.onAdminSelected = this.onAdminSelected.bind(this);

    // state.current = 1
    this.presentationSlotPicked = this.presentationSlotPicked.bind(this);
    this.clearPresentationSlot = this.clearPresentationSlot.bind(this);

    // state.current = 2
    this.onGroupSelected = this.onGroupSelected.bind(this);
    this.onEmailChange = this.onEmailChange.bind(this);
    this.onSendIdentityVerification = this.onSendIdentityVerification.bind(this);

    // state.current = 3
    this.onFillGroupInfoRef = this.onFillGroupInfoRef.bind(this);
    this.addSponsor = this.addSponsor.bind(this);
    this.deleteSponsor = this.deleteSponsor.bind(this);
    this.schedulePresentation = this.schedulePresentation.bind(this);
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
            displayClear={true}
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
    } else if (this.state.current === 3) {
      let index = -1;
      let date = '';
      let time = '';
      const { selectedGroup, presentations } = this.state;

      if (selectedGroup) {
        index = this.state.presentations
          .findIndex(presentation => presentation.group._id === selectedGroup._id);
      }
      if (index >= 0) {
        date = DatetimeUtil.formatISOString(presentations[index].start, DateConstants.dateFormat);
        time = DatetimeUtil.formatISOString(presentations[index].start, DateConstants.hourMinFormat);
      }

      return (
        <div>
          {index >= 0 && (
            <Alert
              showIcon
              style={{ marginBottom: '16px' }}
              type="warning"
              message="You are updating existing presentation"
              description={`Your group already scheduled the presentation at ${time} on ${date}. This action will reschedule your presentation. `}
            />
          )}
          <SchedulingDate
            presentation={this.state.schedulingPresentation}
            faculties={this.props.facultiesInSemester}
            displayClear={false}
            clearPresentationSlot={this.clearPresentationSlot}
          />
          {/* This if is redundant, but TS complains selectedGroup could be undefined */}
          {selectedGroup && (
            <FillGroupInfo
              group={selectedGroup}
              addSponsor={this.addSponsor}
              onFillGroupInfoRef={this.onFillGroupInfoRef}
              deleteSponsor={this.deleteSponsor}
              schedulePresentation={this.schedulePresentation}
            />
          )}
        </div>
      )
    }
  }

  changeCurrent(diff: number) {
    // Handle scheduling the presentation
    if (this.state.current === 3 && diff > 0) {
      if (this.fillGroupInfoRef) {
        this.fillGroupInfoRef.handleSubmit();
      }
      return;
    } else if (this.state.current + diff > 3 || this.state.current + diff < 0) {
      return;
    } else if (diff > 0) {
      const msg = this.validateMessage();
      if (msg) {
        message.error(msg);
        return;
      }
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

  columnLayout() {
    return {
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
  }

  /**
   * state.current = 0
   */

  onAdminSelected(faculty: Faculty) {
    this.setState({
      adminFaculty: faculty,
    });
  }

  /**
   * state.current = 1
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
   * state.current = 2
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

  /**
   * state.current = 3
   */

  onFillGroupInfoRef(fillGroupInfoRef: any) {
    this.fillGroupInfoRef = fillGroupInfoRef;
  }

  addSponsor() {
    this.setState((prevState: ScheduleState, props: ScheduleProps) => {
      if (prevState.selectedGroup) {
        let newSponsors = List(prevState.selectedGroup.sponsors);
        newSponsors = newSponsors.push({
          _id: ObjectID.generate(),
          firstName: '',
          lastName: '',
          email: '',
        });

        let newSelectedGroup = Map(prevState.selectedGroup);
        newSelectedGroup = newSelectedGroup.set('sponsors', newSponsors.toArray());

        const newState: any = {};
        newState.selectedGroup = newSelectedGroup.toObject();

        return newState;
      } else {
        return prevState;
      }
    })
  }

  deleteSponsor(_id: string) {
    this.setState((prevState: ScheduleState, props: ScheduleProps) => {
      if (prevState.selectedGroup) {
        const index = prevState.selectedGroup.sponsors.findIndex(sponsor => sponsor._id === _id);

        if (index >= 0) {
          let newSponsors = List(prevState.selectedGroup.sponsors);
          newSponsors = newSponsors.delete(index);

          let newSelectedGroup = Map(prevState.selectedGroup);
          newSelectedGroup = newSelectedGroup.set('sponsors', newSponsors.toArray());

          const newState: any = {};
          newState.selectedGroup = newSelectedGroup.toObject();

          return newState;
        } else {
          return prevState;
        }
      } else {
        return prevState;
      }
    })
  }

  schedulePresentation(groupInfo: object) {
    this.setState({
      updating: true,
    });
    Promise.all([
      this.updateGroup(groupInfo),
      this.schedulePresentationAPI(),
    ])
      .then(() => {
        this.setState({
          updating: false,
        })
      })
  }

  private async updateGroup(groupInfo: object) {
    try {
      if (this.state.selectedGroup) {
        await Api.updateGroup(this.state.selectedGroup._id, groupInfo)
      }
    } catch (err) {
      this.onError(err);
    }
  }

  private async schedulePresentationAPI() {
    try {
      if (this.state.selectedGroup) {
        const groupId = this.state.selectedGroup._id;

        const index = this.state.presentations
          .findIndex(presentation => presentation.group._id === groupId);

        let isNew = true;
        let body = this.state.schedulingPresentation as { [key: string]: any };

        // If presentation is already scheduled for the selectedGroup, update partially
        if (index >= 0) {
          isNew = false;
          const { start, end, faculties, midPresentationLink } = this.state.schedulingPresentation;
          body = {
            start,
            end,
            faculties,
            midPresentationLink,
          }
        } else {
          // state.schedulingPresentation.group is a placeholder. Replace it with actual user selected group _id
          body.group = this.state.selectedGroup._id;
        }

        console.log('isNew', isNew);
        console.log('body', body);

        if (isNew) {
          await Api.createPresentation(body);
        } else {
          await Api.updatePresentation(this.state.presentations[index]._id, body);
        }
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
            {...this.columnLayout()}
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
                <Alert
                  key={index}
                  type="error"
                  message={err}
                  style={{ marginBottom: '16px' }}
                />
              ))}
              {this.content()}
            </div>
            <div className="steps-action">
              <Button
                disabled={this.state.current === 0}
                loading={this.state.updating}
                onClick={e => this.changeCurrent(-1)}
              >
                Previous
              </Button>
              <Button
                type="primary"
                loading={this.state.updating}
                onClick={e => this.changeCurrent(1)}
              >
                {this.state.current === 3 ? 'Schedule presentation' : 'Next'}
              </Button>
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