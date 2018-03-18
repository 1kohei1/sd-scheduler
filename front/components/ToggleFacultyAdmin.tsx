import * as React from 'react';
import { Alert, Divider, Switch, Button, message } from 'antd';
import { List, Map } from 'immutable';

import Api from '../utils/Api';
import Faculty from '../models/Faculty';

export interface ToggleFacultyAdminProps {
}

interface ToggleFacultyAdminState {
  faculties: Faculty[];
  isAdmin: {
    [key: string]: boolean;
  };
  errs: string[];
  loading: boolean;
}

export default class ToggleFacultyAdmin extends React.Component<ToggleFacultyAdminProps, ToggleFacultyAdminState> {
  constructor(props: ToggleFacultyAdminProps) {
    super(props);

    this.state = {
      faculties: [],
      isAdmin: {},
      errs: [],
      loading: false,
    }

    this.onChange = this.onChange.bind(this);
    this.onSave = this.onSave.bind(this);
  }

  componentDidMount() {
    this.getFaculties();
  }

  private async getFaculties() {
    try {
      const faculties = await Api.getFaculties() as Faculty[];

      const isAdmin: {
        [key: string]: boolean;
      } = {};
      faculties.forEach((faculty: Faculty) => {
        isAdmin[faculty._id] = faculty.isAdmin;
      })

      this.setState({
        faculties,
        isAdmin,
      });
    } catch (err) {
      this.addErr(err);
    }
  }

  private addErr(err: any) {
    this.setState((prevState: ToggleFacultyAdminState, props: ToggleFacultyAdminProps) => {
      let newErrs = List(prevState.errs);
      newErrs = newErrs.push(err.message);
      return {
        errs: newErrs.toArray(),
      }
    })
  }

  onChange(fid: string) {
    this.setState((prevState: ToggleFacultyAdminState, props: ToggleFacultyAdminProps) => {
      let newIsAdmin = Map(prevState.isAdmin);
      newIsAdmin = newIsAdmin.set(fid, !newIsAdmin.get(fid));
      return {
        isAdmin: newIsAdmin.toObject(),
      }
    });
  }

  async onSave() {
    this.setState({
      loading: true,
    });

    for (const faculty of this.state.faculties) {
      if (faculty.isAdmin !== this.state.isAdmin[faculty._id]) {
        try {
          const updatedFaculty = await Api.updateFacultyAdminState(faculty._id, {
            isAdmin: this.state.isAdmin[faculty._id],
          })
          this.setState((prevState: ToggleFacultyAdminState, props: ToggleFacultyAdminProps) => {
            let newFaculties = List(prevState.faculties);
            const index = newFaculties.findIndex((f: Faculty) => f._id === faculty._id);

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

  render() {
    return (
      <div>
        <h3>Toggle faculty admin status</h3>
        <p>Making faculty to admin creates presentation date and location object for the most recent created semester.</p>
        {this.state.faculties.map(faculty => (
          <div
            key={faculty._id}
            style={{ marginBottom: '16px' }}
          >
            <Switch
              checked={this.state.isAdmin[faculty._id]}
              onChange={e => this.onChange(faculty._id)}
            />
            &nbsp; Dr. {faculty.firstName} {faculty.lastName}
          </div>
        ))}
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
