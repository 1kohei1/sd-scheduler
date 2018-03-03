import * as React from 'react';


import InitialProps from '../models/InitialProps';
import Api from '../utils/Api';
import AppLayout from '../components/AppLayout';
import FormLayout from '../components/FormLayout';
import CookieUtil from '../utils/CookieUtil';

export interface GroupsProps {
  isVerified: boolean;
  message: string;
  token: string;
}

export default class Groups extends React.Component<GroupsProps, any> {
  static async getInitialProps(context: InitialProps) {
    const { authenticationToken } = context.query;

    try {
      const token = await Api.verifyGroupAuthenticationToken(authenticationToken);
      return {
        isVerified: true,
        message: '',
        token,
      }
    } catch (err) {
      return {
        isVerified: false,
        message: err.message,
      }
    }
  }

  componentDidMount() {
    if (this.props.isVerified) {
      CookieUtil.setToken(this.props.token);
    }
  }

  render() {
    return (
      <AppLayout>
        <FormLayout>
          {this.props.isVerified ? (
            <div>
              <h2>Your identity is verified!</h2>
              <p>Please go back to schedule page and fill the group info!</p>
            </div>
          ) : (
              <div>
                <h2>Invalid token</h2>
                <p>{this.props.message + ' '}Please send another verification code from schedule page.</p>
              </div>
            )}
        </FormLayout>
      </AppLayout>
    );
  }
}
