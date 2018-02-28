import * as React from 'react';
import { Form, Select, Button } from 'antd';

import FormLayout from './FormLayout';
import Group from '../models/Group';

export interface SelectGroupProps {
  groups: Group[];
  selectedGroup: Group | undefined;
  onGroupSelected: (groupId: string) => void;
  onSendIdentityVerification: (email: string) => void;
}

interface SelectGroupState {
  email: string;
}

export default class SelectGroup extends React.Component<SelectGroupProps, SelectGroupState> {
  constructor(props: SelectGroupProps) {
    super(props);

    this.state = {
      email: '',
    }

    this.onEmailChange = this.onEmailChange.bind(this);
  }

  onEmailChange(email: string) {
    this.setState({
      email,
    })
  }

  render() {
    const group = this.props.selectedGroup;

    return (
      <FormLayout>
        <Form>
          <Form.Item>
            We have to verify you are member of the group.
            Please select your group.
            <Select
              onChange={this.props.onGroupSelected}
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
              onChange={this.onEmailChange}
              disabled={!group}
              placeholder="Select email address"
              style={{ width: '100%' }}
            >
              {group && group.members.map(member => (
                <Select.Option
                  key={member._id}
                  value={member._id}
                >
                  {member.email}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button
              disabled={!this.state.email}
              type="primary"
              onClick={e => this.props.onSendIdentityVerification(this.state.email)}
            >
              Send verification code
            </Button>
          </Form.Item>
        </Form>
      </FormLayout>
    );
  }
}
