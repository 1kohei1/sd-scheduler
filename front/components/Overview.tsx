import * as React from 'react';

import Date from './Date';
import Location from './Location';
import Faculties from './Faculties';
import { Semester } from '../models/Semester';

export interface OverviewProps {
  semester: Semester;
}

interface OverviewState {
  [index: string]: {
    semester: Semester;
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
      isPresentationDatesEditing: false,
      isLocationEditing: false,
      isFacultiesEditing: false,
    };

    this.updateSemester = this.updateSemester.bind(this);
    this.toggleForm = this.toggleForm.bind(this);
  }

  toggleForm(menu: string) {
    this.setState((prevState: OverviewState, props: OverviewProps) => {
      const key = this.getPropName(menu);
      return {
        [key]: !prevState[key]
      };
    })
  }

  async updateSemester(updateObj: any, menu: string) {
    // Update DB Semester
    console.log(`Update ${menu}`);
    // Update state semester and is???Editing
  }

  private getPropName(menu: string) {
    if (menu === 'presentationDates') {
      return 'isPresentationDatesEditing';
    } else if (menu === 'location') {
      return 'isLocationEditing';
    } else {
      return 'isFacultiesEditing';
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
          semester={this.state.semester}
          editing={this.state.isPresentationDatesEditing}
          toggleForm={this.toggleForm}
          updateSemester={this.updateSemester}
        />
        <Location
          semester={this.state.semester}
          editing={this.state.isLocationEditing}
          toggleForm={this.toggleForm}
          updateSemester={this.updateSemester}
        />
        <Faculties
          semester={this.state.semester}
          editing={this.state.isFacultiesEditing}
          toggleForm={this.toggleForm}
          updateSemester={this.updateSemester}
        />
      </div>
    )
  }
}
