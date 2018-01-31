import * as React from 'react';
import { Form } from 'antd';

export interface FilterProps {
}

export default class Filter extends React.Component<FilterProps, any> {
  render() {
    return (
      <div className="ko-filter-form">
        <style jsx>{`
          .ko-filter-form {
            padding: 24px;
            background: #fbfbfb;
            border: 1px solid #d9d9d9;
            border-radius: 6px;
          }
        `}
        </style>
      </div>
    );
  }
}
