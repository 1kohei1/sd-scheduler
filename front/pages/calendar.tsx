import * as React from 'react';
import { List } from 'immutable';
import Link from 'next/link';
import { Timeline, Alert, Checkbox, Button } from 'antd';

import AppLayout from '../components/AppLayout';
import { Semester } from '../models/Semester';
import Faculty from '../models/Faculty';
import AvailableSlot from '../models/AvailableSlot';
import PresentationDate from '../models/PresentationDate';
import Presentation from '../models/Presentation';
import { DateConstants, SchedulingCalendarConstants } from '../models/Constants';
import TimeSlot from '../models/TimeSlot';
import DatetimeUtil from '../utils/DatetimeUtil';
import Api from '../utils/Api';
import Loading from '../components/Loading';
import SchedulingCalendar from '../components/SchedulingCalendar/SchedulingCalendar';

export interface CalendarProps {
  semester: Semester;
}

interface CalendarState {
  loading: boolean;
  errs: List<string>;

  faculties: Faculty[];
  availableSlots: AvailableSlot[];
  presentationDates: PresentationDate[];
  presentations: Presentation[];
}

export default class Calendar extends React.Component<CalendarProps, CalendarState> {
  static async getInitialProps() {
    const semesters = await Api.getSemesters();
    const semester = semesters[0];

    console.log(semester);

    return {
      semester,
    }
  }

  constructor(props: CalendarProps) {
    super(props);

    this.state = {
      loading: true,
      errs: List<string>(),

      faculties: [],
      availableSlots: [],
      presentationDates: [],
      presentations: [],
    }


  }

  onErr(err: string) {
    this.setState({
      errs: this.state.errs.push(err),
      loading: false,
    });
  }

  componentDidMount() {
    Promise.all([
      this.getFaculties(),
      this.getAvailableSlots(),
      this.getPresentationDates(),
      this.getPresentations(),
    ])
      .then(() => {
        this.setState({
          loading: false,
        });
      })
      .catch(err => {
        this.onErr(err.message);
      })
  }

  private async getFaculties() {
    try {
      const faculties = await Api.getFaculties('isActive=true');
      this.setState({
        faculties,
      });
    } catch (err) {
      this.onErr(err.message);
    }
  }

  private async getAvailableSlots() {
    try {
      const availableSlots = await Api.getAvailableSlots(`semester=${this.props.semester._id}`);
      this.setState({
        availableSlots,
      });
    } catch (err) {
      this.onErr(err.message);
    }
  }

  private async getPresentationDates() {
    try {
      const presentationDates = await Api.getPresentationDates(`semester=${this.props.semester._id}`);
      this.setState({
        presentationDates,
      })
    } catch (err) {
      this.onErr(err.message);
    }
  }

  private async getPresentations() {
    try {
      const presentations = await Api.getPresentations(`semester=${this.props.semester._id}`);
      this.setState({
        presentations,
      });
    } catch (err) {
      this.onErr(err.message);
    }
  }

  render() {
    console.log(this.state.presentationDates[0]);

    return (
      <AppLayout>
        <div className="container">
          <h1>Semester calendar</h1>
          <div className="description">
            Ready to schedule presentation?&nbsp;&nbsp;
            <Link href="/schedule">
              <a>
                <Button type="primary">
                  Schedule presentation
                </Button>
              </a>
            </Link>
          </div>
          {this.state.loading ? <Loading /> : (
            <SchedulingCalendar
              presentationDate={this.state.presentationDates[0]}
              faculties={this.state.faculties}
              availableSlots={this.state.availableSlots}
              presentations={this.state.presentations}
            />
          )}
          <div className="description">
            Ready to schedule presentation?&nbsp;&nbsp;
            <Link href="/schedule">
              <a>
                <Button type="primary">
                  Schedule presentation
                </Button>
              </a>
            </Link>
          </div>
        </div>
        <style jsx>{`
          .container {
            max-width: ${SchedulingCalendarConstants.containerWidth};
            padding-left: ${SchedulingCalendarConstants.containerLeftPadding};
            padding-right: ${SchedulingCalendarConstants.containerRightPadding};
            margin: auto;
            margin-top: 100px;
          }
          .container h1 {
            margin: 0;
          }
          .description {
            padding: 32px 0;
          }
        `}</style>
      </AppLayout>
    );
  }
}
