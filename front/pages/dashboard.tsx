import * as React from 'react';
import { Set } from 'immutable';
import { Layout } from 'antd';

import InitialProps from '../models/InitialProps';
import AppLayout from '../components/AppLayout';
import DashboardSider from '../components/DashboardSider';
import { Semester } from '../models/Semester';
import { ClickParam } from 'antd/lib/menu';

export interface DashboardProps {
  url: InitialProps;
  semesters: Semester[];
}

interface DashboardState {
  year: string;
  season: string;
  menu: string;
  openKeys: Set<string>;
}

export default class Dashboard extends React.Component<DashboardProps, DashboardState> {
  static async getInitialProps(context: InitialProps) {
    // Get list of semesters to display in the left column
    console.log('getInitialProps');
    return {
      semesters: [{
        key: '2018_spring',
        displayName: '2018 Spring'
      }, {
        key: '2017_fall',
        displayName: '2017 Fall'
      }, {
        key: '2017_summer',
        displayName: '2017 Summer'
      }, {
        key: '2017_spring',
        displayName: '2017 Spring'
      }]
    };
  }

  constructor(props: DashboardProps) {
    super(props);
    this.onSubMenuTitleClick = this.onSubMenuTitleClick.bind(this);
  }

  // constructor(props: DashboardProps) {
  //   super(props);
  //   this.state = {
  //     year: SemesterUtil.currentYear(),
  //     season: SemesterUtil.currentYear(),
  //     menu: SemesterUtil.defaultMenu,
  //     openKeys: Set()
  //   }
  // }

  componentWillReceiveProps(nextProps: any) {
    console.log('componentWillReceiveProps', nextProps);
    // let newState: any = {};
    // if (SemesterUtil.isValidYear(nextProps.url.query.year)) {
    //   newState.year = nextProps.url.query.year;
    // }
    // if (SemesterUtil.isValidSeason(nextProps.url.query.season)) {
    //   newState.season = nextProps.url.query.season;
    // }
    // if (SemesterUtil.isValidMenu(nextProps.url.query.menu)) {
    //   newState.menu = nextProps.url.query.menu;
    // }
    // this.setState((prevState, props) => {
    //   const year = newState.year ? newState.year : prevState.year;
    //   const season = newState.season ? newState.season : prevState.season;
    //   const key = SemesterUtil.convertToKey(year, season);
      
    //   if (prevState.openKeys.includes(key)) {
    //     newState.openKeys = prevState.openKeys.delete(key);
    //   } else {
    //     newState.openKeys = prevState.openKeys.add(key);
    //   }
    //   return newState;
    // });
  }

  onSubMenuTitleClick({key}: ClickParam) {
    // this.setState((prevState, props) => {
    //   if (prevState.openKeys.includes(key)) {
    //     return {
    //       openKeys: prevState.openKeys.delete(key)
    //     }
    //   } else {
    //     return {
    //       openKeys: prevState.openKeys.add(key)
    //     }
    //   }
    // });
  }

  render() {
    const semesters = []
    return (
      <AppLayout>
        <Layout>
          <Layout.Sider style={{ position: 'fixed' }}>
            <DashboardSider 
              semesters={this.props.semesters} 
              openKeys={["2018_spring"]}
              selectedKeys={["2018_spring_overview"]}
              onSubMenuTitleClick={this.onSubMenuTitleClick}  
            />
          </Layout.Sider>
        </Layout>
      </AppLayout>
    );
  }
}

