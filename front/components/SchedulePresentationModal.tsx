import * as React from 'react';
import { Modal, Alert } from 'antd';
import { List } from 'immutable';

import Api from '../utils/Api';
import Presentation from '../models/Presentation';
import PresentationDate from '../models/PresentationDate';
import Faculty from '../models/Faculty';

export interface SchedulePresentationModalProps {
  visible: boolean;
  semesterId: string;
  schedulingPresentation: Presentation;
  onClose: (shouldUpdate: boolean) => void;
}

interface SchedulePresentationModalState {
  errs: List<string>;
  presentationDate: PresentationDate | undefined;
  schedulingPresentation: Presentation;
  faculties: Faculty[];
}

export default class SchedulePresentationModal extends React.Component<SchedulePresentationModalProps, SchedulePresentationModalState> {
  constructor(props: SchedulePresentationModalProps) {
    super(props);

    this.state = {
      errs: List<string>(),
      presentationDate: undefined,
      schedulingPresentation: props.schedulingPresentation,
      faculties: [],
    }

    this.onOk = this.onOk.bind(this);
  }

  onErr(err: string) {
    this.setState({
      errs: this.state.errs.push(err),
    })
  }

  componentDidMount() {
    this.getFaculties();
    this.getPresentationDate();
  }

  componentWillReceiveProps(nextProps: SchedulePresentationModalProps) {
    this.setState({
      schedulingPresentation: nextProps.schedulingPresentation,
    })
  }

  getFaculties() {

  }

  getPresentationDate() {

  }

  onOk() {
    // Update state.schedulingPresentation
    this.props.onClose(true);
  }

  render() {
    return (
      <Modal
        visible={this.props.visible}
        title={`Schedule presentation for group ${this.state.schedulingPresentation && this.props.schedulingPresentation.group.groupNumber}`}
        onOk={this.onOk}
        onCancel={e => this.props.onClose(false)}
      >
        {this.state.schedulingPresentation && (
          <div>Only when visible, display value here</div>
        )}
      </Modal>
    );
  }
}
