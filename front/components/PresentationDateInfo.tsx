import * as React from 'react';
import { Moment } from 'moment';

import PresentationDate from '../models/PresentationDate';
import { TimeSlotLikeObject } from '../utils/DatetimeUtil';
import Loading from './Loading';

export interface PresentationDateInfoProps {
  loading: boolean;
  presentationDates: PresentationDate[];
  getInitialValue: (date: TimeSlotLikeObject, property: string) => string | Moment | undefined;
}

export default class PresentationDateInfo extends React.Component<PresentationDateInfoProps, any> {


  render() {
    if (this.props.loading) {
      return <Loading />
    }
    return (
      <div>
        {this.props.presentationDates.map(presentationDate => {
          return (
            <div key={presentationDate._id} style={{ marginBottom: '1em' }}>
              <h4>Dr. {presentationDate.admin.firstName} {presentationDate.admin.lastName} presentation dates</h4>
              {presentationDate.dates.length === 0 && (
                <div>No date is defined yet.</div>
              )}
              <ul>
                {presentationDate.dates.map(date => (
                  <li key={date._id}>
                    {this.props.getInitialValue(date, 'date')}&nbsp;
                    {this.props.getInitialValue(date, 'startTime')} -&nbsp;
                    {this.props.getInitialValue(date, 'endTime')}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    );
  }
}
