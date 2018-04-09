import * as React from 'react';

import Api from '../utils/Api';
import Faculty from '../models/Faculty';

export interface PastEmailsProps {
  faculties: Faculty[];
}

interface PastEmailsState {

}

export default class PastEmails extends React.Component<PastEmailsProps, PastEmailsState> {
  constructor(props: PastEmailsProps) {
    super(props);

    this.state = {

    }
  }

  componentDidMount() {
    console.log('Hello');
  }

  render() {
    return (
      <div>
        Past emails
      </div>
    );
  }
}
