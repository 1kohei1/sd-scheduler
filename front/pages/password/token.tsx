import * as React from 'react';
import { Form, Icon, Input, Button, Alert } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';

import AppLayout from '../../components/AppLayout';
import FormLayout from '../../components/FormLayout';
import InitialProps from '../../models/InitialProps';
import Api from '../../utils/Api';

export interface TokenProps {
  form: WrappedFormUtils
}

class Token extends React.Component<TokenProps, any> {
  static async getInitialProps(context: InitialProps) {
    // Check if token is valid or not. If not valid, API redirects to /password
    const faculties = await Api.getFaculties(`token=${context.query.token}`);

    if (faculties.length === 0 || new Date(faculties[0]).valueOf() < new Date().valueOf()) {
      Api.redirect(context, '/password', {
        err: 'Token has expired. Please send another password reset email',
      })
    }
    return {};
  }

  render() {
    return (
      <AppLayout>
        <FormLayout>
          Password reset.
        </FormLayout>
      </AppLayout>
    );
  }
}

export default Form.create()(Token);