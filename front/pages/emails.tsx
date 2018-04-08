import * as React from 'react';
import { List } from 'immutable';

import AppLayout from '../components/AppLayout';
import InitialProps from '../models/InitialProps';
import Api from '../utils/Api';
import Loading from '../components/Loading';
import UserUtil from '../utils/UserUtil';
import Faculty from '../models/Faculty';

export interface EmailsProps {
}

interface EmailsState {
  loading: boolean;
  faculties: Faculty[];
  errs: List<string>;
}

export default class Emails extends React.Component<EmailsProps, EmailsState> {
  static async getInitialProps(context: InitialProps) {
    await UserUtil.checkAuthentication(context);
    return {};
  }

  constructor(props: EmailsProps) {
    super(props);

    this.state = {
      loading: true,
      faculties: [],
      errs: List<string>(),
    }
  }

  componentDidMount() {
    this.getFaculties();
  }

  onErr(err: string) {
    this.setState((prevState: EmailsState, props: EmailsProps) => {
      return {
        errs: prevState.errs.push(err),
        loading: false,
      };
    });
  }

  private async getFaculties() {
    try {
      const faculties = await Api.getFaculties();
      this.setState({
        faculties,
        loading: false,
      });
    } catch (err) {
      this.onErr(err.message);
    }
  }

  render() {
    return (
      <AppLayout
        selectedMenu={['emails']}
      >
        <div className="container">
          <h1>Emails</h1>
          {this.state.loading ? <Loading />: (
            <div>Display checkbox for faculties</div>
          )}
        </div>
        <style jsx>
          {`
          .container {
            padding: 32px;
          }
        `}
        </style>
      </AppLayout>
    );
  }
}
