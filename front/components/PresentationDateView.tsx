import * as React from 'react';
import { Card, Button, message } from 'antd';
import { List } from 'immutable';

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

      // Sort by faculty's alphabetical order
      presentationDates.sort((a: PresentationDate, b: PresentationDate) => {
        const index1 = faculties.map(f => f._id).indexOf(a.admin);
        const index2 = faculties.map(f => f._id).indexOf(b.admin);

        return index1 - index2;
      });

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

  async updatePresentationDate(dates: TimeSlotLikeObject[]) {
    const index = this.state.presentationDates
      .findIndex(presentationDate => presentationDate.admin === this.props.facultyId);

    if (index >= 0) {
      this.setState({
        err: '',
        updating: true,
      });

      const presentationDate = this.state.presentationDates[index];

      try {
        const updatedPresentationDate = await Api.updatePresentationDate(presentationDate._id, { dates })

        this.setState((prevState: PresentationDateViewState, props: PresentationDateViewProps) => {
          let newPresentationDates = List(prevState.presentationDates);
          newPresentationDates = newPresentationDates.set(index, updatedPresentationDate);

          message.success('Successfully updated the presentation dates');

          return {
            updating: false,
            editing: false,
            presentationDates: newPresentationDates.toArray(),
          }
        });
      } catch (err) {
        this.setState({
          updating: false,
          err: err.message,
        });
      }
    }
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