import * as React from 'react';
import { Form, Select, Button, Alert } from 'antd';
import ObjectID from 'bson-objectid';

import FormLayout from './FormLayout';
import Group from '../models/Group';
import { DateConstants } from '../models/Constants' ;
import DatetimeUtil from '../utils/DatetimeUtil';

export interface SelectGroupProps {
  groups: Group[];
  selectedGroup: Group | undefined;
  email: string;
  verifyEmailAddresses: {
    email: string;
    sentiso: string;
  }[];
  onGroupSelected: (groupId: string) => void;
  onEmailChange: (email: string) => void;
  onSendIdentityVerification: () => void;
}

export default class SelectGroup extends React.Component<SelectGroupProps, any> {
  message(verifyInfo: { email: string, sentiso: string }) {
    const { email, sentiso } = verifyInfo;
    const sentAt = DatetimeUtil.formatISOStringAtLocal(sentiso, DateConstants.hourMinFormat);
    return `${email} (${sentAt}): Verification email is queued. You will receive the email in 5 minutes.`;
  }
  
  render() {
    const group = this.props.selectedGroup;

    return (
      <FormLayout>
        <Form>
          {this.props.verifyEmailAddresses.map(verifyInfo => (
            <Form.Item
              key={ObjectID.generate()}
            >
              <Alert
                key={ObjectID.generate()}
                type="success"
                message={this.message(verifyInfo)}
              />
            </Form.Item>
          ))}
          <Form.Item>
            We have to verify you are member of the group.
            Please select your group.
            <Select
              onChange={this.props.onGroupSelected}
              value={this.props.selectedGroup && this.props.selectedGroup._id}
              placeholder="Select your group"
            >
              {this.props.groups.map(group => (
                <Select.Option
                  key={group._id}
                  value={group._id}
                >
                  Group {group.groupNumber}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            Email address which receives the verification email.
            <Select
              onChange={this.props.onEmailChange}
              disabled={!group}
              placeholder="Select email address"
              style={{ width: '100%' }}
              value={this.props.email}
            >
              {group && group.members.map(member => (
                <Select.Option
                  key={member._id}
                  value={member.email}
                >
                  {member.email}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button
              disabled={!this.props.email}
              type="primary"
              onClick={e => this.props.onSendIdentityVerification()}
            >
              Send verification code
            </Button>
          </Form.Item>
        </Form>
      </FormLayout>
    );
  }
}
