import * as React from 'react';
import OverviewContent from './OverviewContent';
import { Semester } from '../models/Semester';

export interface OverviewProps {
  semester: Semester;
}

interface OverviewState {
  semester: Semester;
  isDateEditing: boolean;
  isLocationEditing: boolean;
  isFacultiesEditing: boolean;
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
      isDateEditing: false,
      isLocationEditing: false,
      isFacultiesEditing: false,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }
  
  handleSubmit(updateObj: any, menu: string) {
    // Check validation and if everything is fine, call updateSemester
    // await this.updateSemester()
    // Depending on menu, change state isDateEditing, isLocationEditing, isFacultiesEditing
  }

  private async updateSemester(updateObj: any) {
    // Update DB Semester
  }

  render() {
    return (
      <OverviewContent
        semester={this.state.semester}
        isDateEditing={this.state.isDateEditing}
        isLocationEditing={this.state.isLocationEditing}
        isFacultiesEditing={this.state.isFacultiesEditing}
        handleSubmit={this.handleSubmit}
      />
    )
  }
}
