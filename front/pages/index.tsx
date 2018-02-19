import * as React from 'react';
import { Row, Col, Button } from 'antd';
import ObjectID from 'bson-objectid';
import * as moment from 'moment-timezone';
import Link from 'next/link'
import * as Cookie from 'js-cookie';
import * as CookieParser from 'cookie';

import AppLayout from '../components/AppLayout';
import InitialProps from '../models/InitialProps';
import { Semester } from '../models/Semester';
import Faculty from '../models/Faculty';
import AvailableSlot from '../models/AvailableSlot';
import SchedulingFilter from '../components/SchedulingCalendar/SchedulingFilter';
import SchedulingCalendar from '../components/SchedulingCalendar/SchedulingCalendar';
import { DateConstants } from '../models/Constants';
import Api from '../utils/Api';
import Presentation from '../models/Presentation';
import Loading from '../components/Loading';

interface Props {
  facultiesInSemester: Faculty[];
  checkedFaculties: string[];
  semester: Semester;
}

interface IndexState {
  checkedFaculties: string[];
  availableSlots: AvailableSlot[],
  presentations: Presentation[],
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

const COOKIE_KEY = 'faculties';

class Index extends React.Component<Props, IndexState> {
  static async getInitialProps(props: InitialProps) {
    const semesters: Semester[] = await Api.getSemesters();
    const faculties: Faculty[] = await Api.getFaculties();

    const semester = semesters[0];
    const facultiesInSemester = faculties.filter((f) => {
      return semester.faculties.indexOf(f._id) >= 0;
    });

    let checkedFaculties = facultiesInSemester.map(f => f._id);
    const ids = Cookie.get(COOKIE_KEY);
    if (props.req) {
      const parsedCookie = CookieParser.parse(props.req.headers.cookie as string);
      if (parsedCookie.faculty) {
        checkedFaculties = parsedCookie.faculties.split(',');
      }
    } else if (ids) {
      checkedFaculties = ids.split(',');
    }

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
    this.setState({
      checkedFaculties: ids,
    });
    Cookie.set(COOKIE_KEY, ids.join(','));
  }

  render() {
    const facultiesToDisplay = this.props.facultiesInSemester.filter(f => {
      return this.state.checkedFaculties.indexOf(f._id) >= 0;
    });

    return (
      <AppLayout>
        <Row>
          <Col
            {...columnLayout}
          >
            <div className="section">
              {this.state.loading ? (
                <Loading />
              ) : (
                  <SchedulingCalendar
                    semester={this.props.semester}
                    faculties={this.props.facultiesInSemester}
                    availableSlots={this.state.availableSlots}
                    presentations={this.state.presentations}
                  />
                )}
            </div>
            <div className="section">
              <SchedulingFilter
                checkedFaculties={this.state.checkedFaculties}
                faculties={this.props.facultiesInSemester}
                onUpdateFilter={this.onUpdateFilter}
              />
            </div>
          </Col>
        </Row>
        <style jsx>{`
          .section {
            margin: 16px 0;
          }
        `}</style>
      </AppLayout>
    )
  }
}
export default Index
