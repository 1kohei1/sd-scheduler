import * as React from 'react';
import { Spin, Icon } from 'antd';


export interface LoadingProps {
}

interface LoadingState {
  dots: string;
}

export default class Loading extends React.Component<LoadingProps, any> {
  repetition: null | NodeJS.Timer = null;

  constructor(props: LoadingProps) {
    super(props);

    this.state = {
      dots: '',
    };
  }

  componentDidMount() {
    this.repetition = setInterval(() => {
      this.setState((prevState: LoadingState, props: LoadingProps) => {
        let newDots = prevState.dots + '.';
        if (newDots.length > 3) {
          newDots = '';
        };
        return {
          dots: newDots,
        }
      });
    }, 500);
  }

  componentWillUnmount() {
    if (this.repetition) {
      clearInterval(this.repetition);
    }
  }

  render() {
    return (
      <div>
        <Spin indicator={<Icon type="loading" style={{ fontSize: 24, paddingRight: '8px' }} />}/> Loading{this.state.dots}
      </div>
    );
  }
}
