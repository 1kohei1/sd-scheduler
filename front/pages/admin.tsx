import * as React from 'react';
import { Form, Select, Alert, Upload, Icon, Button, Table, Divider, message } from 'antd';
import { List } from 'immutable';

import InitialProps from '../models/InitialProps';
import AppLayout from '../components/AppLayout';
import FormLayout from '../components/FormLayout';
import UserUtil from '../utils/UserUtil';
import Api from '../utils/Api';
import { Semester } from '../models/Semester';
import Faculty from '../models/Faculty';

export interface AdminProps {
}

interface AdminState {
  semesters: Semester[];
  selectedSemesterId: string;
  selectedFacultyId: string;
  semesterAdminFaculties: Faculty[];
  errs: string[];
}

export default class Admin extends React.Component<AdminProps, AdminState> {
  static async getInitialProps(context: InitialProps) {
    const user = await UserUtil.checkAuthentication(context);
    if (!user || !user.isSystemAdmin) {
      Api.redirect(context, '/dashboard');
    }

    return {};
  }

  constructor(props: AdminProps) {
    super(props);

    this.state = {
      semesters: Array<Semester>(),
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

  private addErr(err: any) {
    this.setState((prevState: AdminState, props: AdminProps) => {
      let newErrs = List(prevState.errs);
      newErrs = newErrs.push(err.message);
      return {
        errs: newErrs.toArray(),
      }
    })
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

  async onSemesterChange(sid: string) {
    this.setState({
      selectedSemesterId: sid,
    });
    const semester = this.state.semesters.find(semester => semester._id === sid);
    if (semester) {
      let facultyQuery = semester.faculties.map(fid => `_id[$in]=${fid}`).join('&');
      facultyQuery += '&isAdmin=true';

      try {
        const faculties = await Api.getFaculties(facultyQuery);
        this.setState({
          semesterAdminFaculties: faculties,
        });
      } catch (err) {
        this.addErr(err);
      }
    }
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
      <AppLayout>
        <FormLayout>
          <h1>System administrator menu</h1>
          {/* If I have to add multiple things, separate this into components */}
          <h3>Import groups</h3>
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
        </FormLayout>
      </AppLayout>
    );
  }
}
