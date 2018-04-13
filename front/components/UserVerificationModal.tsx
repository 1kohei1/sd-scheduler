import * as React from 'react';
import { Modal, Select, Input, Button, Icon, Form, Alert } from 'antd';
import { List } from 'immutable';

import Api from '../utils/Api';
import CookieUtil from '../utils/CookieUtil';
import Group from '../models/Group';
import Person from '../models/Person';

export interface UserVerificationModalProps {
  visible: boolean;
  _id: string | undefined;
  body: object;
  group: Group;
  onClose: () => void;
}

interface UserVerificationModalState {
  errs: List<string>;
  saving: boolean;

  selectedMemberId: string;
  verificationCode: string;
  verificationCodeSent: boolean;
}

export default class UserVerificationModal extends React.Component<UserVerificationModalProps, UserVerificationModalState> {
  constructor(props: UserVerificationModalProps) {
    super(props);

    this.state = {
      errs: List<string>(),
      saving: false,

      selectedMemberId: '',
      verificationCode: '',
      verificationCodeSent: false,
    }

    this.sendVerificationCode = this.sendVerificationCode.bind(this);
    this.verifyCode = this.verifyCode.bind(this);
  }

  onErr(err: string) {
    this.setState({
      errs: this.state.errs.push(err),
      saving: false,
    })
  }

  onChange(prop: 'selectedMemberId' | 'verificationCode', val: string) {
    const newState: any = {
      [prop]: val,
    }
    this.setState(newState);
  }

  async sendVerificationCode() {
    try {
      this.setState({
        saving: true,
      })
      await Api.sendCode(this.props.group._id, {
        verificationCodeReceiverId: this.state.selectedMemberId,
      });
      this.setState({
        verificationCodeSent: true,
        saving: false,
      })
    } catch (err) {
      this.onErr(err.message);
    }
  }

  async verifyCode() {
    try {
      this.setState({
        saving: true,
      })
      const token = await Api.verifyCode(this.props.group._id, {
        code: this.state.verificationCode,
      });
      CookieUtil.setToken(token);
      this.schedulePresentation();
    } catch (err) {
      this.onErr(err.message)
    }
  }

  async schedulePresentation() {
    try {
      // Schedule presentation
      console.log('schedule presentation');
      this.setState({
        saving: false,
      })
    } catch (err) {
      this.onErr(err.message)
    }
  }

  render() {
    const { group } = this.props;

    return (
      <Modal
        visible={this.props.visible}
        title={`Please verify you are the member of group ${group.groupNumber}`}
        footer={null}
        onCancel={this.props.onClose}
      >
        <div>Only group member can schedule the presentation.</div>
        <div>Please select the member to receive the verification code and enter the emailed code.</div>
        <div>The system stores the last code. So send verification code only one time.</div>
        {this.state.verificationCodeSent && (
          <Alert
            style={{ marginTop: '8px' }}
            type="success"
            message="Successfully sent verification code"
          />
        )}
        {this.state.errs.map((err: string) => (
          <Alert
            style={{ marginTop: '8px' }}
            type="error"
            message={err}
          />
        ))}
        <Form>
          <Form.Item
            label="Who will receive the verification code?"
          >
            <Select
              value={this.state.selectedMemberId}
              onChange={(val: string) => this.onChange('selectedMemberId', val)}
            >
              {group.members.map((member: Person) => (
                <Select.Option
                  key={member._id}
                  value={member._id}
                >
                  {member.firstName} {member.lastName} &lt;{member.email}&gt;
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button
              type={this.state.verificationCodeSent ? undefined : 'primary'}
              onClick={this.sendVerificationCode}
              loading={this.state.saving}
            >
              Send verification code
            </Button>
          </Form.Item>
          {this.state.verificationCodeSent && (
            <div>
              <Form.Item
                label="Verification code"
              >
                <Input
                  value={this.state.verificationCode}
                  onChange={e => this.onChange('verificationCode', e.target.value)}
                />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  loading={this.state.saving}
                  onClick={this.verifyCode}
                >
                  Verify &amp; schedule presentation
                </Button>
              </Form.Item>
            </div>
          )}
        </Form>
      </Modal>
    );
  }
}
