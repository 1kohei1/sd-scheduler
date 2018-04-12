import * as React from 'react';
import { List } from 'immutable';
import Link from 'next/link'
import { Form, Select, Button } from 'antd';

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

export interface ScheduleProps {
  semester: Semester;
}

interface ScheduleState {
  loading: boolean;
  errs: List<string>;
  moving: boolean;

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
    };
  }

  constructor(props: ScheduleProps) {
    super(props);

    this.state = {
      loading: true,
      errs: List<string>(),
      moving: false,

      allFaculties: [],
      allGroups: [],

      selectedAdminId: '',
      selectedGroupId: '',
    }

    this.onChange = this.onChange.bind(this);
    this.onMove = this.onMove.bind(this);
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

  onChange(prop: 'selectedAdminId' | 'selectedGroupId', val: string) {
    const newState: any = {};
    newState[prop] = val;
    this.setState(newState);
  }

  onMove() {
    this.setState({
      moving: true,
    })
  }

  render() {
    return (
      <AppLayout>
        <ScheduleLayout
          current={0}
          groupNumber={0}
          description="Please select your senior design faculty and group."
        >
          {this.state.loading ? <Loading /> : (
            <Form>
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
                <Link
                  href={`/schedule/fillpresentation?groupId=${this.state.selectedGroupId}`}
                  as={`/schedule/${this.state.selectedGroupId}`}
                >
                  <a>
                    <Button
                      type="primary"
                      disabled={!this.state.selectedGroupId}
                      onClick={this.onMove}
                      loading={this.state.moving}
                    >
                      Schedule presentation for group {
                        this.state.selectedGroupId &&
                        (this.state.allGroups.find((group: Group) => group._id === this.state.selectedGroupId) as Group)
                          .groupNumber
                      }
                    </Button>
                  </a>
                </Link>
              </Form.Item>
            </Form>
          )}
        </ScheduleLayout>
      </AppLayout>
    );
  }
}