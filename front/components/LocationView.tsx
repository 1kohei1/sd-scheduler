import * as React from 'react';
import { Card, Button, message } from 'antd';
import { List } from 'immutable';

import { Semester } from '../models/Semester';
import { DateConstants } from '../models/Constants';
import DatetimeUtil, { TimeSlotLikeObject } from '../utils/DatetimeUtil';
import PresentationDate from '../models/PresentationDate';
import Api from '../utils/Api';
import Location from '../models/Location';
import Faculty from '../models/Faculty';
import LocationInfo from './LocationInfo';
import LocationEditing from './LocationEditing';

export interface LocationViewProps {
  semester: Semester;
  isAdmin: boolean;
  facultyId: string;
}

interface LocationViewState {
  loading: boolean;
  editing: boolean;
  updating: boolean;
  err: string;
  locations: Location[];
  faculties: Faculty[];
}

export default class LocationView extends React.Component<LocationViewProps, LocationViewState> {
  constructor(props: LocationViewProps) {
    super(props);

    this.state = {
      loading: true,
      editing: false,
      updating: false,
      err: '',
      locations: Array<Location>(),
      faculties: Array<Faculty>(),
    }

    this.extra = this.extra.bind(this);
    this.toggleForm = this.toggleForm.bind(this);
    this.updateLocation = this.updateLocation.bind(this);
  }

  componentDidMount() {
    // Get presentationDates
    this.setLocations();
  }

  componentWillReceiveProps(nextProps: LocationViewProps) {
    if (nextProps.semester !== this.props.semester) {
      this.setState({
        loading: true,
        editing: false,
        updating: false,
      });

      // Get new presentationDates
      this.setLocations(nextProps.semester._id);
    }
  }

  private async setLocations(semesterId?: string) {
    let _id = this.props.semester._id;
    if (semesterId) {
      _id = semesterId;
    }
    try {
      const locations = await Api.getLocations(`semester=${_id}`) as Location[];

      const fids = locations.map(location => location.admin);
      const fQuery = fids.map(fid => `_id[$in]=${fid}`).join('&');

      const faculties = await Api.getFaculties(fQuery) as Faculty[];

      // Sort by faculty's alphabetical order
      locations.sort((a: Location, b: Location) => {
        const index1 = faculties.map(f => f._id).indexOf(a.admin);
        const index2 = faculties.map(f => f._id).indexOf(b.admin);

        return index1 - index2;
      });

      this.setState({
        loading: false,
        locations,
        faculties,
      });
    } catch (err) {
      this.setState({
        loading: false,
        err: err.message,
        locations: [],
        faculties: [],
      })
    }
  }

  async updateLocation(locationStr: string) {
    const index = this.state.locations
    .findIndex(location => location.admin === this.props.facultyId);

    if (index >= 0) {
      this.setState({
        err: '',
        updating: true,
      });

      const location = this.state.locations[index];

      try {
        const updatedLocation = await Api.updateLocation(location._id, { location: locationStr });

        this.setState((prevState: LocationViewState, props: LocationViewProps) => {
          let newLocations = List(prevState.locations);
          newLocations = newLocations.set(index, updatedLocation);

          message.success('Successfully updated the presentation dates');

          return {
            updating: false,
            editing: false,
            locations: newLocations.toArray(),
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
    this.setState((prevState: LocationViewState, props: LocationViewProps) => {
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
        Edit location
      </Button>);
    } else {
      return '';
    }
  }

  render() {
    const location = this.state.locations
      .find(location => location.admin === this.props.facultyId) as Location;

    return (
      <Card title="Presentation location" extra={this.extra()} style={{ marginBottom: '16px' }}>
        {this.state.editing ? (
          <LocationEditing
            err={this.state.err}
            updating={this.state.updating}
            location={location}
            updateLocation={this.updateLocation}
            toggleForm={this.toggleForm}
          />
        ) : (
            <LocationInfo
              loading={this.state.loading}
              locations={this.state.locations}
              faculties={this.state.faculties}
            />
          )}
      </Card>
    );
  }
}