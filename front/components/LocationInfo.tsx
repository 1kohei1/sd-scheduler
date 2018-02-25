import * as React from 'react';
import { Moment } from 'moment';

import Location from '../models/Location';
import Loading from './Loading';

export interface LocationInfoProps {
  loading: boolean;
  locations: Location[];
}

export default class LocationInfo extends React.Component<LocationInfoProps, any> {


  render() {
    if (this.props.loading) {
      return <Loading />
    }
    return (
      <div>
        {this.props.locations.map(location => {
          return (
            <div key={location._id} style={{ marginBottom: '1em' }}>
              <h4>Dr. {location.admin.firstName} {location.admin.lastName} presentation location</h4>
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
