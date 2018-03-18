import * as React from 'react';

import InitialProps from '../models/InitialProps';
import AppLayout from '../components/AppLayout';
import FormLayout from '../components/FormLayout';
import UserUtil from '../utils/UserUtil';
import Api from '../utils/Api';
import { Semester } from '../models/Semester';
import Faculty from '../models/Faculty';
import ImportGroups from '../components/ImportGroups';

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
      <AppLayout>
        <FormLayout>
          <h1>System administrator menu</h1>
          <ImportGroups />
        </FormLayout>
      </AppLayout>
    );
  }
}
