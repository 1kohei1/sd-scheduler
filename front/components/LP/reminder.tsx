import * as React from 'react';

export interface ReminderProps {
}

export default class Reminder extends React.Component<ReminderProps, any> {
  render() {
    return (
      <div className="reminder">
        <div className="heading">
          Need a reminder? We'll send them
        </div>
        <div className="title">
          <div>Committee Members</div>
          <div>Group Members</div>
          <div>Sponsor Members</div>
          <div className="block"></div>
          <div>Everyone will receive a reminder a day before and an hour before the presentation</div>
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
