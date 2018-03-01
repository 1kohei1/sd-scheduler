import * as React from 'react';


import InitialProps from '../models/InitialProps';
import Api from '../utils/Api';
import AppLayout from '../components/AppLayout';
import FormLayout from '../components/FormLayout';

export interface GroupsProps {
  isVerified: boolean;
  message: string;
}

export default class Groups extends React.Component<GroupsProps, any> {
  static async getInitialProps(context: InitialProps) {
    const { authenticationToken } = context.query;

    try {
      await Api.verifyGroupAuthenticationToken(authenticationToken);
      return {
        isVerified: true,
        message: '',
      }
    } catch (err) {
      return {
        isVerified: false,
        message: err.message,
      }
    }
  }

  render() {
    return (
      <AppLayout>
        <FormLayout>
          {this.props.isVerified ? (
            <div>
              <h2>Your authentication is verified!</h2>
              <p>Please close this tab and fill the group info to schedule your final presentation!</p>
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
