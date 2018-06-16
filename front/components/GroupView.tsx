import * as React from 'react';
import Link from 'next/link';
import { Upload, Icon, Button, Table, Alert, message } from 'antd';
import { UploadChangeParam } from 'antd/lib/upload/interface';
import { List } from 'immutable';

import { Semester } from '../models/Semester';
import Faculty from '../models/Faculty';
import Loading from '../components/Loading';
import Group from '../models/Group';
import Person from '../models/Person';
import Api from '../utils/Api';
import Presentation, { NewPresentation } from '../models/Presentation';
import DatetimeUtil from '../utils/DatetimeUtil';
import { DateConstants } from '../models/Constants';
import SchedulePresentationModal from './SchedulePresentationModal';

export interface GroupViewProps {
  user: Faculty;
  semester: Semester;
}

interface GroupViewState {
  errs: List<string>;
  loading: boolean;
  semester: Semester;
  groups: Group[];
  schedulingModal: boolean;
  schedulingPresentation: Presentation | undefined;
  presentations: Presentation[];
}

export default class GroupView extends React.Component<GroupViewProps, GroupViewState> {
  constructor(props: GroupViewProps) {
    super(props);

    this.state = {
      errs: List<string>(),
      loading: true,
      semester: props.semester,
      groups: Array<Group>(),
      schedulingModal: false,
      schedulingPresentation: undefined,
      presentations: Array<Presentation>(),
    };

    this.columns = this.columns.bind(this);
    this.onClose = this.onClose.bind(this);
    this.schedulingModal = this.schedulingModal.bind(this);
  }

  onErr(err: string) {
    this.setState({
      errs: this.state.errs.push(err),
    })
  }

  componentDidMount() {
    this.getData();
  }

  componentWillReceiveProps(nextProps: GroupViewProps) {
    if (this.state.semester !== nextProps.semester) {
      this.setState({
        semester: nextProps.semester,
        loading: true,
      }, () => {
        this.getData();
      })
    }
  }

  async getData() {
    try {
      let query = `semester=${this.state.semester._id}&adminFaculty=${this.props.user._id}`;
      const groups = await Api.getGroups(query) as Group[];

      const groupQuery = groups.map(group => `group[$in]=${group._id}`);
      query = `semester=${this.state.semester._id}&${groupQuery.join('&')}`;

      const presentations = await Api.getPresentations(query) as Presentation[];

      this.setState({
        groups,
        presentations,
        loading: false,
      })
    } catch (err) {
      this.onErr(err);
    }
  }

  columns() {
    return [{
      title: 'Group number',
      dataIndex: 'groupNumber',
    }, {
      title: 'Project name',
      dataIndex: 'projectName',
      render: (val: string, group: Group) => {
        const presentation = this.state.presentations.find(presentation => presentation.group._id === group._id);
        return presentation ? presentation.projectName : '';
      },
    }, {
      title: 'Sponsor',
      dataIndex: 'sponsorName',
      render: (val: string, group: Group) => {
        const presentation = this.state.presentations.find(presentation => presentation.group._id === group._id);
        return presentation ? presentation.sponsorName : '';
      }
    }, {
      title: 'Member',
      render: (text: any, record: Group, index: any) => {
        return (
          <div>
            {record.members.map((member: Person) => `${member.firstName} ${member.lastName}`).join(', ')}
          </div>
        )
      }
    }, {
      title: 'Scheduled',
      render: (text: any, group: Group) => {
        const presentation = this.state.presentations.find(presentation => presentation.group._id === group._id);

        if (presentation) {
          return (
            <a href="" onClick={e => this.schedulingModal(e, group)}>
              {DatetimeUtil.formatISOString(presentation.start, `${DateConstants.dateFormat} ${DateConstants.hourMinFormat}`)}
            </a>
          );
        } else {
          return <a href="" onClick={e => this.schedulingModal(e, group)}>Schedule presentation</a>;
        }
      }
    }]
  }

  onClose(shouldUpdate: boolean) {
    const newState: any = {
      schedulingModal: false,
    }

    if (shouldUpdate) {
      newState.loading = true;
      this.getData();
    }
    this.setState(newState);
  }

  schedulingModal(e: React.MouseEvent<any>, group: Group) {
    e.preventDefault();

    let schedulingPresentation = this.state.presentations
      .find(presentation => presentation.group._id === group._id);
    if (!schedulingPresentation) {
      schedulingPresentation = NewPresentation(this.state.semester._id, group);
      // Modal component determins updating existing presentation or creating new by looking at presentation._id
      // So set empty string to be evaluated false
      schedulingPresentation._id = '';
    }

    this.setState({
      schedulingModal: true,
      schedulingPresentation,
    })
  }

  draggerProps() {
    return {
      name: 'groups',
      action: '/api/groups',
      withCredentials: true,
      accept: '.xlsx',
      data: {
        semester: this.state.semester._id,
        adminFaculty: this.props.user._id,
      },
      onChange: (info: UploadChangeParam) => {
        const { status } = info.file;

        if (status === 'done') {
          this.setState({
            loading: true
          });
          this.getData();
        } else if (status === 'error') {
          this.onErr('Failed to import groups');
        }
      }
    }
  }

  render() {
    return (
      <div>
        <h1>Group</h1>
        <p>
          <Link href="/calendar">
            <a>Check semester availablity calendar</a>
          </Link>
        </p>
        {this.state.errs.map((err: string, index: number) => (
          <Alert
            type="error"
            showIcon
            style={{ marginBottom: '8px' }}
            message="Error"
            description={err}
          />
        ))}
        <SchedulePresentationModal
          visible={this.state.schedulingModal}
          user={this.props.user}
          semesterId={this.state.semester._id}
          schedulingPresentation={this.state.schedulingPresentation as Presentation}
          onClose={this.onClose}
        />
        {this.state.loading ? <Loading /> : (
          <div>
            {this.state.groups.length === 0 ? (
              <Upload.Dragger {...this.draggerProps()}>
                <p className="ant-upload-drag-icon">
                  <Icon type="inbox" />
                </p>
                <p className="ant-upload-text">Click or drag student roster group of your class to import groups</p>
                <p className="ant-upload-hint" style={{ fontSize: '16px' }}>
                  The order of the column must be first name, last name, email, and group number.
                </p>
              </Upload.Dragger>
            ) : (
                <Table
                  dataSource={this.state.groups}
                  columns={this.columns()}
                  loading={this.state.loading}
                  pagination={false}
                  rowKey="_id"
                />
              )}
          </div>
        )}
      </div>
    );
  }
}
