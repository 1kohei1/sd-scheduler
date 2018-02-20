import * as React from 'react';
import { Row, Col, Button, Tabs } from 'antd';
import ObjectID from 'bson-objectid';
import * as moment from 'moment-timezone';
import Link from 'next/link'

import AppLayout from '../components/AppLayout';
import InitialProps from '../models/InitialProps';
import { Semester } from '../models/Semester';
import Faculty from '../models/Faculty';
import AvailableSlot from '../models/AvailableSlot';
import SchedulingCalendar from '../components/SchedulingCalendar/SchedulingCalendar';
import { DateConstants } from '../models/Constants';
import Api from '../utils/Api';
import Presentation from '../models/Presentation';
import Loading from '../components/Loading';
import DatetimeUtil from '../utils/DatetimeUtil';
import SchedulingFilter from '../components/SchedulingCalendar/SchedulingFilter';
import CookieUtil from '../utils/CookieUtil';

interface Props {
  facultiesInSemester: Faculty[];
  checkedFaculties: string[];
  semester: Semester;
}

interface IndexState {
  availableSlots: AvailableSlot[],
  presentations: Presentation[],
  checkedFaculties: string[];
  loading: boolean;
  err: string;
}

const columnLayout = {
  md: {
    span: 24,
  },
  lg: {
    span: 22,
    offset: 1
  },
  xl: {
    span: 20,
    offset: 2,
  }
};

class Index extends React.Component<Props, IndexState> {
  static async getInitialProps(props: InitialProps) {
    const semesters: Semester[] = await Api.getSemesters();
    const semester = semesters[0];

    const ids = semester.faculties.map(fid => `_id[$in]=${fid}`);
    const facultiesInSemester: Faculty[] = await Api.getFaculties(`${ids.join('&')}`);

    const checkedFaculties = CookieUtil.getFaculties(
      props,
      semester.faculties.map(f => f._id),
    );

    return {
      facultiesInSemester,
      checkedFaculties,
      semester,
    };
  }

  constructor(props: Props) {
    super(props);

    this.state = {
      checkedFaculties: this.props.checkedFaculties,
      availableSlots: [],
      presentations: [],
      loading: true,
      err: '',
    };

    this.getAvailableSlots();
    this.getPresentations();

    this.onUpdateFilter = this.onUpdateFilter.bind(this);
  }

  private async getAvailableSlots() {
    const ids = this.props.facultiesInSemester.map(f => f._id);
    const facultyQuery = this.props.facultiesInSemester.map(f => `faculty[$in]=${f._id}`);
    const query = `semester=${this.props.semester._id}&${facultyQuery.join('&')}`;

    try {
      const availableSlots = await Api.getAvailableSlots(query);
      this.setState({
        loading: false,
        availableSlots,
      });
    } catch (err) {
      this.setState({
        err: err.message,
        loading: false,
      })
    }
  }

  private async getPresentations() {
    // Get presentations
    const query = `semester=${this.props.semester._id}`;
  }

  onUpdateFilter(ids: string[]) {
    CookieUtil.setFaculties(ids);
    this.setState({
      checkedFaculties: ids,
    });
  }

  render() {
    return (
      <AppLayout>
        <Row>
          <Col
            {...columnLayout}
          >
            <Tabs>
              {this.props.semester.presentationDates.map(date => {
                const presentationDate = DatetimeUtil.convertToTimeSlot(date);
                const facultiesToDisplay = this.props.facultiesInSemester.filter(f => this.state.checkedFaculties.indexOf(f._id) >= 0);

                return (
                  <Tabs.TabPane
                    key={date._id}
                    tab={DatetimeUtil.formatDate(presentationDate.start, DateConstants.dateFormat)}
                  >
                    {this.state.loading ? (
                      <Loading />
                    ) : (
                      <SchedulingCalendar
                        presentationDate={presentationDate}
                        faculties={facultiesToDisplay}
                        availableSlots={this.state.availableSlots}
                        presentations={this.state.presentations}
                      />
                    )}
                  </Tabs.TabPane>
                )
              })}
            </Tabs>
            <SchedulingFilter
              checkedFaculties={this.state.checkedFaculties}
              faculties={this.props.facultiesInSemester}
              onUpdateFilter={this.onUpdateFilter}
            />
          </Col>
        </Row>
      </AppLayout>
    )
  }
}
export default Index
