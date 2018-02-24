import * as React from 'react';
import { Card, Button, Alert } from 'antd';

import { Semester } from '../models/Semester';
import { DateConstants } from '../models/Constants';
import DatetimeUtil, { TimeSlotLikeObject } from '../utils/DatetimeUtil';
import PresentationDate from '../models/PresentationDate';
import Api from '../utils/Api';
import Faculty from '../models/Faculty';
import PresentationDateInfo from './PresentationDateInfo';
import PresentationDateEditing from './PresentationDateEditing';

export interface PresentationDateViewProps {
  semester: Semester;
  isAdmin: boolean;
  facultyId: string;
}

interface PresentationDateViewState {
  loading: boolean;
  editing: boolean;
  updating: boolean;
  err: string;
  presentationDates: PresentationDate[];
  faculties: Faculty[];
}

export default class PresentationDateView extends React.Component<PresentationDateViewProps, PresentationDateViewState> {
  constructor(props: PresentationDateViewProps) {
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
    this.toggleForm = this.toggleForm.bind(this);
    this.updatePresentationDate = this.updatePresentationDate.bind(this);
  }

  componentDidMount() {
    // Get presentationDates
    this.setPresentationDates();
  }

  componentWillReceiveProps(nextProps: PresentationDateViewProps) {
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
    this.setState((prevState: PresentationDateViewState, props: PresentationDateViewProps) => {
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
        ) : (
          <PresentationDateInfo
            loading={this.state.loading}
            presentationDates={this.state.presentationDates}
            faculties={this.state.faculties}
            getInitialValue={this.getInitialValue}
          />
        )}
      </Card>
    );
  }
}