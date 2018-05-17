import * as React from 'react';
import { Steps } from 'antd';

export interface ScheduleLayoutProps {
  current: number;
  groupNumber: number;
  description: string | React.ReactNode;
}

export default class ScheduleLayout extends React.Component<ScheduleLayoutProps, any> {
  render() {
    const { current, groupNumber, description } = this.props;

    return (
      <div className="container">
        <h1>Schedule presentation{groupNumber > 0 ? ` for group ${groupNumber}` : ``}</h1>
        <div style={{ marginBottom: '32px' }}>
          <Steps current={current}>
            <Steps.Step title="Select your group" />
            <Steps.Step title="Fill in presentation information" />
          </Steps>
        </div>
        <div style={{ marginBottom: '32px' }}>
          {description}
        </div>
        {this.props.children}
        <style jsx>{`
          .container {
            padding: 0 16px;
            max-width: 800px;
            margin: auto;
            margin-top: 100px;
          }
        `}</style>
      </div>
    );
  }
}
