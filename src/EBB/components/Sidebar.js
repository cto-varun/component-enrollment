import React from 'react';
import { DatePicker, Input, Menu, Dropdown, Divider } from 'antd';
import { SearchOutlined, DownOutlined } from '@ant-design/icons';

// components
import Heading from './Heading';
import { component as Timeline } from '@ivoyant/component-timeline';

const prefixSearch = (
    <SearchOutlined
        style={{
            fontSize: 16,
            color: "rgb(152, 152, 152)"
        }}
    />
);

const { RangePicker } = DatePicker;

const menu = (
    <Menu>
        <Menu.Item>
            <a target="_blank" rel="noopener noreferrer">
                1st menu item
        </a>
        </Menu.Item>
        <Menu.Item>
            <a target="_blank" rel="noopener noreferrer">
                2nd menu item
        </a>
        </Menu.Item>
    </Menu>
);

export default function Sidebar({ timelineProps, timelineData }) {
    return (
        <div>
            <Heading
                title="EBB History Timeline"
                level={4}
                color="rgb(152, 152, 152)"
            />
            <div className="search-input-container">
                <div className="search-input-wrapper">
                    <Input
                        placeholder="Search"
                        size="large"
                        prefix={prefixSearch}
                        onSearch={() => {

                        }}
                    />
                </div>
                <RangePicker
                    format={"DD MMM"}
                    picker="date"
                    className="ebb-range-picker"
                    suffixIcon={false}
                />
            </div>
            <div>
                <div className="sidebar-dropdown-container">
                    <Dropdown menu={menu}>
                        <a className="ant-dropdown-link sidebar-dropdown" onClick={e => e.preventDefault()}>
                            FILTER BY <DownOutlined />
                        </a>
                    </Dropdown>
                    <Divider />
                </div>
                <Timeline
                    data={{
                        data: {
                            accountEvents: timelineData
                        }
                    }}
                    properties={timelineProps}
                />
            </div>
        </div>
    )
}