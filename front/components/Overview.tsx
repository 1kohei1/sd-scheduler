import * as React from 'react';
import * as shortid from 'shortid';
import { Row, Col, Card, Button, Divider } from 'antd';

export interface DashboardContentProps {
  year: number;
  semester: string;
}

const faculties = [{
  email: 'aaa@aaa.com',
  name: 'AAA AAA'
}, {
  email: 'bbb@bbb.com',
  name: 'BBB BBB'
}, {
  email: 'ccc@ccc.com',
  name: 'CCC CCC'
}];

export default class DashboardContent extends React.Component<DashboardContentProps, any> {
  render() {
    const isAdmin = true;
    const isArchived = false;

    const dateExtra = isAdmin && !isArchived ? (
      <Button ghost type="primary" size="small">Edit date</Button>
    ) : (``);
    const locationExtra = isAdmin && !isArchived ? (
      <Button ghost type="primary" size="small">Edit location</Button>
    ) : (``);
    const facultyExtra = isAdmin && !isArchived ? (
      <Button ghost type="primary" size="small">Edit faculties</Button>
    ) : (``);

    return (
      <div>
        {/* Overview */}
        <h1>Overview</h1>
        <Card title="Date" extra={dateExtra} style={{ marginBottom: '16px' }}>
          <div>11/28 10:00AM - 6:00PM</div>
          <div>11/30 10:00AM - 6:00PM</div>
          <div>12/01 10:00AM - 6:00PM</div>
        </Card>
        <Card title="Location" extra={locationExtra} style={{ marginBottom: '16px' }}>
          <div>HEC 450</div>
        </Card>
        <Card title="Faculties" extra={facultyExtra} style={{ marginBottom: '16px' }}>
          {faculties.map((faculty: any) => (
            <div key={shortid.generate()}>{faculty.name} | {faculty.email}</div>
          ))}
        </Card>
      </div>
    );
  }
}