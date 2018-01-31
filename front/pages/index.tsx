import * as React from 'react';
import { Row, Col, Button } from 'antd';
import ObjectID from 'bson-objectid';
import * as moment from 'moment-timezone';
const fetch = require('isomorphic-unfetch');

import AppLayout from '../components/AppLayout';
import FilterQuery from '../models/FilterQuery';
import InitialProps from '../models/InitialProps';
import { Semester } from '../models/Semester';
import SchedulingFilter from '../components/SchedulingCalendar/SchedulingFilter';
import SchedulingCalendar from '../components/SchedulingCalendar/SchedulingCalendar';
import { DateConstants } from '../models/Constants';

interface Props {
  filterQuery: FilterQuery;
  semester: Semester;
}

const columnLayout = {
  xs: {
    span: 22,
    offset: 1,
  },
  lg: {
    span: 18,
    offset: 3
  },
};

class Index extends React.Component<Props, {}> {
  static async getInitialProps(props: InitialProps) {

    const tempFunc = (dateStr: string) => {
      return moment.tz(dateStr, `${DateConstants.dateFormat} ${DateConstants.hourFormat}`, DateConstants.timezone);
    }

    // Get semester here
    const semester = {
      _id: ObjectID.generate(),
      key: '2018_spring',
      displayName: '2018 Spring',
      presentationDates: [{
        _id: ObjectID.generate(),
        start: tempFunc('2018-04-25 9 AM').toISOString(),
        end: tempFunc('2018-04-25 6 PM').toISOString(),
      }, {
        _id: ObjectID.generate(),
        start: tempFunc('2018-04-26 9 AM').toISOString(),
        end: tempFunc('2018-04-26 6 PM').toISOString(),
      }, {
        _id: ObjectID.generate(),
        start: tempFunc('2018-04-27 9 AM').toISOString(),
        end: tempFunc('2018-04-27 6 PM').toISOString(),
      }]
    };

    return {
      filterQuery: props.query,
      semester,
    };
  }

  constructor(props: Props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <AppLayout>
        <Row>
          <Col
            {...columnLayout}
          >
            <SchedulingFilter 
              semester={this.props.semester}
              filterQuery={this.props.filterQuery}
            />
            <SchedulingCalendar 
              semester={this.props.semester}
              filterQuery={this.props.filterQuery}
            />
            <div>
              Display the selected professors and datetime.
              <Button type="primary">Schedule presentation</Button>
            </div>
          </Col>
        </Row>
      </AppLayout>
    )
  }
}
export default Index
