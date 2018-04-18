import * as React from 'react';

export interface FormLayoutProps {
}

export default class FormLayout extends React.Component<FormLayoutProps, any> {
  render() {
    return (
      <div className="ko-form-wrapper">
        {this.props.children}
        <style jsx>{`
          .ko-form-wrapper {
            max-width: 532px;
            padding: 0 16px;
            margin: auto;
            margin-top: 100px;
          }
        `}</style>
      </div>
    );
  }
}
