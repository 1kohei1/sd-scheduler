import * as React from 'react';

export interface DeviceProps {
}

export default class Device extends React.Component<DeviceProps, any> {
  render() {
    return (
      <div className="device">
          <div className="heading">
            Available anywhere!
          </div>
          <img src="/static/prod-device.png" style={{ width: '100%' }}/>
        <style jsx>{`
          .device {
            margin: auto;
            max-width: 1040px;
            padding: 0 16px;
            text-align: center;
            margin-bottom: 32px;
          }
          .device .heading {
            font-size: 32px;
            padding: 32px 0;
          }
          .device .title {
            font-size: 28px;
            font-weight: 300;
          }
          .device .block {
            height: 8px;
          }
          @media (max-width: 727px) {
            .device .heading {
              padding: 16px 0;
            }
          }
          @media (max-width: 380px) {
            .device .heading {
              font-size: 28px;
            }
          }
          @media (max-width: 330px) {
            .device .heading {
              font-size: 24px;
            }
          }
        `}</style>
      </div>
    );
  }
}
