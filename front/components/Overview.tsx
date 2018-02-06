import * as React from 'react';
import { Map } from 'immutable';
import { message } from 'antd';

import Date from './Date';
import Location from './Location';
import Faculties from './Faculties';
import { Semester } from '../models/Semester';
import Api from '../utils/Api';

export interface OverviewProps {
  semester: Semester;
}

interface OverviewState {
  [index: string]: {
    semester: Semester;
    presentationDatesEditing: boolean;
    presentationDatesUpdating: boolean;
    locationEditing: boolean;
    locationLoading: boolean;
    facultiesEditing: boolean;
    facultiesLoading: boolean;
    isPresentationDatesEditing: boolean;
    isLocationEditing: boolean;
    isFacultiesEditing: boolean;
  }
}

const faculties = [{
  email: 'aaa@aaa.com',
  name: 'AAA AAA'
}, {
  email: 'bbb@bbb.com',
  name: 'BBB BBB'
}, {
  email: 'ccc@ccc.com',
  name: 'CCC CCC'
}];

export default class Overview extends React.Component<OverviewProps, any> {
  constructor(props: OverviewProps) {
    super(props);

    this.state = {
      semester: props.semester,
      presentationDatesEditing: false,
      presentationDatesUpdating: false,
      locationEditing: false,
      locationUpdating: false,
      facultiesEditing: false,
      facultiesUpdating: false,

      isPresentationDatesEditing: false,
      isLocationEditing: false,
      isFacultiesEditing: false,
    };

    this.updateSemester = this.updateSemester.bind(this);
    this.toggleForm = this.toggleForm.bind(this);
  }

  toggleForm(prop: 'presentationDates' | 'location' | 'faculties') {
    this.setState((prevState: OverviewState, props: OverviewProps) => {
      const key = `${prop}Editing`;
      return {
        [key]: !prevState[key]
      };
    })
  }

  async updateSemester(updateObj: any, prop: 'presentationDates' | 'location' | 'faculties') {
    const editingKey = `${prop}Editing`;
    const updatingKey = `${prop}Updating`;

    const newState: any = {};
    newState[updatingKey] = true;
    this.setState(newState);

    try {
      await Api.updateSemester(this.state.semester._id, updateObj);
      let semester = Map(this.state.semester);
      semester = semester.set(prop, updateObj[prop]);

      newState[editingKey] = false;
      newState[updatingKey] = false;
      newState.semester = semester.toObject();
      this.setState(newState);

      message.success('Successfully updated the semester');
    } catch (err) {
      newState[updatingKey] = false;
      this.setState(newState);
      console.log(err);
    }
  }

  componentWillReceiveProps(nextProps: OverviewProps) {
    if (nextProps.semester !== this.state.semester) {
      this.setState({
        isPresentationDatesEditing: false,
        isLocationEditing: false,
        isFacultiesEditing: false
      });
    }
  }

  render() {
    return (
      <div>
        <h1>Overview</h1>
        <Date
          prop="presentationDates"
          semester={this.state.semester}
          editing={this.state.presentationDatesEditing}
          updating={this.state.presentationDatesUpdating}
          toggleForm={this.toggleForm}
          updateSemester={this.updateSemester}
        />
        <Location
          prop="location"
          semester={this.state.semester}
          editing={this.state.locationEditing}
          updating={this.state.locationUpdating}
          toggleForm={this.toggleForm}
          updateSemester={this.updateSemester}
        />
        <Faculties
          prop="faculties"
          semester={this.state.semester}
          editing={this.state.facultiesEditing}
          updating={this.state.facultiesUpdating}
          toggleForm={this.toggleForm}
          updateSemester={this.updateSemester}
        />
      </div>
    )
  }
}
