import * as React from 'react';
import { Card, Button, Alert } from 'antd';

import { Semester } from '../models/Semester';
import { DateConstants } from '../models/Constants';
import DatetimeUtil, { TimeSlotLikeObject } from '../utils/DatetimeUtil';
import PresentationDate from '../models/PresentationDate';
import Loading from './Loading';
import Api from '../utils/Api';
import Faculty from '../models/Faculty';
import PresentationDateEditing from './PresentationDateEditing';

export interface PresentationDate2Props {
  semester: Semester;
  isAdmin: boolean;
  facultyId: string;
}

interface PresentationDate2State {
  loading: boolean;
  editing: boolean;
  updating: boolean;
  err: string;
  presentationDates: PresentationDate[];
  faculties: Faculty[];
}

export default class PresentationDate2 extends React.Component<PresentationDate2Props, PresentationDate2State> {
  constructor(props: PresentationDate2Props) {
    super(props);

    this.state = {
      loading: true,
      editing: false,
      updating: false,
      err: '',
      presentationDates: Array<PresentationDate>(),
      faculties: Array<Faculty>(),
    }

    this.extra = this.extra.bind(this);
    this.info = this.info.bind(this);
    this.toggleForm = this.toggleForm.bind(this);
    this.updatePresentationDate = this.updatePresentationDate.bind(this);
  }

  componentDidMount() {
    // Get presentationDates
    this.setPresentationDates();
  }

  componentWillReceiveProps(nextProps: PresentationDate2Props) {
    if (nextProps.semester !== this.props.semester) {
      this.setState({
        loading: true,
        editing: false,
        updating: false,
      });

      // Get new presentationDates
      this.setPresentationDates(nextProps.semester._id);
    }
  }

  private async setPresentationDates(semesterId?: string) {
    let _id = this.props.semester._id;
    if (semesterId) {
      _id = semesterId;
    }
    try {
      const presentationDates = await Api.getPresentationDates(`semester=${_id}`) as PresentationDate[];

      const fids = presentationDates.map(date => date.admin);
      const fQuery = fids.map(fid => `_id[$in]=${fid}`).join('&');

      const faculties = await Api.getFaculties(fQuery) as Faculty[];

      this.setState({
        loading: false,
        presentationDates,
        faculties,
      });
    } catch (err) {
      this.setState({
        loading: false,
        err: err.message,
        presentationDates: [],
        faculties: [],
      })
    }
  }

  /*
  handleSubmit(e: React.FormEvent<any>) {
    e.preventDefault();

    this.props.form.validateFields((err, values) => {
      if (err) {
        return
      }

      // Format dates object to be DB format
      const presentationDates: any = [];
      for (let id in values.presentationDates) {
        const formValue = values.presentationDates[id];

        // If all data is not given, skip it
        if (!formValue.date || !formValue.startTime || !formValue.endTime) {
          continue;
        }

        const dateString = DatetimeUtil.formatDate(formValue.date, DateConstants.dateFormat);

        presentationDates.push({
          _id: id,
          start: DatetimeUtil.getISOString(dateString, formValue.startTime),
          end: DatetimeUtil.getISOString(dateString, formValue.endTime),
        });
      }
      // Update PresentationDate

      // const updateObj = {
      //   presentationDates,
      // }
      // this.props.updateSemester(updateObj, this.props.prop);
    })
  }
  */

  getInitialValue(date: TimeSlotLikeObject, property: string) {
    if (property === 'date' && date.start) {
      return DatetimeUtil.formatISOString(date.start, DateConstants.dateFormat);
    } else if (property === 'dateMoment' && date.start) {
      return DatetimeUtil.getMomentFromISOString(date.start);
    } else if (property === 'startTime' && date.start) {
      return DatetimeUtil.formatISOString(date.start, DateConstants.hourFormat);
    } else if (property === 'endTime' && date.end) {
      return DatetimeUtil.formatISOString(date.end, DateConstants.hourFormat);
    } else {
      return undefined;
    }
  }

  updatePresentationDate(dates: TimeSlotLikeObject[]) {

  }

  toggleForm() {
    this.setState((prevState: PresentationDate2State, props: PresentationDate2Props) => {
      return {
        editing: !prevState.editing,
      }
    })
  }

  extra() {
    const isArchived = false;

    let extra: string | JSX.Element = '';
    if (this.props.isAdmin && !isArchived && this.state.editing) {
      return (<Button
        icon="close"
        size="small"
        loading={this.state.updating}
        onClick={(e) => this.toggleForm()}
      >
        Cancel
      </Button>);
    } else if (this.props.isAdmin && !isArchived) {
      return (<Button ghost
        type="primary"
        size="small"
        onClick={(e) => this.toggleForm()}
      >
        Edit presentation dates
      </Button>);
    } else {
      return '';
    }
  }

  info() {
    if (this.state.loading) {
      return <Loading />
    }
    return (
      <div>
        {this.state.presentationDates.map(presentationDate => {
          const faculty = this.state.faculties.find(f => f._id === presentationDate.admin) as Faculty;

          return (
            <div key={presentationDate._id} style={{ marginBottom: '1em' }}>
              <h4>Dr. {faculty.firstName} {faculty.lastName} presentation dates</h4>
              {presentationDate.dates.length === 0 && (
                <div>No date is defined yet.</div>
              )}
              <ul>
                {presentationDate.dates.map(date => (
                  <li key={date._id}>
                    {this.getInitialValue(date, 'date')}&nbsp;
                    {this.getInitialValue(date, 'startTime')} -&nbsp;
                    {this.getInitialValue(date, 'endTime')}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    );
  }

  render() {
    const presentationDate = this.state.presentationDates
      .find(presentationDate => presentationDate.admin === this.props.facultyId) as PresentationDate;

    return (
      <Card title="Presentation dates" extra={this.extra()} style={{ marginBottom: '16px' }}>
        {this.state.editing ? (
          <PresentationDateEditing
            err={this.state.err}
            updating={this.state.updating}
            presentationDate={presentationDate}
            updatePresentationDate={this.updatePresentationDate}
            toggleForm={this.toggleForm}
            getInitialValue={this.getInitialValue}
          />
        ) : this.info()}
      </Card>
    );
  }
}