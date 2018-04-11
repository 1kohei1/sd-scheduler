import * as React from 'react';
import { Upload, Icon, Button, Table, message } from 'antd';
import { List } from 'immutable';

import { Semester } from '../models/Semester';
import Faculty from '../models/Faculty';
import Loading from '../components/Loading';
import Group from '../models/Group';
import Person from '../models/Person';
import Api from '../utils/Api';
import Presentation, { newPresentation } from '../models/Presentation';
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

  async getData() {
    try {
      let query = `semester=${this.props.semester._id}&adminFaculty=${this.props.user._id}`;
      const groups = await Api.getGroups(query) as Group[];

      const groupQuery = groups.map(group => `group[$in]=${group._id}`);
      query = `semester=${this.props.semester._id}&${groupQuery.join('&')}`;

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
      dataIndex: 'projectName'
    }, {
      title: 'Sponsor',
      dataIndex: 'sponsorName',
    }, {
      title: 'Member',
      render: (text: any, record: Group, index: any) => {
        return (
          <div>
            {record.members.map((member: Person) => `${member.firstName} ${member.firstName}`).join(', ')}
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
      schedulingPresentation = newPresentation(this.props.semester._id);
      // Modal component determins updating existing presentation or creating new by looking at presentation._id
      // So set empty string to be evaluated false
      schedulingPresentation._id = '';
      // Set default value 
      schedulingPresentation.semester = this.props.semester._id;
      schedulingPresentation.group = group;
    }

    this.setState({
      schedulingModal: true,
      schedulingPresentation,
    })
  }

  render() {
    return (
      <div>
        <h1>Group</h1>
        <SchedulePresentationModal
          visible={this.state.schedulingModal}
          user={this.props.user}
          semesterId={this.props.semester._id}
          schedulingPresentation={this.state.schedulingPresentation as Presentation}
          onClose={this.onClose}
        />
        {this.state.groups.length === 0 ? (
          <div>
            Drag and drop form to import groups
            </div>
        ) : (
            <Table
              dataSource={this.state.groups}
              columns={this.columns()}
              loading={this.state.loading}
              rowKey="_id"
            />
          )}
      </div>
    );
  }
}
