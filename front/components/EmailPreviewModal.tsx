import * as React from 'react';
import { Modal, Alert, Divider } from 'antd';

import Api from '../utils/Api';

export interface EmailPreviewModalProps {
  visible: boolean;
  subject: string;
  content: string;
  onClose: (e: React.MouseEvent<any>) => void;
}

interface EmailPreviewModalState {
  content: string;
  err: string;
}

export default class EmailPreviewModal extends React.Component<EmailPreviewModalProps, EmailPreviewModalState> {
  constructor(props: EmailPreviewModalProps) {
    super(props);

    this.state = {
      content: '',
      err: '',
    }
  }
  
  async componentWillReceiveProps(nextProps: EmailPreviewModalProps) {
    try {
      const body = {
        content: nextProps.content,
      }
      const emailHtml = await Api.getPreview(body);
      this.setState({
        content: emailHtml,
      })
    } catch (err) {
      this.setState({
        err: err.message,
      });
    }
  }

  render() {
    return (
      <Modal
        title="Preview your email"
        visible={this.props.visible}
        width={500}
        onOk={this.props.onClose}
        onCancel={this.props.onClose}
      >
        <div className="subject">
          [SD Scheduler] {this.props.subject}
        </div>
        <div className="content">
          {this.state.err
            ? <Alert
              type="error"
              showIcon
              message="Error"
              description={this.state.err}
            />
            : <div dangerouslySetInnerHTML={{ __html: this.state.content }}></div>}
        </div>
        <style jsx>{`
          .subject {
            margin-bottom: 8px;
          }
        `}</style>
      </Modal>
    );
  }
}
