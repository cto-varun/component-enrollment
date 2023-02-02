import React from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

export default (props) => {
    const {
        title = 'Heading',
        level = 2,
        color = '#444',
        paddingBottom = '30px',
        styles = {},
        box = null,
        contentClassName = null,
    } = props;
    return (
        <Title
            level={level}
            style={{
                color: color,
                paddingBottom: paddingBottom,
                ...styles,
            }}
        >
            <div className={contentClassName}>{title}</div>
        </Title>
    );
};
