import * as React from 'react';
import { List } from 'immutable';
import Link from 'next/link';
import { Form, Select, Button, Alert } from 'antd';

import InitialProps from '../../models/InitialProps';
import { Semester } from '../../models/Semester';
import Faculty from '../../models/Faculty';
import Group from '../../models/Group';
import Api from '../../utils/Api';
import AppLayout from '../../components/AppLayout';
import ScheduleLayout from '../../components/ScheduleLayout';
import CardInfo from '../../components/CardInfo';
import Loading from '../../components/Loading';
import { ScheduleFormLayoutConstants } from '../../models/Constants';
import UserVerificationModal from '../../components/UserVerificationModal';

export interface ScheduleProps {
  semester: Semester;
  _id: string;
  err: string;
}

interface ScheduleState {
  loading: boolean;
  errs: List<string>;
  verifyModal: boolean;

  allFaculties: Faculty[];
  allGroups: Group[];

  selectedAdminId: string;
  selectedGroupId: string;
}

export default class Schedule extends React.Component<ScheduleProps, ScheduleState> {
  static async getInitialProps(context: InitialProps) {
    const semesters: Semester[] = await Api.getSemesters();
    const semester = semesters[0];

    return {
      semester,
      _id: context.query._id,
      err: context.query.err,
    };
  }

  constructor(props: ScheduleProps) {
    super(props);

    this.state = {
      loading: true,
      errs: List<string>(),
      verifyModal: false,

      allFaculties: [],
      allGroups: [],

      selectedAdminId: '',
      selectedGroupId: '',
    }

    this.onChange = this.onChange.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onVerified = this.onVerified.bind(this);
    this.onClose = this.onClose.bind(this);
  }

  onErr(err: string) {
    this.setState({
      errs: this.state.errs.push(err),
      loading: false,
    })
  }

  componentDidMount() {
    Promise.all([
      this.getFaculties(),
      this.getGroups(),
    ])
      .then(() => {
        this.setState({
          loading: false,
        })
      })
      .catch(err => {
        this.onErr(err.message);
      })
  }

  private async getFaculties() {
    try {
      const faculties = await Api.getFaculties(`isActive=true`) as Faculty[];
      this.setState({
        allFaculties: faculties,
      });
    } catch (err) {
      this.onErr(err.message);
    }
  }

  private async getGroups() {
    try {
      const groups = await Api.getGroups(`semester=${this.props.semester._id}`) as Group[];
      const newState: any = {
        allGroups: groups,
      };

      if (this.props._id) {
        const group = groups.find((group: Group) => group._id === this.props._id);
        if (group) {
          newState.selectedAdminId = group.adminFaculty;
          newState.selectedGroupId = this.props._id;
        }
      }

      this.setState(newState);
    } catch (err) {
      this.onErr(err.message);
    }
  }

  onChange(prop: 'selectedAdminId' | 'selectedGroupId', val: string) {
    const newState: any = {};
    newState[prop] = val;
    if (prop === 'selectedAdminId') {
      newState.selectedGroupId = '';
    }
    this.setState(newState);
  }

  onVerified() {
    Api.redirect(
      undefined,
      '/schedule/fillpresentation',
      {
        _id: this.state.selectedGroupId,
      },
      `/schedule/${this.state.selectedGroupId}`
    )
  }

  onClick() {
    this.setState({
      verifyModal: true,
    })
  }

  onClose() {
    this.setState({
      verifyModal: false,
    })
  }

  render() {
    const group: Group | undefined = this.state.allGroups.find((group: Group) => group._id === this.state.selectedGroupId);

    return (
      <AppLayout>
        <ScheduleLayout
          current={0}
          groupNumber={0}
          description={(
            <div>
              Please select your group. <Link href="/calendar">
                <a>Check committee's availablity</a>
              </Link>
            </div>
          )}
        >
          {group && (
            <UserVerificationModal
              visible={this.state.verifyModal}
              group={(group as Group)}
              onVerified={this.onVerified}
              onClose={this.onClose}
            />
          )}
          {this.state.loading ? <Loading /> : (
            <Form>
              {this.props.err && (
                <Alert
                  type="error"
                  style={{ marginBottom: '8px' }}
                  message={this.props.err}
                />
              )}
              {this.state.errs.map((err: string, index: number) => (
                <Alert
                  type="error"
                  key={index}
                  style={{ marginBottom: '8px' }}
                  message={err}
                />
              ))}
              <Form.Item
                {...ScheduleFormLayoutConstants.layoutWithColumn}
                label="Your senior design faculty"
              >
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  {
                    this.state.allFaculties
                      .filter((faculty: Faculty) => faculty.isAdmin)
                      .map((faculty: Faculty) => (
                        <CardInfo
                          key={faculty._id}
                          title={`Dr. ${faculty.firstName} ${faculty.lastName}`}
                          isSelected={this.state.selectedAdminId === faculty._id}
                          onClick={() => this.onChange('selectedAdminId', faculty._id)}
                        />
                      ))
                  }
                </div>
              </Form.Item>
              <Form.Item
                {...ScheduleFormLayoutConstants.layoutWithColumn}
                label="Your group"
              >
                <Select
                  value={this.state.selectedGroupId}
                  onChange={(groupId: string) => this.onChange('selectedGroupId', groupId)}
                  disabled={!this.state.selectedAdminId}
                >
                  {
                    this.state.allGroups
                      .filter((group: Group) => group.adminFaculty === this.state.selectedAdminId)
                      .map((group: Group) => (
                        <Select.Option
                          key={group._id}
                          value={group._id}
                        >
                          Group {group.groupNumber}
                        </Select.Option>
                      ))
                  }
                </Select>
              </Form.Item>
              <Form.Item
                {...ScheduleFormLayoutConstants.layoutWithoutColumn}
              >
                <Button
                  type="primary"
                  disabled={!this.state.selectedGroupId}
                  onClick={this.onClick}
                >
                  Verify user &amp; group membership
                </Button>
              </Form.Item>
            </Form>
          )}
        </ScheduleLayout>
      </AppLayout>
    );
  }
}