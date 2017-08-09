import React from 'react';

export default ({children, item, sourceName, enableDragPreview, ...props}) => (
    <tr {...props}>{children}</tr>
);

