import * as React from 'react';
import { Form, Select, Alert, Upload, Icon, Button, Table, Divider, message } from 'antd';
import { List } from 'immutable';

import Api from '../utils/Api';
import { Semester } from '../models/Semester';
import Faculty from '../models/Faculty';

export interface ImportGroupsProps {
}

interface ImportGroupsState {
  semesters: Semester[];
  selectedSemesterId: string;
  selectedFacultyId: string;
  semesterAdminFaculties: Faculty[];
  errs: string[];
}

export default class ImportGroups extends React.Component<ImportGroupsProps, ImportGroupsState> {
  constructor(props: ImportGroupsProps) {
    super(props);

    this.state = {
      semesters: [],
      selectedSemesterId: '',
      selectedFacultyId: '',
      semesterAdminFaculties: Array<Faculty>(),
      errs: Array<string>(),
    }

    this.onSemesterChange = this.onSemesterChange.bind(this);
    this.onFacultyChange = this.onFacultyChange.bind(this);
    this.draggerProps = this.draggerProps.bind(this);
  }

  componentDidMount() {
    this.getSemesters();
  }

  private async getSemesters() {
    try {
      const semesters = await Api.getSemesters() as Semester[];
      this.setState({
        semesters,
      });
    } catch (err) {
      this.addErr(err);
    }
  }

  private addErr(err: any) {
    this.setState((prevState: ImportGroupsState, props: ImportGroupsProps) => {
      let newErrs = List(prevState.errs);
      newErrs = newErrs.push(err.message);
      return {
        errs: newErrs.toArray(),
      }
    })
  }

  async onSemesterChange(sid: string) {
    this.setState({
      selectedSemesterId: sid,
    });
    const semester = this.state.semesters.find(semester => semester._id === sid);
    // if (semester) {
    //   let facultyQuery = semester.faculties.map(fid => `_id[$in]=${fid}`).join('&');
    //   facultyQuery += '&isAdmin=true';

    //   try {
    //     const faculties = await Api.getFaculties(facultyQuery);
    //     this.setState({
    //       semesterAdminFaculties: faculties,
    //     });
    //   } catch (err) {
    //     this.addErr(err);
    //   }
    // }
  }

  onFacultyChange(fid: string) {
    this.setState({
      selectedFacultyId: fid,
    })
  }

  draggerProps() {
    return {
      name: 'groups',
      action: '/api/groups',
      withCredentials: true,
      disabled: !this.state.selectedSemesterId || !this.state.selectedFacultyId,
      data: {
        semester: this.state.selectedSemesterId,
        adminFaculty: this.state.selectedFacultyId,
      },
    }
  }

  render() {
    return (
      <div>
        <h3>Import groups</h3>
        {this.state.errs.map(err => (
          <Alert
            type="error"
            message={err}
          />
        ))}
        <Select
          onChange={this.onSemesterChange}
          placeholder="Please select the semester"
          style={{ width: '100%', marginBottom: '16px' }}
        >
          {this.state.semesters.map(semester => (
            <Select.Option
              key={semester._id}
              value={semester._id}
            >
              {semester.displayName}
            </Select.Option>
          ))}
        </Select>
        <Select
          onChange={this.onFacultyChange}
          placeholder="Please select the faculty"
          style={{ width: '100%', marginBottom: '16px' }}
        >
          {this.state.semesterAdminFaculties.map(faculty => (
            <Select.Option
              key={faculty._id}
              value={faculty._id}
            >
              Dr. {faculty.firstName} {faculty.lastName}
            </Select.Option>
          ))}
        </Select>
        <Upload.Dragger {...this.draggerProps()}>
          <p className="ant-upload-drag-icon">
            <Icon type="inbox" />
          </p>
          <p className="ant-upload-text">Click or drag file to this area to import groups</p>
          <p className="ant-upload-hint" style={{ fontSize: '16px' }}>
            The first column heading must be "Group number". <br />The second column heading must be "Emails" containing comma separated student emails.
            </p>
        </Upload.Dragger>
        <Divider />
      </div>
    );
  }
}
