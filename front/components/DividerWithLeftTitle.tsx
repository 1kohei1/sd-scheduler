import * as React from 'react';

export interface DividerWithLeftTitleProps {
  title: string;
}

export default class DividerWithLeftTitle extends React.Component<DividerWithLeftTitleProps, any> {
  render() {
    return (
      <div style={{ display: 'flex', margin: '16px 0' }}>
        <h3 style={{ paddingRight: '24px', marginBottom: 0 }}>{this.props.title}</h3>
        <div style={{ borderTop: '1px solid #e8e8e8', flexGrow: 1, marginTop: '12px' }}></div>
      </div>
    );
  }
}
