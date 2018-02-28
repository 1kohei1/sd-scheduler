import * as React from 'react';
import { Upload, Icon, Button, Table, message } from 'antd';

import { Semester } from '../models/Semester';
import Faculty from '../models/Faculty';
import Loading from '../components/Loading';
import Group from '../models/Group';
import Api from '../utils/Api';

export interface GroupViewProps {
  user: Faculty;
  semester: Semester;
}

interface GroupViewState {
  loading: boolean;
  groups: Group[];
}

export default class GroupView extends React.Component<GroupViewProps, GroupViewState> {
  constructor(props: GroupViewProps) {
    super(props);

    this.state = {
      loading: true,
      groups: Array<Group>(),
    };

    this.draggerProps = this.draggerProps.bind(this);
    this.content = this.content.bind(this);
  }

  componentDidMount() {
    this.getGroups();
    this.getPresentations();
  }

  private async getGroups() {
    const query = `semester=${this.props.semester._id}&admin=${this.props.user._id}`;
    const groups = await Api.getGroups(query) as Group[];

    this.setState({
      groups,
      loading: false,
    })
  }

  private async getPresentations() {
    // Check if there is already groups which schedules presentation
  }

  draggerProps() {
    return {
      name: 'group_data',
      action: '/api/groups',
      withCredentials: true,
    }
  }

  content() {
    const control = this.state.groups.length === 0 ? (
      <Upload.Dragger {...this.draggerProps()}>
        <p className="ant-upload-drag-icon">
          <Icon type="inbox" />
        </p>
        <p className="ant-upload-text">Click or drag file to this area to import groups</p>
        <p className="ant-upload-hint" style={{ fontSize: '16px' }}>
          <Icon type="info-circle" /> If the same group number already exists in the DB, the system overrides existing data with uploaded data.
        </p>
      </Upload.Dragger>
    ) : (
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          type="primary"
        >
          Add group
        </Button>
        <Button>
          Delete all groups
        </Button>
      </div>
    )

    return (
      <div>
        {control}

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
