import * as React from 'react';
import Router from 'next/router';
import { Menu } from 'antd';
import Link from 'next/link'

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
  }

  render() {
    return (
      <Menu
        style={{ width: '200px', minHeight: "calc(100vh - 64px)", height: '100%' }}
        openKeys={this.props.openKeys}
        selectedKeys={this.props.selectedKeys}
        mode="inline"
      >
        {this.props.semesters.map(semester => (
          <Menu.SubMenu
            key={semester.key}
            title={semester.displayName}
            onTitleClick={this.props.onSubMenuTitleClick}
          >
            {Menus.map(menu => (
              <Menu.Item key={`${semester.key}_${menu.key}`}>
                <Link
                  as={`/dashboard/${semester.key}/${menu.key}`}
                  href={`/dashboard?semester=${semester.key}&menu=${menu.key}&openKeys=${this.props.openKeys.join(',')}`}
                >
                  <a>{menu.displayName}</a>
                </Link>
              </Menu.Item>

            ))}
          </Menu.SubMenu>
        ))}

      </Menu>
    );
  }
}
