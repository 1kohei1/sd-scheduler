import * as React from 'react';

export interface ReminderProps {
}

export default class Reminder extends React.Component<ReminderProps, any> {
  render() {
    return (
      <div className="reminder">
        <div className="heading">
          Reminder? We send them.
        </div>
        <div className="title">
          <div>Committee members</div>
          <div>Group members</div>
          <div>Sponsor members</div>
          <div className="block"></div>
          <div>Everyone will receive a reminder a day before and an hour before.</div>
        </div>
        <style jsx>{`
          .reminder {
            margin: auto;
            max-width: 1040px;
            padding: 0 16px;
            text-align: center;
          }
          .reminder .heading {
            font-size: 32px;
            padding: 32px 0;
          }
          .reminder .title {
            font-size: 28px;
            font-weight: 300;
          }
          .reminder .block {
            height: 8px;
          }
          @media (max-width: 727px) {
            .reminder .heading {
              padding: 16px 0;
            }
          }
          @media (max-width: 380px) {
            .reminder .heading {
              font-size: 28px;
            }
          }
          @media (max-width: 330px) {
            .reminder .heading {
              font-size: 24px;
            }
          }
        `}</style>
      </div>
    );
  }
}
