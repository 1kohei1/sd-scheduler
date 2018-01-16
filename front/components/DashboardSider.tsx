import * as React from 'react';
import Router from 'next/router';
import { Menu } from 'antd';

import { Semester, Menus } from '../models/Semester';
import { ClickParam } from 'antd/lib/menu';

export interface DashboardSiderProps {
  semesters: Semester[];
  openKeys: string[];
  selectedKeys: string[];
  onSubMenuTitleClick: (param: ClickParam) => void;
}

export default class DashboardSider extends React.Component<DashboardSiderProps, any> {
  constructor(props: DashboardSiderProps) {
    super(props);
    this.onMenuItemClick = this.onMenuItemClick.bind(this);
  }

  onMenuItemClick({key}: ClickParam) {
    let year: string, season: string, menu: string;
    [year, season, menu] = key.split("_");
    const semester = `${year}_${season}`;
    const openKeys = this.props.openKeys.join(',');

    Router.push({
      pathname: '/dashboard',
      query: {
        semester,
        menu,
        openKeys
      }
    }, `/dashboard/${year}_${season}/${menu}`);
  }

  render() {
    return (
      <Menu 
        style={{ width: '200px', height: "calc(100vh - 64px)" }}
        openKeys={this.props.openKeys}
        selectedKeys={this.props.selectedKeys}
        onClick={this.onMenuItemClick}
        mode="inline"
      >
        { this.props.semesters.map(semester => (
          <Menu.SubMenu 
            key={semester.key}
            title={semester.displayName}
            onTitleClick={this.props.onSubMenuTitleClick}
          >
            { Menus.map(menu => (
              <Menu.Item key={`${semester.key}_${menu.key}`}>
                {menu.displayName}
              </Menu.Item>
            )) }
          </Menu.SubMenu>
        )) }

      </Menu>
    );
  }
}
