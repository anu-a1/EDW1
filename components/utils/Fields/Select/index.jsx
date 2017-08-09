import React from 'react';
import {Creatable} from 'react-select';
import 'react-select/dist/react-select.css';

import selectDefaultProps from './_defaultProps';
import StateFullSelect from './StateFullSelectView';
import CaseSelectClass from './CaseSelect';
import MultiSelectClass from './MultiSelect';
import BSSelectClass from './BSSelect';

export const StateFullSelectView = StateFullSelect;
export const CaseSelect = CaseSelectClass;
export const MultiSelect = MultiSelectClass;
export const BSSelect = BSSelectClass;

export default ({useDropUpSelect,...selectProps}) => {
    const props = {
        ...selectDefaultProps,
        ...selectProps
    };
    return useDropUpSelect ? <BSSelect {...props}/> : <Creatable {...props} />;
};
