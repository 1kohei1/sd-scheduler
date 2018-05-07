import * as React from 'react';
import { Modal, Select, Input, Button, Icon, Form, Alert } from 'antd';
import { List } from 'immutable';

import Api from '../utils/Api';
import CookieUtil from '../utils/CookieUtil';
import Group from '../models/Group';
import Person from '../models/Person';

export interface UserVerificationModalProps {
  visible: boolean;
  group: Group;
  onVerified: () => void;
  onClose: () => void;
}

interface UserVerificationModalState {
  errs: List<string>;
  saving: boolean;

  email: string;
  verificationCode: string;
  verificationCodeSent: boolean;
}

export default class UserVerificationModal extends React.Component<UserVerificationModalProps, UserVerificationModalState> {
  constructor(props: UserVerificationModalProps) {
    super(props);

    this.state = {
      errs: List<string>(),
      saving: false,

      email: '',
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

  componentWillReceiveProps(nextProps: UserVerificationModalProps) {
    if (nextProps.visible == false) {
      this.setState({
        errs: List<string>(),
        saving: false,

        email: '',
        verificationCode: '',
        verificationCodeSent: false,
      });
    }
  }

  onChange(prop: 'email' | 'verificationCode', val: string) {
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
        email: this.state.email,
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
      this.props.onVerified();
    } catch (err) {
      this.onErr(err.message)
    }
  }

  render() {
    const { group } = this.props;

    return (
      <Modal
        visible={this.props.visible}
        title={`Please verify you are the member of Group ${group.groupNumber}`}
        footer={null}
        onCancel={this.props.onClose}
      >
        <div>Please enter your <b>KNIGHTS</b> email to receive the verification code.</div>
        {
          this.state.verificationCodeSent && (
            <Alert
              style={{ marginTop: '8px' }}
              type="success"
              message="Successfully sent verification code. Please wait up to a minute to receive a code."
            />
          )
        }
        {
          this.state.errs.map((err: string, index: number) => (
            <Alert
              key={index}
              style={{ marginTop: '8px' }}
              type="error"
              message={err}
            />
          ))
        }
        <Form>
          <Form.Item
            label="What's your KNIGHTS email?"
          >
            <Input
              value={this.state.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.onChange('email', e.target.value)}
              placeholder="KNIGHTS email associated with Webcourse"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type={this.state.verificationCodeSent ? undefined : 'primary'}
              onClick={this.sendVerificationCode}
              loading={this.state.saving}
            >
              {this.state.verificationCodeSent ? "Resend verification code" : "Send verification code"}
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
                  Verify
                </Button>
              </Form.Item>
            </div>
          )}
        </Form>
      </Modal>
    );
  }
}