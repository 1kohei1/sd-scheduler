import * as React from 'react';
import { Upload, Icon, Button, Table, message } from 'antd';

import { Semester } from '../models/Semester';
import Faculty from '../models/Faculty';
import Loading from '../components/Loading';
import Group, { Person } from '../models/Group';
import Api from '../utils/Api';
import Presentation from '../models/Presentation';
import DatetimeUtil from '../utils/DatetimeUtil';
import { DateConstants } from '../models/Constants';

export interface GroupViewProps {
  user: Faculty;
  semester: Semester;
}

interface GroupViewState {
  loading: boolean;
  groups: Group[];
  presentations: Presentation[];
}

export default class GroupView extends React.Component<GroupViewProps, GroupViewState> {
  constructor(props: GroupViewProps) {
    super(props);

    this.state = {
      loading: true,
      groups: Array<Group>(),
      presentations: Array<Presentation>(),
    };

    this.content = this.content.bind(this);
    this.columns = this.columns.bind(this);
  }

  componentDidMount() {
    this.getGroups();
    this.getPresentations();
  }

  private async getGroups() {
    const query = `semester=${this.props.semester._id}&adminFaculty=${this.props.user._id}`;
    const groups = await Api.getGroups(query) as Group[];

    this.setState({
      groups,
      loading: false,
    })
  }

  private async getPresentations() {

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
            {record.members.map((member: Person) => (
              <span key={member._id}>
                {member.firstName && member.lastName ? (
                  <span>{member.firstName} {member.lastName} |&nbsp;</span>
                ) : (
                  <span>{member.email},&nbsp;</span>
                )}
                
              </span>
            ))}
          </div>
        )
      }
    }, {
      title: 'Scheduled',
      render: (text: any, record: Group) => {
        const presentation = this.state.presentations.find(presentation => presentation.group._id === record._id);

        if (presentation) {
          <div>
            <Icon type="check" /> {DatetimeUtil.formatISOString(presentation.start, `${DateConstants.dateFormat} ${DateConstants.hourMinFormat}`)}
          </div>
        } else {
          return '';
        }
      }
    }]
  }

  content() {
    return (
      <div>
        {this.state.groups.length === 0 ? (
          <div>No groups are found in your class. Please send your group spreadsheet to tobecomebig@gmail.com</div>
        ) : (
          <div>Form to request changes</div>
        )}
        <Table
          dataSource={this.state.groups}
          columns={this.columns()}
          rowKey="_id"
        />
      </div>
    )
  }

  render() {
    return (
      <div>
        <h1>Group</h1>
        {this.state.loading ? (
          <Loading />
        ) : this.content()}
      </div>
    );
  }
}
