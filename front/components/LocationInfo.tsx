import * as React from 'react';
import { Moment } from 'moment';

import Location from '../models/Location';
import Faculty from '../models/Faculty';
import Loading from './Loading';

export interface LocationInfoProps {
  loading: boolean;
  locations: Location[];
  faculties: Faculty[];
}

export default class LocationInfo extends React.Component<LocationInfoProps, any> {


  render() {
    if (this.props.loading) {
      return <Loading />
    }
    return (
      <div>
        {this.props.locations.map(location => {
          const faculty = this.props.faculties.find(f => f._id === location.admin) as Faculty;

          return (
            <div key={location._id} style={{ marginBottom: '1em' }}>
              <h4>Dr. {faculty.firstName} {faculty.lastName} presentation location</h4>
              {location.location ? (
                <div>{location.location}</div>
              ) : (
                  <div>Location is not set yet.</div>
                )}
            </div>
          )
        })}
      </div>
    );
  }
}
