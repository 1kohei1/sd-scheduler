import * as React from 'react';

import InitialProps from '../models/InitialProps';
import AppLayout from '../components/AppLayout';
import UserUtil from '../utils/UserUtil';
import Api from '../utils/Api';
import FacultyState from '../components/FacultyState';
import CreateGroup from '../components/CreateGroup';
import CreateSemester from '../components/CreateSemester';

export interface AdminProps {
}

interface AdminState {
}

export default class Admin extends React.Component<AdminProps, AdminState> {
  static async getInitialProps(context: InitialProps) {
    const user = await UserUtil.checkAuthentication(context);
    if (!user || !user.isSystemAdmin) {
      Api.redirect(context, '/dashboard');
    }

    return {};
  }

  render() {
    return (
      <AppLayout
        selectedMenu={['admin']}
      >
        <div className="container">
          <h1>System administrator menu</h1>
          <FacultyState />
          <CreateGroup />
          <CreateSemester />
        </div>
        <style jsx>{`
          .container {
            max-width: 800px;
            margin: auto;
            margin-top: 100px;
            padding: 0 16px;
          }
        `}</style>
      </AppLayout>
    );
  }
}
