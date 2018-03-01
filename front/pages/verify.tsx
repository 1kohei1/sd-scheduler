import * as React from 'react';
import Link from 'next/link';
import { Alert } from 'antd';

import AppLayout from '../components/AppLayout';
import FormLayout from '../components/FormLayout';
import InitialProps from '../models/InitialProps';
import UserUtil from '../utils/UserUtil';
import Api from '../utils/Api';

export interface VerifyProps {
  _id: string | undefined;
}

interface VerifyState {
  err: string;
  message: string;
}

export default class Verify extends React.Component<VerifyProps, any> {
  static async getInitialProps(context: InitialProps) {
    try {
      const faculties = await Api.getFaculties(`verifyToken=${context.query.token}`);

      if (!faculties || faculties.length === 0) {
        return {
          _id: undefined,
        }
      } else {
        const faculty = faculties[0];
        return {
          _id: faculties[0]._id,
        }
      }
    } catch (err) {
      return {
        _id: undefined,
      }
    }
  }

  constructor(props: VerifyProps) {
    super(props);

    this.state = {
      err: '',
      message: '',
    };
  }

  async componentDidMount() {
    if (this.props._id) {
      try {
        await Api.updateFaculty(this.props._id, {
          verifyToken: '',
          verify_at: new Date(),
          emailVerified: true,
        });
        this.setState({
          message: 'Your email is verified',
        })
      } catch (err) {
        this.setState({
          err: err.message,
        })
      }
    } else {
      this.setState({
        err: 'Token is invalid',
      })
    }
  }

  render() {
    return (
      <AppLayout>
        <FormLayout>
          {this.state.err && (
            <Alert message={this.state.err} type="error" style={{ marginBottom: '24px' }} />
          )}
          {this.state.message && (
            <Alert message={this.state.message} type="success" style={{ marginBottom: '24px' }} />
          )}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Link href="/dashboard">
              <a>Go to dashboard</a>
            </Link>
          </div>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Link href="/account">
              <a>Go to account</a>
            </Link>
          </div>
        </FormLayout>
      </AppLayout>
    );
  }
}
