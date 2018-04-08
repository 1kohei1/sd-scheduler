import * as React from 'react';
import { Modal, Alert } from 'antd';

import Api from '../utils/Api';
import Loading from './Loading';

export interface AdminEmailHelpModalProps {
  visible: boolean;
  onClose: (e: React.MouseEvent<any>) => void;
}

interface AdminEmailHelpModalState {
  loading: boolean;
  terms: object;
  err: string;
}

export default class AdminEmailHelpModal extends React.Component<AdminEmailHelpModalProps, AdminEmailHelpModalState> {
  constructor(props: AdminEmailHelpModalProps) {
    super(props);

    this.state = {
      loading: true,
      terms: {},
      err: '',
    }
  }

  componentDidMount() {
    try {
      const terms = Api.getTerms();
      this.setState({
        loading: false,
        terms,
      })
    } catch (err) {
      this.setState({
        loading: false,
        err: err.message,
      })
    }
  }

  render() {
    return (
      <Modal
        title="How to insert link?"
        visible={this.props.visible}
        onOk={this.props.onClose}
        onCancel={this.props.onClose}
      >
        {this.state.loading ? <Loading /> : (
          this.state.err ? (
            <Alert
              type="error"
              message={this.state.err}
            />
          ) : (
            <div>
              ABC
            </div>
          )
        )}
      </Modal>
    );
  }
}
