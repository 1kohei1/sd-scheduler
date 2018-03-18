import * as React from 'react';
import { Map } from 'immutable';
import { message } from 'antd';

import PresentationDateView from './PresentationDateView';
import LocationView from './LocationView';
import Faculties from './Faculties';
import { Semester } from '../models/Semester';
import Api from '../utils/Api';
import Faculty from '../models/Faculty';
import InviteFaculty from './InviteFaculty';

export interface OverviewProps {
  user: Faculty;
  semester: Semester;
}

interface OverviewState {
  semester: Semester;
  presentationDatesEditing: boolean;
  presentationDatesUpdating: boolean;
  presentationDatesError: string;
  locationEditing: boolean;
  locationUpdating: boolean;
  locationError: string;
  facultiesEditing: boolean;
  facultiesUpdating: boolean;
  facultiesError: string;
  [key: string]: Semester | boolean | string | Faculty | undefined;
}

export default class Overview extends React.Component<OverviewProps, OverviewState> {
  constructor(props: OverviewProps) {
    super(props);

    this.state = {
      semester: props.semester,
      presentationDatesEditing: false,
      presentationDatesUpdating: false,
      presentationDatesError: '',
      locationEditing: false,
      locationUpdating: false,
      locationError: '',
      facultiesEditing: false,
      facultiesUpdating: false,
      facultiesError: '',
    };

    this.updateSemester = this.updateSemester.bind(this);
    this.toggleForm = this.toggleForm.bind(this);
  }

  toggleForm(prop: 'presentationDates' | 'location' | 'faculties') {
    this.setState((prevState: OverviewState, props: OverviewProps) => {
      const key = `${prop}Editing`;
      return {
        [key]: !prevState[key],
      }
    })
  }

  async updateSemester(updateObj: any, prop: 'presentationDates' | 'location' | 'faculties') {
    const editingKey = `${prop}Editing`;
    const updatingKey = `${prop}Updating`;
    const errorKey = `${prop}Error`;

    const newState: any = {};
    newState[updatingKey] = true;
    this.setState(newState);

    try {
      const newData = await Api.updateSemester(this.state.semester._id as string, updateObj);
      let semester = Map(this.state.semester);
      semester = semester.set(prop, newData[prop]);

      newState[editingKey] = false;
      newState[updatingKey] = false;
      newState.semester = semester.toObject();
      newState[errorKey] = '';
      this.setState(newState);

      message.success('Successfully updated the semester');
    } catch (err) {
      newState[updatingKey] = false;
      if (err.message) {
        newState[errorKey] = err.message;
      } else {
        newState[err] = err;
      }
      this.setState(newState);
    }
  }

  componentWillReceiveProps(nextProps: OverviewProps) {
    if (nextProps.semester !== this.state.semester) {
      this.setState({
        presentationDatesEditing: false,
        locationEditing: false,
        facultiesEditing: false
      });
    }
  }

  render() {
    const isAdmin = this.props.user && this.props.user.isAdmin ? true : false;
    let facultyId = '';
    if (this.props.user) {
      facultyId = this.props.user._id;
    }

    return (
      <div>
        <h1>Overview</h1>
        <PresentationDateView
          isAdmin={isAdmin}
          semester={this.state.semester}
          facultyId={facultyId}
        />
        <LocationView
          isAdmin={isAdmin}
          semester={this.state.semester}
          facultyId={facultyId}
        />
        {/* <Faculties
          prop="faculties"
          isAdmin={isAdmin}
          semester={this.state.semester}
          editing={this.state.facultiesEditing}
          updating={this.state.facultiesUpdating}
          error={this.state.facultiesError}
          toggleForm={this.toggleForm}
          updateSemester={this.updateSemester}
        /> */}
        <InviteFaculty />
      </div>
    )
  }
}
