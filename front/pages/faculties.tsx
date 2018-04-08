import * as React from 'react';
import { List } from 'immutable';

import AppLayout from '../components/AppLayout';
import InitialProps from '../models/InitialProps';
import Api from '../utils/Api';
import Loading from '../components/Loading';
import UserUtil from '../utils/UserUtil';
import Faculty from '../models/Faculty';

export interface FacultiesPageProps {
}

interface FacultiesPageState {
  loading: boolean;
  faculties: Faculty[];
  errs: List<string>;
}

export default class FacultiesPage extends React.Component<FacultiesPageProps, FacultiesPageState> {
  static async getInitialProps(context: InitialProps) {
    await UserUtil.checkAuthentication(context);
    return {};
  }

  constructor(props: FacultiesPageProps) {
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
    this.setState((prevState: FacultiesPageState, props: FacultiesPageProps) => {
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
      this.onErr(err);
    }
  }

  render() {
    return (
      <AppLayout
        selectedMenu={['faculties']}
      >
        <div className="container">
          <h1>Faculties</h1>
          {this.state.loading && <Loading />}
          {!this.state.loading && (
            <div>Display faculties</div>
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
