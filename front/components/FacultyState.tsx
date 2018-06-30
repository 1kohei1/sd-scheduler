import * as React from 'react';
import { Divider, Switch, Button, Table, message } from 'antd';
import { List, Map } from 'immutable';

import Api from '../utils/Api';
import Faculty from '../models/Faculty';

export interface FacultyStateProps {
}

interface State {
  [key: string]: {
    isAdmin: boolean;
    isTestUser: boolean;
    isSystemAdmin: boolean;
  }
}

interface FacultyStateState {
  faculties: Faculty[];
  state: State;
  errs: string[];
  loading: boolean;
}

export default class FacultyState extends React.Component<FacultyStateProps, FacultyStateState> {
  constructor(props: FacultyStateProps) {
    super(props);

    this.state = {
      faculties: [],
      state: {},
      errs: [],
      loading: false,
    }

    this.onChange = this.onChange.bind(this);
    this.onSave = this.onSave.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    this.getFaculties();
  }

  private async getFaculties() {
    try {
      const faculties = await Api.getAllFaculties() as Faculty[];

      const state: State = {};
      faculties.forEach((faculty: Faculty) => {
        state[faculty._id] = {
          isAdmin: faculty.isAdmin,
          isTestUser: faculty.isTestUser,
          isSystemAdmin: faculty.isSystemAdmin,
        };
      })

      this.setState({
        faculties,
        state,
      });
    } catch (err) {
      this.addErr(err);
    }
  }

  private addErr(err: any) {
    this.setState((prevState: FacultyStateState, props: FacultyStateProps) => {
      let newErrs = List(prevState.errs);
      newErrs = newErrs.push(err.message);
      return {
        errs: newErrs.toArray(),
      }
    })
  }

  onChange(fid: string, prop: 'isAdmin' | 'isSystemAdmin' | 'isTestUser') {
    this.setState((prevState: FacultyStateState, props: FacultyStateProps) => {
      prevState.state[fid][prop] = !prevState.state[fid][prop];
      let newState = Map(prevState.state);
      return {
        state: newState.toObject(),
      }
    });
  }

  async onSave() {
    this.setState({
      loading: true,
    });

    for (const faculty of this.state.faculties) {
      const update: any = {};
      const fid = faculty._id;
      const fstate = this.state.state;

      if (faculty.isAdmin !== fstate[fid].isAdmin) {
        update.isAdmin = fstate[fid].isAdmin;
      }
      if (faculty.isSystemAdmin !== fstate[fid].isSystemAdmin) {
        update.isSystemAdmin = fstate[fid].isSystemAdmin;
      }
      if (faculty.isTestUser !== fstate[fid].isTestUser) {
        update.isTestUser = fstate[fid].isTestUser;
      }

      if (Object.keys(update).length > 0) {
        try {
          const updatedFaculty = await Api.systemadminFacultyUpdate(faculty._id, update);
          this.setState((prevState: FacultyStateState, props: FacultyStateProps) => {
            let newFaculties = List(prevState.faculties);
            const index = newFaculties.findIndex((f: Faculty) => f._id === fid);

            if (index >= 0) {
              newFaculties = newFaculties.set(index, updatedFaculty);
              return {
                faculties: newFaculties.toArray(),
              }
            } else {
              return prevState;
            }
          })
        } catch (err) {
          this.addErr(err);
        }
      }
    }

    message.success('Successfully updated faculties');
    this.setState({
      loading: false,
    })
  }

  columns() {
    return [{
      title: 'Name',
      key: 'name',
      render: (faculty: Faculty) => (
        <span>Dr. {faculty.firstName} {faculty.lastName}</span>
      )
    }, {
      title: 'isAdmin',
      key: 'isAdmin',
      render: (faculty: Faculty) => (
        <Switch
          checked={this.state.state[faculty._id].isAdmin}
          onChange={e => this.onChange(faculty._id, 'isAdmin')}
        />
      )
    }, {
      title: 'isSystemAdmin',
      key: 'isSystemAdmin',
      render: (faculty: Faculty) => (
        <Switch
          checked={this.state.state[faculty._id].isSystemAdmin}
          onChange={e => this.onChange(faculty._id, 'isSystemAdmin')}
        />
      )
    }, {
      title: 'isTestUser',
      key: 'isTestUser',
      render: (faculty: Faculty) => (
        <Switch
          checked={this.state.state[faculty._id].isTestUser}
          onChange={e => this.onChange(faculty._id, 'isTestUser')}
        />
      )
    }];
  }

  render() {
    return (
      <div>
        <h3>Toggle faculty state</h3>
        <p>Making faculty to admin creates presentation date and location object for the most recent created semester.</p>
        <Table
          rowKey="_id"
          dataSource={this.state.faculties}
          pagination={false}
          columns={this.columns()}
        />
        <Button
          type="primary"
          loading={this.state.loading}
          onClick={this.onSave}
        >
          Save
        </Button>
        <Divider />
      </div>
    );
  }
}
