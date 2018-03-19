import * as React from 'react';
import { Card } from 'antd';

export interface CardInfoProps {
  onClick?: (d: any) => void;
  isSelected?: boolean;
  title: string;
  description?: string;
}

export default class CardInfo extends React.Component<CardInfoProps, any> {
  render() {
    return (
      <div
        onClick={this.props.onClick}
      >
        <Card
          hoverable
          style={{
            width: '200px',
            margin: '16px 16px 0 0',
            border: `${this.props.isSelected ? '1px solid #1890ff' : ''}`
          }}
        >
          <Card.Meta
            title={this.props.title}
            description={this.props.description}
          />
        </Card>
      </div>
    );
  }
}
