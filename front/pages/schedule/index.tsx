import * as React from 'react';
import { List } from 'immutable';
import { Form, Select, Button, Alert, Input } from 'antd';

import InitialProps from '../../models/InitialProps';
import { Semester } from '../../models/Semester';
import Faculty from '../../models/Faculty';
import Group from '../../models/Group';
import Person from '../../models/Person';
import Api from '../../utils/Api';
import CookieUtil from '../../utils/CookieUtil';
import AppLayout from '../../components/AppLayout';
import ScheduleLayout from '../../components/ScheduleLayout';
import CardInfo from '../../components/CardInfo';
import Loading from '../../components/Loading';
import { ScheduleFormLayoutConstants } from '../../models/Constants';

export interface ScheduleProps {
  semester: Semester;
  err: string;
}

interface ScheduleState {
  loading: boolean;
  errs: List<string>;
  waitingResponse: boolean;

  allFaculties: Faculty[];
  allGroups: Group[];

  selectedAdminId: string;
  selectedGroupId: string;
  selectedMemberId: string;
  verificationCode: string;
  verificationCodeSent: boolean;
}

export default class Schedule extends React.Component<ScheduleProps, ScheduleState> {
  static async getInitialProps(context: InitialProps) {
    const semesters: Semester[] = await Api.getSemesters();
    const semester = semesters[0];

    return {
      semester,
      err: context.query.err,
    };
  }

  constructor(props: ScheduleProps) {
    super(props);

    this.state = {
      loading: true,
      errs: List<string>(),
      waitingResponse: false,

      allFaculties: [],
      allGroups: [],

      selectedAdminId: '',
      selectedGroupId: '',
      selectedMemberId: '',
      verificationCode: '',
      verificationCodeSent: false,
    }

    this.onChange = this.onChange.bind(this);
    this.sendVerificationCode = this.sendVerificationCode.bind(this);
    this.verifyCode = this.verifyCode.bind(this);
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
      this.setState({
        allGroups: groups,
      });
    } catch (err) {
      this.onErr(err.message);
    }
  }

  async sendVerificationCode() {
    try {
      this.setState({
        waitingResponse: true,
      })
      await Api.sendCode(this.state.selectedGroupId, {
        verificationCodeReceiverId: this.state.selectedMemberId,
      });
      this.setState({
        verificationCodeSent: true,
        waitingResponse: false,
      })
    } catch (err) {
      this.onErr(err.message);
    }
  }

  async verifyCode() {
    try {
      this.setState({
        waitingResponse: true,
      })
      const token = await Api.verifyCode(this.state.selectedGroupId, {
        code: this.state.verificationCode,
      });
      CookieUtil.setToken(token);
      Api.redirect(
        undefined,
        '/schedule/fillpresentation',
        {
          groupId: this.state.selectedGroupId,
        },
        `/schedule/${this.state.selectedGroupId}`
      );
    } catch (err) {
      this.onErr(err.message)
    }
  }

  onChange(prop: 'selectedAdminId' | 'selectedGroupId' | 'selectedMemberId' | 'verificationCode', val: string) {
    const newState: any = {};
    newState[prop] = val;
    if (prop === 'selectedAdminId') {
      newState.selectedGroupId = '';
      newState.selectedMemberId = '';
      newState.verificationCode = '';
      newState.verificationCodeSent = false;
    } else if (prop === 'selectedGroupId') {
      newState.selectedMemberId = '';
      newState.verificationCode = '';
      newState.verificationCodeSent = false;
    } else if (prop === 'selectedMemberId') {
      newState.verificationCode = '';
      newState.verificationCodeSent = false;
    }
    this.setState(newState);
  }

  render() {
    const group: Group | undefined = this.state.allGroups.find((group: Group) => group._id === this.state.selectedGroupId);

    return (
      <AppLayout>
        <ScheduleLayout
          current={0}
          groupNumber={0}
          description="Please select your group and verify your belonging to the group."
        >
          {this.state.loading ? <Loading /> : (
            <Form>
              {this.state.verificationCodeSent && (
                <Alert
                  type="success"
                  style={{ marginBottom: '8px' }}
                  message="Successfully sent verification code"
                />
              )}
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
                {...ScheduleFormLayoutConstants.layoutWithColumn}
                label="Verification code receiver"
              >
                <Select
                  value={this.state.selectedMemberId}
                  onChange={(val: string) => this.onChange('selectedMemberId', val)}
                  disabled={!this.state.selectedGroupId}
                >
                  {group && group.members.map((member: Person) => (
                    <Select.Option
                      key={member._id}
                      value={member._id}
                    >
                      {member.firstName} {member.lastName} &lt;{member.email}&gt;
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                {...ScheduleFormLayoutConstants.layoutWithoutColumn}
              >
                <Button
                  type={this.state.verificationCodeSent ? undefined : 'primary'}
                  onClick={this.sendVerificationCode}
                  loading={this.state.waitingResponse}
                  disabled={!this.state.selectedMemberId}
                >
                  Send verification code
                </Button>
              </Form.Item>
              <Form.Item
                label="Verification code"
                {...ScheduleFormLayoutConstants.layoutWithColumn}
              >
                <Input
                  value={this.state.verificationCode}
                  onChange={e => this.onChange('verificationCode', e.target.value)}
                  disabled={!this.state.verificationCodeSent}
                />
              </Form.Item>
              <Form.Item
                {...ScheduleFormLayoutConstants.layoutWithoutColumn}
              >
                <Button
                  type="primary"
                  loading={this.state.waitingResponse}
                  onClick={this.verifyCode}
                  disabled={!this.state.verificationCodeSent}
                >
                  Verify &amp; schedule presentation
                </Button>
              </Form.Item>
            </Form>
          )}
        </ScheduleLayout>
      </AppLayout>
    );
  }
}