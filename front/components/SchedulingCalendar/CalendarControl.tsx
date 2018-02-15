import * as React from 'react';
import { Button, Icon } from 'antd';

import TimeSlot from '../../models/TimeSlot';
import DatetimeUtil from '../../utils/DatetimeUtil';
import { DateConstants } from '../../models/Constants';

export interface CalendarControlProps {
  index: number;
  presentationDates: TimeSlot[];
  changeIndex: (op: string) => void;
}

export default class CalendarControl extends React.Component<CalendarControlProps, any> {
  render() {
    const { index, presentationDates } = this.props;

    return (
      <div style={{ textAlign: 'right' }}>
        <Button
          onClick={(e) => this.props.changeIndex('-')}
          disabled={index === 0}
          style={{ marginRight: '16px' }}
        >
          <Icon type="left" /> {index > 0 &&
            DatetimeUtil.formatDate(presentationDates[index - 1].start, DateConstants.dateFormat)
          }
        </Button>
        <Button
          onClick={(e) => this.props.changeIndex('+')}
          disabled={index === presentationDates.length - 1}
        >
          {index < presentationDates.length - 1 &&
            DatetimeUtil.formatDate(presentationDates[index + 1].start, DateConstants.dateFormat)
          } <Icon type="right" />
        </Button>
      </div>
    );
  }
}
