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
import SelectDatetime from '../components/SelectDatetime'

interface ScheduleProps {
  facultiesInSemester: Faculty[];
  allGroups: Group[];
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
  groups: Group[];

  // state.current = 1
  selectedGroup: Group | undefined;
  verifyEmailAddresses: {
    email: string;
    sentiso: string;
  }[];
  email: string;
  identityVerified: boolean;

  // state.current = 2
  availableSlots: AvailableSlot[],
  presentations: Presentation[],
  presentationDate: PresentationDate | undefined;
  presentationDatestr: string;

  // state.current = 3
}

export default class Schedule extends React.Component<ScheduleProps, ScheduleState> {
  fillGroupInfoRef: any = undefined;

  static async getInitialProps(context: InitialProps) {
    const semesters: Semester[] = await Api.getSemesters();
    const semester = semesters[0];

    const facultiesInSemester: Faculty[] = await Api.getFaculties(`isActive=true`);

    const allGroups = await Api.getGroups(`semester=${semester._id}`);

    return {
      facultiesInSemester,
      allGroups,
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
      groups: Array<Group>(),

      // state.current = 1
      selectedGroup: undefined,
      email: '',
      verifyEmailAddresses: [],
      identityVerified: false,

      // state.current = 2
      availableSlots: [],
      presentations: Array<Presentation>(),
      presentationDate: undefined,
      presentationDatestr: '',

      // state.current = 3
    };

    this.content = this.content.bind(this);
    this.changeCurrent = this.changeCurrent.bind(this);

    // state.current = 0
    this.onAdminSelected = this.onAdminSelected.bind(this);

    // state.current = 1
    this.onGroupSelected = this.onGroupSelected.bind(this);
    this.onEmailChange = this.onEmailChange.bind(this);
    this.onSendIdentityVerification = this.onSendIdentityVerification.bind(this);

    // state.current = 2
    this.presentationDatestrPicked = this.presentationDatestrPicked.bind(this);
    this.presentationDatetimePicked = this.presentationDatetimePicked.bind(this);
    this.presentationFacultyPicked = this.presentationFacultyPicked.bind(this);
    this.addExternalFaculty = this.addExternalFaculty.bind(this);
    this.deleteExternalFaculty = this.deleteExternalFaculty.bind(this);

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
    } else if (this.state.current === 2) {
      const { schedulingPresentation } = this.state;

      return (
        <div>
          {this.alert()}
          <SelectDatetime
            presentationDate={this.state.presentationDate as PresentationDate}
            faculties={this.props.facultiesInSemester}
            availableSlots={this.state.availableSlots}
            presentations={this.state.presentations}
            adminFaculty={this.state.adminFaculty as Faculty}
            schedulingPresentation={this.state.schedulingPresentation}
            presentationDatestr={this.state.presentationDatestr}
            presentationDatestrPicked={this.presentationDatestrPicked}
            presentationDatetimePicked={this.presentationDatetimePicked}
            presentationFacultyPicked={this.presentationFacultyPicked}
            addExternalFaculty={this.addExternalFaculty}
            deleteExternalFaculty={this.deleteExternalFaculty}
          />
        </div>
      )
    } else if (this.state.current === 3) {
      return (
        <div>
          {this.alert()}
          <SchedulingDate
            presentation={this.state.schedulingPresentation}
            faculties={this.props.facultiesInSemester}
          />
          <FillGroupInfo
            group={this.state.selectedGroup as Group}
            addSponsor={this.addSponsor}
            onFillGroupInfoRef={this.onFillGroupInfoRef}
            deleteSponsor={this.deleteSponsor}
            schedulePresentation={this.schedulePresentation}
          />
        </div>
      )
    }
  }

  alert() {
    const dbPresentation = this.state.presentations
      .find(presentation => presentation._id === this.state.schedulingPresentation._id);

    if (dbPresentation) {
      const date = DatetimeUtil.formatISOString(dbPresentation.start, DateConstants.dateFormat);
      const time = DatetimeUtil.formatISOString(dbPresentation.start, DateConstants.hourMinFormat);

      return (
        <Alert
          showIcon
          style={{ marginBottom: '16px' }}
          type="warning"
          message="You are updating existing presentation"
          description={`Your group already scheduled the presentation at ${time} on ${date}. This action will reschedule your presentation. `}
        />
      )
    } else {
      return null;
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
      if (diff > 0 && newCurrent === 2) {
        newState.loading = true;
        this.onScheduleTime();
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
      if (!this.state.selectedGroup) {
        return 'Please select the group';
      }
      if (!this.state.identityVerified) {
        return 'Please verify you are one of the group member';
      }
    } else if (this.state.current === 2) {
      if (!this.state.presentationDatestr) {
        return 'Please select your presentation date';
      }
      if (!this.state.schedulingPresentation.start) {
        return 'Please select youur presentation time';
      }
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
    let groups = this.props.allGroups.filter(group => group.adminFaculty === faculty._id);
    this.setState({
      adminFaculty: faculty,
      groups,
    });
  }

  /**
   * state.current = 1
   */

  onGroupSelected(groupId: string) {
    const group = this.state.groups.find(g => g._id === groupId);

    this.setState({
      email: '',
      identityVerified: false,
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
   * state.current = 2
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
    const groupIds = this.state.groups.map(group => group._id);
    const groupQuery = groupIds
      .map(gid => `group[$in]=${gid}`)
      .join('&');

    const query = `semester=${this.props.semester._id}&${groupQuery}`;

    try {
      const presentations = await Api.getPresentations(query);
      const presentation = presentations
        .find((presentation: Presentation) => presentation.group._id === (this.state.selectedGroup as Group)._id);
      
      const newState: any = {
        presentations,
      }
      if (presentation) {
        newState.schedulingPresentation = presentation;
        newState.presentationDatestr = DatetimeUtil.formatISOString(presentation.start, DateConstants.dateFormat);
      }

      this.setState(newState);
    } catch (err) {
      this.onError(err);
    }
  }

  presentationDatestrPicked(dateStr: string) {
    this.setState((prevState: ScheduleState, props: ScheduleProps) => {
      const { schedulingPresentation } = prevState;

      // Reset other presentation stuff
      schedulingPresentation.start = '';
      schedulingPresentation.end = '';
      schedulingPresentation.faculties = [];

      const newMap = Map(schedulingPresentation);
      const newState: any = {}
      newState.schedulingPresentation = newMap.toObject();
      newState.presentationDatestr = dateStr;

      return newState;
    });
  }

  presentationDatetimePicked(start: string, end: string) {
    this.setState((prevState: ScheduleState, props: ScheduleProps) => {
      const { schedulingPresentation } = prevState;
      schedulingPresentation.start = start;
      schedulingPresentation.end = end;

      const newMap = Map(schedulingPresentation);
      const newState: any = {}
      newState.schedulingPresentation = newMap.toObject();

      return newState;
    })
  }

  presentationFacultyPicked(checked: boolean, fid: string) {
    this.setState((prevState: ScheduleState, props: ScheduleProps) => {
      const { schedulingPresentation } = prevState;

      if (checked) {
        schedulingPresentation.faculties.push(fid);
      } else {
        const index = schedulingPresentation.faculties.indexOf(fid);
        if (index >= 0) {
          schedulingPresentation.faculties.splice(index, 1);
        }
      }

      const newMap = Map(schedulingPresentation);
      const newState: any = {}
      newState.schedulingPresentation = newMap.toObject();

      return newState;
    })
  }

  addExternalFaculty() {
    this.setState((prevState: ScheduleState, props: ScheduleProps) => {
      const { schedulingPresentation } = prevState;
      schedulingPresentation.externalFaculties.push({
        _id: ObjectID.generate(),
        firstName: '',
        lastName: '',
        email: '',
      });
      const newSchedulingPresentation = Map(schedulingPresentation);

      const newState: any = {};
      newState.schedulingPresentation = newSchedulingPresentation.toObject();
      return newState;
    });
  }

  deleteExternalFaculty(_id: string) {
    this.setState((prevState: ScheduleState, props: ScheduleProps) => {
      const { schedulingPresentation } = prevState;
      
      const index = schedulingPresentation.externalFaculties
        .findIndex(faculty => faculty._id === _id);
      schedulingPresentation.externalFaculties.splice(index, 1);
      const newSchedulingPresentation = Map(schedulingPresentation);

      const newState: any = {};
      newState.schedulingPresentation = newSchedulingPresentation.toObject();
      return newState;
    });
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
      const isUpdatingPresentation = this.state.presentations
        .findIndex(presentation => presentation._id === this.state.schedulingPresentation._id) >= 0;

      let body: { [key: string]: any };

      // If presentation is already scheduled for the selectedGroup, update partially
      if (isUpdatingPresentation) {
        const { start, end, faculties, midPresentationLink } = this.state.schedulingPresentation;
        body = {
          start,
          end,
          faculties,
          midPresentationLink,
        }
      } else {
        // state.schedulingPresentation.group is a placeholder. Replace it with actual user selected group _id
        body = this.state.schedulingPresentation as { [key: string]: any };
        body.group = (this.state.selectedGroup as Group)._id;
      }

      if (isUpdatingPresentation) {
        await Api.updatePresentation(this.state.schedulingPresentation._id, body);
      } else {
        await Api.createPresentation(body);
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
                <Steps.Step title="Pick your group" />
                <Steps.Step title="Pick time and faculties" />
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